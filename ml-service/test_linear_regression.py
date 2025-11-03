"""
Quick test script for Linear Regression model
Run this to verify the model works before starting the full service
"""

import json
from linear_regression_model import CharacterDifficultyPredictor

print("=" * 60)
print("Testing Linear Regression Model")
print("=" * 60)

# Load character data
try:
    with open('characters.json', 'r', encoding='utf-8') as f:
        characters = json.load(f)
    
    print(f"\n✓ Loaded {len(characters)} characters from characters.json")
    
except FileNotFoundError:
    print("\n✗ Error: characters.json not found")
    print("  Run: python export_characters.py first")
    exit(1)

# Create and train model
print("\n" + "=" * 60)
print("Training Linear Regression Model...")
print("=" * 60)

predictor = CharacterDifficultyPredictor()
metrics = predictor.train(characters)

print(f"\n✓ Training Complete!")
print(f"  R² Score: {metrics['r2_score']:.4f}")
print(f"  MAE: {metrics['mae']:.4f} guesses")
print(f"  RMSE: {metrics['rmse']:.4f} guesses")
print(f"  Features: {metrics['num_features']}")
print(f"  Samples: {metrics['num_samples']}")

# Test feature importance
print("\n" + "=" * 60)
print("Feature Importance Analysis")
print("=" * 60)

importance = predictor.get_feature_importance()
print(f"\nIntercept (baseline): {importance['intercept']:.4f}")
print("\nFeature Coefficients:")

# Sort by magnitude for better readability
sorted_features = sorted(
    importance['features'].items(),
    key=lambda x: x[1]['magnitude'],
    reverse=True
)

for feature, info in sorted_features:
    impact = "↑ increases" if info['impact'] == 'increases' else "↓ decreases"
    print(f"  {feature:15s}: {info['coefficient']:+.4f}  {impact} difficulty")

# Test predictions
print("\n" + "=" * 60)
print("Sample Predictions")
print("=" * 60)

all_predictions = predictor.predict_all_difficulties()

print("\n🟢 Top 5 Easiest Characters to Guess:")
for i, pred in enumerate(all_predictions[:5], 1):
    print(f"  {i}. {pred['character_name']:20s} - {pred['difficulty_score']:.2f} ({pred['difficulty_level']}) - ~{pred['estimated_guesses']} guesses")

print("\n🔴 Top 5 Hardest Characters to Guess:")
for i, pred in enumerate(all_predictions[-5:], 1):
    print(f"  {i}. {pred['character_name']:20s} - {pred['difficulty_score']:.2f} ({pred['difficulty_level']}) - ~{pred['estimated_guesses']} guesses")

# Test individual prediction
print("\n" + "=" * 60)
print("Individual Character Prediction")
print("=" * 60)

test_char = characters[0]  # First character
pred = predictor.predict_difficulty(test_char)

print(f"\nCharacter: {pred['character_name']}")
print(f"  Difficulty Score: {pred['difficulty_score']:.2f}")
print(f"  Difficulty Level: {pred['difficulty_level']}")
print(f"  Estimated Guesses: {pred['estimated_guesses']}")
print(f"\n  Features Used:")
print(f"    Powers: {pred['features']['num_powers']}")
print(f"    Name Length: {pred['features']['name_length']}")
print(f"    Aliases: {pred['features']['num_aliases']}")
print(f"    Universe: {pred['features']['universe']}")

# Save model
print("\n" + "=" * 60)
print("Saving Model")
print("=" * 60)

predictor.save_model('linear_regression_model.pkl')
print("\n✓ Model saved successfully!")

print("\n" + "=" * 60)
print("✅ All Tests Passed!")
print("=" * 60)
print("\nYou can now start the Flask server:")
print("  python app.py")
print("\nThe Linear Regression model is ready to use! 🎉")
