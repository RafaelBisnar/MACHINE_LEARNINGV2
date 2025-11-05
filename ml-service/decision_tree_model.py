"""
Decision Tree Model for Character Classification and Difficulty Prediction

This module provides two Decision Tree models:
1. Character Classification: Predict character ID based on engineered features
2. Difficulty Regression: Predict character difficulty (0-10 scale)

Key Features:
- Interpretable decision rules
- Feature importance analysis
- Tree visualization (SVG/PNG)
- Works with structured/engineered features
- No feature scaling required
"""

import numpy as np
import json
import pickle
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor, export_text, plot_tree
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import io
import base64


class CharacterDecisionTree:
    """
    Decision Tree model for character classification and difficulty prediction
    
    Uses engineered features:
    - Text features: TF-IDF from quotes (reduced dimensions)
    - Numerical features: powers_count, name_length, quote_length
    - Categorical features: universe (Marvel/DC), genre (encoded)
    """
    
    def __init__(self, max_depth=10, min_samples_split=2, min_samples_leaf=1):
        """
        Initialize Decision Tree models
        
        Args:
            max_depth: Maximum depth of tree (prevents overfitting)
            min_samples_split: Min samples required to split node
            min_samples_leaf: Min samples required at leaf node
        """
        # Classifier for character prediction
        self.classifier = DecisionTreeClassifier(
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            random_state=42
        )
        
        # Regressor for difficulty prediction
        self.regressor = DecisionTreeRegressor(
            max_depth=max_depth,
            min_samples_split=min_samples_split,
            min_samples_leaf=min_samples_leaf,
            random_state=42
        )
        
        self.vectorizer = TfidfVectorizer(max_features=50, ngram_range=(1, 2))
        self.label_encoder = LabelEncoder()
        self.universe_encoder = LabelEncoder()
        self.genre_encoder = LabelEncoder()
        
        self.is_trained_classifier = False
        self.is_trained_regressor = False
        self.feature_names = []
        self.class_names = []
        
        self.train_accuracy = 0.0
        self.test_accuracy = 0.0
        self.train_r2 = 0.0
        self.test_r2 = 0.0
        self.cv_scores = []
        
    def _extract_features(self, characters, fit=False):
        """
        Extract and engineer features from character data
        
        Returns:
            X: Feature matrix
            y_cls: Character IDs for classification
            y_reg: Difficulty scores for regression
        """
        # Collect text for TF-IDF
        texts = []
        for char in characters:
            quote = char.get('quote', '') or ''
            name = char.get('name', '') or ''
            description = char.get('description', '') or ''
            text = f"{quote} {name} {description}"
            texts.append(text)
        
        # TF-IDF features (reduced to 50 dimensions)
        if fit:
            tfidf_features = self.vectorizer.fit_transform(texts).toarray()
        else:
            tfidf_features = self.vectorizer.transform(texts).toarray()
        
        # Engineered features
        X = []
        y_cls = []
        y_reg = []
        universes = []
        genres = []
        
        for i, char in enumerate(characters):
            # Basic features
            powers_count = len(char.get('powers', []))
            name_length = len(char.get('name', '') or '')
            quote_length = len(char.get('quote', '') or '')
            description_length = len(char.get('description', '') or '')
            
            # Categorical features
            universe = char.get('universe', 'Unknown')
            genre = char.get('genre', 'Unknown')
            universes.append(universe)
            genres.append(genre)
            
            # Combine features
            feature_vector = [
                powers_count,
                name_length,
                quote_length,
                description_length
            ] + tfidf_features[i].tolist()
            
            X.append(feature_vector)
            y_cls.append(char['id'])
            y_reg.append(char.get('difficulty', 5))  # Default difficulty = 5
        
        # Encode categorical features
        if fit:
            universe_encoded = self.universe_encoder.fit_transform(universes)
            genre_encoded = self.genre_encoder.fit_transform(genres)
        else:
            universe_encoded = self.universe_encoder.transform(universes)
            genre_encoded = self.genre_encoder.transform(genres)
        
        # Add encoded features to X
        X = np.array(X)
        X = np.column_stack([X, universe_encoded, genre_encoded])
        
        # Build feature names
        if fit:
            self.feature_names = [
                'powers_count',
                'name_length',
                'quote_length',
                'description_length'
            ] + [f'tfidf_{i}' for i in range(50)] + ['universe', 'genre']
        
        return X, y_cls, y_reg
    
    def train(self, characters):
        """
        Train both classifier and regressor models
        
        Args:
            characters: List of character dictionaries
            
        Returns:
            metrics: Dictionary with training metrics
        """
        print(f"\nTraining Decision Tree with {len(characters)} characters...")
        
        # Extract features
        X, y_cls, y_reg = self._extract_features(characters, fit=True)
        
        # Encode classification labels
        y_cls_encoded = self.label_encoder.fit_transform(y_cls)
        self.class_names = self.label_encoder.classes_.tolist()
        
        # Check if we can do train-test split
        unique_labels, label_counts = np.unique(y_cls_encoded, return_counts=True)
        can_split = all(count >= 2 for count in label_counts) and len(characters) > 5
        
        if can_split:
            # Split data
            X_train, X_test, ytrain_cls, ytest_cls, ytrain_reg, ytest_reg = train_test_split(
                X, y_cls_encoded, y_reg, test_size=0.2, random_state=42, stratify=y_cls_encoded
            )
        else:
            # Use all data for training
            X_train = X_test = X
            ytrain_cls = ytest_cls = y_cls_encoded
            ytrain_reg = ytest_reg = y_reg
            print("Warning: Using all data for training (too few samples for proper split)")
        
        # Train classifier
        self.classifier.fit(X_train, ytrain_cls)
        self.train_accuracy = self.classifier.score(X_train, ytrain_cls)
        self.test_accuracy = self.classifier.score(X_test, ytest_cls)
        
        # Cross-validation scores (if enough data)
        if can_split and len(characters) >= 10:
            self.cv_scores = cross_val_score(self.classifier, X, y_cls_encoded, cv=min(5, len(unique_labels)))
        
        self.is_trained_classifier = True
        
        # Train regressor
        self.regressor.fit(X_train, ytrain_reg)
        self.train_r2 = self.regressor.score(X_train, ytrain_reg)
        self.test_r2 = self.regressor.score(X_test, ytest_reg)
        self.is_trained_regressor = True
        
        print(f"✓ Decision Tree Classifier trained! (Accuracy: {self.test_accuracy:.2%})")
        print(f"✓ Decision Tree Regressor trained! (R²: {self.test_r2:.4f})")
        
        return {
            'classifier': {
                'train_accuracy': float(self.train_accuracy),
                'test_accuracy': float(self.test_accuracy),
                'cv_scores': self.cv_scores.tolist() if len(self.cv_scores) > 0 else [],
                'cv_mean': float(np.mean(self.cv_scores)) if len(self.cv_scores) > 0 else None,
                'cv_std': float(np.std(self.cv_scores)) if len(self.cv_scores) > 0 else None,
                'n_classes': len(self.class_names),
                'n_features': len(self.feature_names),
                'tree_depth': self.classifier.get_depth(),
                'n_leaves': self.classifier.get_n_leaves()
            },
            'regressor': {
                'train_r2': float(self.train_r2),
                'test_r2': float(self.test_r2),
                'tree_depth': self.regressor.get_depth(),
                'n_leaves': self.regressor.get_n_leaves()
            },
            'n_training_samples': len(X_train),
            'n_test_samples': len(X_test)
        }
    
    def predict_character(self, character_data, top_k=5):
        """
        Predict character ID from character data
        
        Args:
            character_data: Character dictionary with features
            top_k: Number of top predictions to return
            
        Returns:
            List of predictions with probabilities
        """
        if not self.is_trained_classifier:
            raise ValueError("Classifier not trained. Call train() first.")
        
        # Extract features
        X, _, _ = self._extract_features([character_data], fit=False)
        
        # Predict probabilities
        probas = self.classifier.predict_proba(X[0:1])[0]
        
        # Get top k predictions
        top_indices = np.argsort(probas)[::-1][:top_k]
        
        predictions = []
        for idx in top_indices:
            if probas[idx] > 0:  # Only include non-zero probabilities
                predictions.append({
                    'character': self.label_encoder.inverse_transform([idx])[0],
                    'probability': float(probas[idx]),
                    'confidence': float(probas[idx] * 100)
                })
        
        return predictions
    
    def predict_difficulty(self, character_data):
        """
        Predict difficulty score for a character
        
        Args:
            character_data: Character dictionary with features
            
        Returns:
            Predicted difficulty (0-10)
        """
        if not self.is_trained_regressor:
            raise ValueError("Regressor not trained. Call train() first.")
        
        # Extract features
        X, _, _ = self._extract_features([character_data], fit=False)
        
        # Predict
        difficulty = self.regressor.predict(X[0:1])[0]
        
        # Clip to valid range
        difficulty = np.clip(difficulty, 0, 10)
        
        return float(difficulty)
    
    def get_feature_importance(self, top_n=20):
        """
        Get feature importance from classifier
        
        Args:
            top_n: Number of top features to return
            
        Returns:
            List of (feature_name, importance) tuples
        """
        if not self.is_trained_classifier:
            raise ValueError("Classifier not trained. Call train() first.")
        
        importances = self.classifier.feature_importances_
        
        # Sort by importance
        indices = np.argsort(importances)[::-1][:top_n]
        
        feature_importance = []
        for idx in indices:
            if importances[idx] > 0:  # Only include non-zero importance
                feature_importance.append({
                    'feature': self.feature_names[idx],
                    'importance': float(importances[idx])
                })
        
        return feature_importance
    
    def get_decision_rules(self, max_depth=3):
        """
        Get human-readable decision rules from classifier
        
        Args:
            max_depth: Maximum depth to export
            
        Returns:
            String with decision rules
        """
        if not self.is_trained_classifier:
            raise ValueError("Classifier not trained. Call train() first.")
        
        rules = export_text(
            self.classifier,
            feature_names=self.feature_names,
            max_depth=max_depth,
            decimals=2
        )
        
        return rules
    
    def visualize_tree(self, tree_type='classifier', max_depth=3):
        """
        Generate tree visualization as base64-encoded PNG
        
        Args:
            tree_type: 'classifier' or 'regressor'
            max_depth: Maximum depth to visualize
            
        Returns:
            Base64-encoded PNG image
        """
        if tree_type == 'classifier':
            if not self.is_trained_classifier:
                raise ValueError("Classifier not trained. Call train() first.")
            model = self.classifier
            class_names = [str(c) for c in self.class_names]
        else:
            if not self.is_trained_regressor:
                raise ValueError("Regressor not trained. Call train() first.")
            model = self.regressor
            class_names = None
        
        # Create figure
        fig, ax = plt.subplots(figsize=(20, 12))
        
        # Plot tree
        plot_tree(
            model,
            feature_names=self.feature_names,
            class_names=class_names,
            filled=True,
            rounded=True,
            fontsize=8,
            max_depth=max_depth,
            ax=ax
        )
        
        ax.set_title(f"Decision Tree - {tree_type.capitalize()}", fontsize=16, fontweight='bold')
        
        # Convert to base64
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight', dpi=100)
        plt.close(fig)
        buf.seek(0)
        
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        return img_base64
    
    def get_model_info(self):
        """
        Get information about trained models
        
        Returns:
            Dictionary with model information
        """
        info = {
            'classifier': {
                'is_trained': self.is_trained_classifier,
                'n_classes': len(self.class_names) if self.is_trained_classifier else 0,
                'classes': self.class_names if self.is_trained_classifier else [],
                'train_accuracy': float(self.train_accuracy) if self.is_trained_classifier else 0,
                'test_accuracy': float(self.test_accuracy) if self.is_trained_classifier else 0,
                'cv_mean': float(np.mean(self.cv_scores)) if len(self.cv_scores) > 0 else None,
                'tree_depth': self.classifier.get_depth() if self.is_trained_classifier else 0,
                'n_leaves': self.classifier.get_n_leaves() if self.is_trained_classifier else 0
            },
            'regressor': {
                'is_trained': self.is_trained_regressor,
                'train_r2': float(self.train_r2) if self.is_trained_regressor else 0,
                'test_r2': float(self.test_r2) if self.is_trained_regressor else 0,
                'tree_depth': self.regressor.get_depth() if self.is_trained_regressor else 0,
                'n_leaves': self.regressor.get_n_leaves() if self.is_trained_regressor else 0
            },
            'n_features': len(self.feature_names),
            'feature_names': self.feature_names
        }
        
        return info
    
    def save_model(self, filepath):
        """Save model to file"""
        with open(filepath, 'wb') as f:
            pickle.dump({
                'classifier': self.classifier,
                'regressor': self.regressor,
                'vectorizer': self.vectorizer,
                'label_encoder': self.label_encoder,
                'universe_encoder': self.universe_encoder,
                'genre_encoder': self.genre_encoder,
                'feature_names': self.feature_names,
                'class_names': self.class_names,
                'is_trained_classifier': self.is_trained_classifier,
                'is_trained_regressor': self.is_trained_regressor,
                'train_accuracy': self.train_accuracy,
                'test_accuracy': self.test_accuracy,
                'train_r2': self.train_r2,
                'test_r2': self.test_r2,
                'cv_scores': self.cv_scores
            }, f)
    
    def load_model(self, filepath):
        """Load model from file"""
        with open(filepath, 'rb') as f:
            data = pickle.load(f)
            self.classifier = data['classifier']
            self.regressor = data['regressor']
            self.vectorizer = data['vectorizer']
            self.label_encoder = data['label_encoder']
            self.universe_encoder = data['universe_encoder']
            self.genre_encoder = data['genre_encoder']
            self.feature_names = data['feature_names']
            self.class_names = data['class_names']
            self.is_trained_classifier = data['is_trained_classifier']
            self.is_trained_regressor = data['is_trained_regressor']
            self.train_accuracy = data['train_accuracy']
            self.test_accuracy = data['test_accuracy']
            self.train_r2 = data['train_r2']
            self.test_r2 = data['test_r2']
            self.cv_scores = data['cv_scores']


