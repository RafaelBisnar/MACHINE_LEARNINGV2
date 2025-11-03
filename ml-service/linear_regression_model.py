"""
Linear Regression Model for Character Guessing Game
Predicts character difficulty based on game statistics
"""

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import json
import pickle
from typing import List, Dict, Tuple

class CharacterDifficultyPredictor:
    """
    Uses Linear Regression to predict character difficulty
    Features: number of powers, universe popularity, name length, etc.
    Target: average number of guesses needed (difficulty score)
    """
    
    def __init__(self):
        self.model = LinearRegression()
        self.scaler = StandardScaler()
        self.characters = []
        self.is_trained = False
        
    def extract_features(self, character: Dict) -> np.ndarray:
        """
        Extract numerical features from character data
        Returns: feature vector [num_powers, name_length, universe_encoded, num_aliases, quote_length]
        """
        features = []
        
        # 1. Number of powers (more powers might be harder to guess)
        num_powers = len(character.get('attributes', {}).get('powers', []))
        features.append(num_powers)
        
        # 2. Name length (longer names might be harder)
        name_length = len(character.get('name', ''))
        features.append(name_length)
        
        # 3. Universe encoding (Marvel=1, DC=2, Other=0)
        universe = character.get('universe', 'Other')
        universe_encoded = 1 if universe == 'Marvel' else (2 if universe == 'DC' else 0)
        features.append(universe_encoded)
        
        # 4. Number of aliases (more aliases = easier to guess)
        num_aliases = len(character.get('aliases', []))
        features.append(num_aliases)
        
        # 5. Quote length (longer quote = more hints)
        quote_length = len(character.get('quote', ''))
        features.append(quote_length)
        
        # 6. Alignment encoding (hero=1, villain=2, anti-hero=3)
        alignment = character.get('attributes', {}).get('alignment', 'hero')
        alignment_encoded = 1 if alignment == 'hero' else (2 if alignment == 'villain' else 3)
        features.append(alignment_encoded)
        
        return np.array(features)
    
    def generate_synthetic_difficulty_scores(self, characters: List[Dict]) -> np.ndarray:
        """
        Generate synthetic difficulty scores based on character attributes
        In production, this would come from actual game data
        """
        difficulty_scores = []
        
        for char in characters:
            # Base difficulty
            base_score = 5.0
            
            # Adjust based on features
            num_powers = len(char.get('attributes', {}).get('powers', []))
            num_aliases = len(char.get('aliases', []))
            name_length = len(char.get('name', ''))
            
            # More powers = slightly harder
            base_score += (num_powers - 3) * 0.3
            
            # More aliases = easier (more ways to guess)
            base_score -= (num_aliases - 2) * 0.5
            
            # Longer names = slightly harder
            if name_length > 12:
                base_score += 1.0
            
            # Popular characters are easier
            popular_names = ['Spider-Man', 'Batman', 'Superman', 'Iron Man', 'Captain America']
            if char.get('name') in popular_names:
                base_score -= 2.0
            
            # Add some randomness to simulate real game variance
            base_score += np.random.normal(0, 0.5)
            
            # Clamp between 1 and 15
            difficulty_scores.append(max(1.0, min(15.0, base_score)))
        
        return np.array(difficulty_scores)
    
    def train(self, characters: List[Dict]) -> Dict:
        """
        Train the linear regression model
        """
        if not characters:
            raise ValueError("No characters provided for training")
        
        self.characters = characters
        
        # Extract features
        X = np.array([self.extract_features(char) for char in characters])
        
        # Generate synthetic target values (difficulty scores)
        # In production, use actual game statistics
        y = self.generate_synthetic_difficulty_scores(characters)
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model.fit(X_scaled, y)
        
        # Calculate metrics
        train_score = self.model.score(X_scaled, y)
        predictions = self.model.predict(X_scaled)
        mae = np.mean(np.abs(predictions - y))
        rmse = np.sqrt(np.mean((predictions - y) ** 2))
        
        self.is_trained = True
        
        return {
            'r2_score': float(train_score),
            'mae': float(mae),
            'rmse': float(rmse),
            'num_features': X.shape[1],
            'num_samples': X.shape[0],
            'coefficients': self.model.coef_.tolist(),
            'intercept': float(self.model.intercept_)
        }
    
    def predict_difficulty(self, character: Dict) -> Dict:
        """
        Predict difficulty score for a character
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Extract features
        features = self.extract_features(character).reshape(1, -1)
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict
        difficulty = self.model.predict(features_scaled)[0]
        
        # Determine difficulty level
        if difficulty < 3:
            level = "Very Easy"
        elif difficulty < 5:
            level = "Easy"
        elif difficulty < 7:
            level = "Medium"
        elif difficulty < 10:
            level = "Hard"
        else:
            level = "Very Hard"
        
        return {
            'character_name': character.get('name'),
            'difficulty_score': float(difficulty),
            'difficulty_level': level,
            'estimated_guesses': int(round(difficulty)),
            'features': {
                'num_powers': len(character.get('attributes', {}).get('powers', [])),
                'name_length': len(character.get('name', '')),
                'num_aliases': len(character.get('aliases', [])),
                'universe': character.get('universe')
            }
        }
    
    def predict_all_difficulties(self) -> List[Dict]:
        """
        Predict difficulty for all characters
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        results = []
        for char in self.characters:
            prediction = self.predict_difficulty(char)
            results.append(prediction)
        
        # Sort by difficulty
        results.sort(key=lambda x: x['difficulty_score'])
        
        return results
    
    def get_feature_importance(self) -> Dict:
        """
        Get feature importance (coefficients)
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before getting feature importance")
        
        feature_names = [
            'num_powers',
            'name_length', 
            'universe',
            'num_aliases',
            'quote_length',
            'alignment'
        ]
        
        coefficients = self.model.coef_.tolist()
        
        importance = {}
        for name, coef in zip(feature_names, coefficients):
            importance[name] = {
                'coefficient': float(coef),
                'impact': 'increases' if coef > 0 else 'decreases',
                'magnitude': abs(float(coef))
            }
        
        return {
            'intercept': float(self.model.intercept_),
            'features': importance
        }
    
    def save_model(self, filepath: str = 'linear_regression_model.pkl'):
        """
        Save trained model to file
        """
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'characters': self.characters
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
        
        print(f"✓ Model saved to {filepath}")
    
    def load_model(self, filepath: str = 'linear_regression_model.pkl'):
        """
        Load trained model from file
        """
        try:
            with open(filepath, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.characters = model_data['characters']
            self.is_trained = True
            
            print(f"✓ Model loaded from {filepath}")
            return True
        except FileNotFoundError:
            print(f"✗ Model file not found: {filepath}")
            return False


if __name__ == "__main__":
    # Test the model
    print("Testing Linear Regression Model...")
    
    # Load character data
    try:
        with open('characters.json', 'r', encoding='utf-8') as f:
            characters = json.load(f)
        
        print(f"Loaded {len(characters)} characters")
        
        # Create and train model
        predictor = CharacterDifficultyPredictor()
        metrics = predictor.train(characters)
        
        print("\nTraining Results:")
        print(f"  R² Score: {metrics['r2_score']:.4f}")
        print(f"  MAE: {metrics['mae']:.4f}")
        print(f"  RMSE: {metrics['rmse']:.4f}")
        print(f"  Features: {metrics['num_features']}")
        
        # Get feature importance
        print("\nFeature Importance:")
        importance = predictor.get_feature_importance()
        for feature, info in importance['features'].items():
            print(f"  {feature}: {info['coefficient']:.4f} ({info['impact']} difficulty)")
        
        # Predict difficulties
        print("\nTop 5 Easiest Characters:")
        all_predictions = predictor.predict_all_difficulties()
        for pred in all_predictions[:5]:
            print(f"  {pred['character_name']}: {pred['difficulty_score']:.2f} ({pred['difficulty_level']})")
        
        print("\nTop 5 Hardest Characters:")
        for pred in all_predictions[-5:]:
            print(f"  {pred['character_name']}: {pred['difficulty_score']:.2f} ({pred['difficulty_level']})")
        
        # Save model
        predictor.save_model()
        
    except FileNotFoundError:
        print("Error: characters.json not found. Run export_characters.py first.")
