"""
Naive Bayes Classifier for Character Genre/Universe Classification

This model uses Naive Bayes to classify characters into genres or universes
based on their attributes, quotes, and characteristics.
"""

import numpy as np
from sklearn.naive_bayes import MultinomialNB, GaussianNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import json


class CharacterNaiveBayes:
    """
    Naive Bayes classifier for character genre/universe prediction
    
    Uses character quotes and descriptions to predict:
    - Genre (Action, Comedy, Drama, etc.)
    - Universe (Marvel, DC, Star Wars, etc.)
    """
    
    def __init__(self):
        self.genre_model = MultinomialNB()
        self.universe_model = MultinomialNB()
        self.vectorizer = TfidfVectorizer(max_features=500, ngram_range=(1, 2))
        self.genre_encoder = LabelEncoder()
        self.universe_encoder = LabelEncoder()
        self.is_trained = False
        self.training_data = None
        
    def prepare_features(self, characters):
        """
        Prepare text features from character data
        
        Args:
            characters: List of character dictionaries
            
        Returns:
            features: Combined text features for each character
            genres: List of genre labels
            universes: List of universe labels
        """
        features = []
        genres = []
        universes = []
        
        for char in characters:
            # Combine text features
            text_features = []
            
            # Add quote
            if char.get('quote'):
                text_features.append(char['quote'])
            
            # Add source/title
            if char.get('source'):
                text_features.append(char['source'])
            
            # Add character name (can be indicative)
            if char.get('name'):
                text_features.append(char['name'])
            
            # Add any description or attributes
            if char.get('description'):
                text_features.append(char['description'])
            
            # Combine all text
            combined_text = ' '.join(text_features)
            features.append(combined_text)
            
            # Extract labels
            genre = char.get('genre', 'Unknown')
            universe = char.get('universe', 'Unknown')
            
            genres.append(genre)
            universes.append(universe)
        
        return features, genres, universes
    
    def train(self, characters):
        """
        Train both genre and universe classifiers
        
        Args:
            characters: List of character dictionaries with labels
            
        Returns:
            metrics: Dictionary containing training metrics
        """
        if len(characters) < 2:
            raise ValueError("Need at least 2 characters to train")
        
        # Prepare features
        features, genres, universes = self.prepare_features(characters)
        
        # Vectorize text features
        X = self.vectorizer.fit_transform(features)
        
        # Encode labels
        y_genre = self.genre_encoder.fit_transform(genres)
        y_universe = self.universe_encoder.fit_transform(universes)
        
        # Split data for evaluation
        X_train, X_test, y_genre_train, y_genre_test = train_test_split(
            X, y_genre, test_size=0.2, random_state=42
        )
        
        X_train_u, X_test_u, y_universe_train, y_universe_test = train_test_split(
            X, y_universe, test_size=0.2, random_state=42
        )
        
        # Train genre classifier
        self.genre_model.fit(X_train, y_genre_train)
        genre_predictions = self.genre_model.predict(X_test)
        genre_accuracy = accuracy_score(y_genre_test, genre_predictions)
        
        # Train universe classifier
        self.universe_model.fit(X_train_u, y_universe_train)
        universe_predictions = self.universe_model.predict(X_test_u)
        universe_accuracy = accuracy_score(y_universe_test, universe_predictions)
        
        self.is_trained = True
        self.training_data = {
            'num_characters': len(characters),
            'num_genres': len(self.genre_encoder.classes_),
            'num_universes': len(self.universe_encoder.classes_),
            'genres': list(self.genre_encoder.classes_),
            'universes': list(self.universe_encoder.classes_)
        }
        
        return {
            'genre_accuracy': float(genre_accuracy),
            'universe_accuracy': float(universe_accuracy),
            'num_samples': len(characters),
            'num_genres': len(self.genre_encoder.classes_),
            'num_universes': len(self.universe_encoder.classes_),
            'genre_classes': list(self.genre_encoder.classes_),
            'universe_classes': list(self.universe_encoder.classes_)
        }
    
    def predict_genre(self, text, top_k=3):
        """
        Predict genre based on text input
        
        Args:
            text: Character quote or description
            top_k: Number of top predictions to return
            
        Returns:
            List of predictions with probabilities
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Vectorize input
        X = self.vectorizer.transform([text])
        
        # Get probabilities
        probabilities = self.genre_model.predict_proba(X)[0]
        
        # Get top k predictions
        top_indices = np.argsort(probabilities)[::-1][:top_k]
        
        predictions = []
        for idx in top_indices:
            predictions.append({
                'genre': self.genre_encoder.classes_[idx],
                'probability': float(probabilities[idx]),
                'confidence': f"{probabilities[idx] * 100:.1f}%"
            })
        
        return predictions
    
    def predict_universe(self, text, top_k=3):
        """
        Predict universe based on text input
        
        Args:
            text: Character quote or description
            top_k: Number of top predictions to return
            
        Returns:
            List of predictions with probabilities
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Vectorize input
        X = self.vectorizer.transform([text])
        
        # Get probabilities
        probabilities = self.universe_model.predict_proba(X)[0]
        
        # Get top k predictions
        top_indices = np.argsort(probabilities)[::-1][:top_k]
        
        predictions = []
        for idx in top_indices:
            predictions.append({
                'universe': self.universe_encoder.classes_[idx],
                'probability': float(probabilities[idx]),
                'confidence': f"{probabilities[idx] * 100:.1f}%"
            })
        
        return predictions
    
    def predict_both(self, text, top_k=3):
        """
        Predict both genre and universe
        
        Args:
            text: Character quote or description
            top_k: Number of top predictions for each
            
        Returns:
            Dictionary with genre and universe predictions
        """
        return {
            'genre_predictions': self.predict_genre(text, top_k),
            'universe_predictions': self.predict_universe(text, top_k)
        }
    
    def classify_character(self, character_data):
        """
        Classify a character and return best predictions
        
        Args:
            character_data: Dictionary with character info
            
        Returns:
            Classification results
        """
        # Prepare text from character data
        text_parts = []
        
        if character_data.get('quote'):
            text_parts.append(character_data['quote'])
        if character_data.get('source'):
            text_parts.append(character_data['source'])
        if character_data.get('name'):
            text_parts.append(character_data['name'])
        if character_data.get('description'):
            text_parts.append(character_data['description'])
        
        text = ' '.join(text_parts)
        
        predictions = self.predict_both(text)
        
        return {
            'predicted_genre': predictions['genre_predictions'][0]['genre'],
            'genre_confidence': predictions['genre_predictions'][0]['confidence'],
            'predicted_universe': predictions['universe_predictions'][0]['universe'],
            'universe_confidence': predictions['universe_predictions'][0]['confidence'],
            'all_genre_predictions': predictions['genre_predictions'],
            'all_universe_predictions': predictions['universe_predictions']
        }
    
    def get_model_info(self):
        """Get information about the trained model"""
        if not self.is_trained:
            return {'trained': False}
        
        return {
            'trained': True,
            'training_data': self.training_data,
            'vocabulary_size': len(self.vectorizer.vocabulary_),
            'model_type': 'Multinomial Naive Bayes'
        }
    
    def save_model(self, filepath):
        """Save the trained model to disk"""
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        model_data = {
            'genre_model': self.genre_model,
            'universe_model': self.universe_model,
            'vectorizer': self.vectorizer,
            'genre_encoder': self.genre_encoder,
            'universe_encoder': self.universe_encoder,
            'training_data': self.training_data
        }
        
        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)
    
    def load_model(self, filepath):
        """Load a trained model from disk"""
        with open(filepath, 'rb') as f:
            model_data = pickle.load(f)
        
        self.genre_model = model_data['genre_model']
        self.universe_model = model_data['universe_model']
        self.vectorizer = model_data['vectorizer']
        self.genre_encoder = model_data['genre_encoder']
        self.universe_encoder = model_data['universe_encoder']
        self.training_data = model_data['training_data']
        self.is_trained = True


