# Naive Bayes Algorithm Integration

## Overview
Naive Bayes has been successfully integrated into the ML Character Analysis system as the third machine learning algorithm, alongside K-NN and Linear Regression.

## What Naive Bayes Does

### Primary Function: **Classification**
Naive Bayes is a probabilistic classifier that predicts **categorical** outcomes based on text features.

### In This System:
1. **Genre Classification** - Predicts the genre of a character (e.g., "Superhero Action", "Sci-Fi", "Comedy")
2. **Universe Classification** - Predicts which universe a character belongs to (e.g., "Marvel", "DC", "Star Wars")

## How It Works

### Training Process:
1. Takes character data (quotes, names, descriptions, sources)
2. Extracts text features using TF-IDF vectorization
3. Learns probability distributions for each genre and universe
4. Builds two separate models:
   - Genre classifier
   - Universe classifier

### Prediction Process:
1. Takes new text input (quote, description, etc.)
2. Converts to TF-IDF features
3. Calculates probability for each possible class
4. Returns top predictions with confidence scores

## Comparison with Other Models

| Algorithm | Type | Purpose | Input | Output |
|-----------|------|---------|-------|--------|
| **K-NN** | Instance-based | Character Identification | Quote/description | Top matching characters |
| **Linear Regression** | Parametric | Difficulty Prediction | Character attributes | Difficulty score (0-10) |
| **Naive Bayes** | Probabilistic | Classification | Text features | Genre & Universe categories |

## API Endpoints

### 1. Train Model
```
POST /api/ml/train-nb
```
Trains the Naive Bayes classifier on character data.

### 2. Predict Genre
```
POST /api/ml/predict-genre
Body: { "text": "I am Iron Man", "top_k": 3 }
```
Returns top 3 genre predictions with probabilities.

### 3. Predict Universe
```
POST /api/ml/predict-universe
Body: { "text": "With great power...", "top_k": 3 }
```
Returns top 3 universe predictions with probabilities.

### 4. Classify Character
```
POST /api/ml/classify-character
Body: {
  "name": "Spider-Man",
  "quote": "With great power comes great responsibility",
  "source": "Spider-Man",
  "description": "Young superhero"
}
```
Returns complete classification with both genre and universe predictions.

### 5. Model Info
```
GET /api/ml/nb-info
```
Returns model training information, vocabulary size, and available classes.

## Use Cases

### 1. Character Organization
- Automatically categorize new characters
- Group characters by genre or universe
- Filter and search by classification

### 2. Content Recommendation
- "If you like this genre, try these characters..."
- Find similar universes
- Discover cross-genre characters

### 3. Game Enhancement
- Provide hints based on genre
- Unlock clues progressively by universe
- Score bonus points for correct genre identification

### 4. Data Validation
- Verify character metadata is correct
- Detect misclassified characters
- Suggest corrections for character data

## Technical Details

### Model Type
- **Multinomial Naive Bayes** for both genre and universe classification
- Assumes features are independent (naive assumption)
- Works well with text/count data

### Features
- **TF-IDF Vectorization**: Converts text to numerical features
- **Max Features**: 500 most important words/phrases
- **N-grams**: Unigrams and bigrams (1-2 word combinations)

### Performance Metrics
- **Accuracy**: Percentage of correct predictions
- **Confidence**: Probability of each prediction (0-100%)
- **Top-K Predictions**: Multiple possible classes with rankings

## Testing

### Quick Test
```bash
# Start Flask server
cd ml-service
python app.py

# In another terminal, run test
python test_naive_bayes.py
```

### Manual Testing
```bash
# Test genre prediction
curl -X POST http://localhost:5000/predict-genre \
  -H "Content-Type: application/json" \
  -d '{"text": "I am Iron Man", "top_k": 3}'

# Test universe prediction
curl -X POST http://localhost:5000/predict-universe \
  -H "Content-Type: application/json" \
  -d '{"text": "May the Force be with you", "top_k": 3}'
```

## Integration Status

✅ **Complete Integration:**
- ✓ Naive Bayes model implementation (`naive_bayes_model.py`)
- ✓ Flask API endpoints added
- ✓ Express proxy routes configured
- ✓ Auto-training on server startup
- ✓ Health check integration
- ✓ Test suite created

## Summary

**Naive Bayes completes the ML trio:**

1. **K-NN** → "Who is this character?" (Identification)
2. **Linear Regression** → "How difficult is this character?" (Prediction)
3. **Naive Bayes** → "What genre/universe is this character?" (Classification)

Together, these three algorithms provide comprehensive character analysis capabilities for your system.