# Test code
if __name__ == "__main__":
    # Sample test data
    test_characters = [
        {
            "id": "spider-man",
            "name": "Spider-Man",
            "quote": "With great power comes great responsibility.",
            "source": "Spider-Man",
            "universe": "Marvel",
            "genre": "Superhero Action",
            "powers": ["web-slinging", "wall-crawling", "spider-sense"],
            "difficulty": 7,
            "description": "A young hero with spider powers"
        },
        {
            "id": "iron-man",
            "name": "Iron Man",
            "quote": "I am Iron Man.",
            "source": "Iron Man",
            "universe": "Marvel",
            "genre": "Superhero Action",
            "powers": ["powered armor", "genius intellect", "flight"],
            "difficulty": 6,
            "description": "Genius billionaire in powered armor"
        },
        {
            "id": "batman",
            "name": "Batman",
            "quote": "I'm Batman.",
            "source": "Batman",
            "universe": "DC",
            "genre": "Superhero Action",
            "powers": ["martial arts", "detective skills", "gadgets"],
            "difficulty": 8,
            "description": "Dark knight detective of Gotham"
        }
    ]
    
    print("Testing Decision Tree Model...")
    
    # Initialize and train
    dt_model = CharacterDecisionTree(max_depth=5)
    metrics = dt_model.train(test_characters)
    
    print("\nTraining Metrics:")
    print(json.dumps(metrics, indent=2))
    
    # Test character prediction
    print("\nTesting character prediction...")
    test_char = {
        "quote": "With great power",
        "name": "Spider-Man",
        "universe": "Marvel",
        "genre": "Superhero Action",
        "powers": ["web-slinging", "spider-sense"],
        "description": "A hero with spider abilities"
    }
    
    predictions = dt_model.predict_character(test_char, top_k=3)
    print(f"\nTop 3 predictions:")
    for pred in predictions:
        print(f"  {pred['character']}: {pred['confidence']:.1f}%")
    
    # Test difficulty prediction
    difficulty = dt_model.predict_difficulty(test_char)
    print(f"\nPredicted difficulty: {difficulty:.1f}/10")
    
    # Feature importance
    print("\nTop 10 Important Features:")
    features = dt_model.get_feature_importance(top_n=10)
    for feat in features:
        print(f"  {feat['feature']}: {feat['importance']:.4f}")
    
    print("\n✓ Decision Tree model test complete!")