if __name__ == "__main__":
    # Test the model
    print("Testing Naive Bayes Character Classifier...")
    
    # Sample data
    sample_characters = [
        {
            "name": "Iron Man",
            "quote": "I am Iron Man",
            "source": "Iron Man",
            "genre": "Superhero Action",
            "universe": "Marvel"
        },
        {
            "name": "Spider-Man",
            "quote": "With great power comes great responsibility",
            "source": "Spider-Man",
            "genre": "Superhero Action",
            "universe": "Marvel"
        },
        {
            "name": "Batman",
            "quote": "I'm Batman",
            "source": "The Dark Knight",
            "genre": "Superhero Action",
            "universe": "DC"
        },
        {
            "name": "Superman",
            "quote": "Truth, justice, and the American way",
            "source": "Superman",
            "genre": "Superhero Action",
            "universe": "DC"
        },
        {
            "name": "Luke Skywalker",
            "quote": "I am a Jedi, like my father before me",
            "source": "Return of the Jedi",
            "genre": "Sci-Fi Action",
            "universe": "Star Wars"
        }
    ]
    
    # Train model
    model = CharacterNaiveBayes()
    metrics = model.train(sample_characters)
    
    print("\nTraining Results:")
    print(f"Genre Accuracy: {metrics['genre_accuracy']:.2%}")
    print(f"Universe Accuracy: {metrics['universe_accuracy']:.2%}")
    print(f"Genres: {metrics['genre_classes']}")
    print(f"Universes: {metrics['universe_classes']}")
    
    # Test prediction
    test_quote = "I can do this all day"
    print(f"\nTesting with quote: '{test_quote}'")
    predictions = model.predict_both(test_quote)
    
    print("\nGenre Predictions:")
    for pred in predictions['genre_predictions']:
        print(f"  {pred['genre']}: {pred['confidence']}")
    
    print("\nUniverse Predictions:")
    for pred in predictions['universe_predictions']:
        print(f"  {pred['universe']}: {pred['confidence']}")
