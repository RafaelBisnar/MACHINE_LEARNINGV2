# Decision Tree - Project Summary

## Overview

Decision Tree is the **fifth and most interpretable machine learning algorithm** integrated into the Character Prediction ML System. It provides both classification (character prediction) and regression (difficulty prediction) with human-readable decision rules and visual tree representations.

## What is Decision Tree?

Decision Tree is a supervised learning algorithm that:
- Creates a **tree-like model** of decisions based on feature values
- Splits data recursively to make predictions
- Provides **interpretable rules** that explain how predictions are made
- Works well with both **categorical and numerical features**
- Requires **no feature scaling** (handles raw data naturally)

## Purpose in This Project

### Dual Functionality:
1. **Character Classification**: Predict which character based on engineered features
2. **Difficulty Regression**: Predict character difficulty score (0-10 scale) as an alternative to Linear Regression

### Key Advantages:
- **Interpretability**: Can export human-readable decision rules
- **Visualization**: Generate tree diagrams to explain predictions
- **Feature Importance**: Identify which features matter most
- **No Preprocessing**: Works with raw categorical and numerical data
- **Fast Predictions**: Very quick inference time

## How It Helps Your Project

### 1. **Explainable AI**
- Shows **exactly how** predictions are made with if-then-else rules
- Perfect for **presentations and demos** to explain ML decisions
- Builds trust by showing the reasoning process

### 2. **Engineered Feature Analysis**
- Uses structured features: powers_count, name_length, quote_length, universe, genre
- Combines with TF-IDF (50 features) for text analysis
- Identifies which character attributes drive predictions

### 3. **Visual Decision Process**
- Generates PNG/base64 images of decision trees
- Shows the complete decision pathway
- Great for **UI integration** - display tree when user guesses correctly

### 4. **Dual Model Approach**
- **Classifier**: Character prediction with probability scores
- **Regressor**: Difficulty prediction (alternative to Linear Regression)
- Both trained simultaneously from same data

## Technical Implementation

### Engineered Features:
```
1. Numerical Features:
   - powers_count: Number of superpowers
   - name_length: Character name length
   - quote_length: Quote text length
   - description_length: Description text length

2. Text Features:
   - TF-IDF vectors (50 dimensions) from quotes/descriptions

3. Categorical Features:
   - universe: Marvel/DC/Other (encoded)
   - genre: Superhero Action/etc (encoded)

Total: 56 features
```

### Model Architecture:
- **Classifier**: DecisionTreeClassifier (max_depth=10)
- **Regressor**: DecisionTreeRegressor (max_depth=10)
- **Vectorizer**: TF-IDF with max_features=50, ngram_range=(1,2)
- **Training Split**: 80/20 with stratification
- **Evaluation**: Cross-validation (5-fold) for robust metrics

### Hyperparameters:
- `max_depth=10`: Prevents overfitting (tree can't grow too deep)
- `min_samples_split=2`: Minimum samples to split a node
- `min_samples_leaf=1`: Minimum samples at leaf node

## API Endpoints

### 1. Train Decision Tree
```http
POST /api/ml/train-dt
Body: {
  "max_depth": 10,
  "min_samples_split": 2,
  "min_samples_leaf": 1
}
```

### 2. Predict Character (Classification)
```http
POST /api/ml/predict-dt
Body: {
  "character": {
    "name": "Spider-Man",
    "quote": "With great power...",
    "universe": "Marvel",
    "genre": "Superhero Action",
    "powers": ["web-slinging", "spider-sense"],
    "description": "A hero with spider abilities"
  },
  "top_k": 5
}
```

### 3. Predict Difficulty (Regression)
```http
POST /api/ml/predict-difficulty-dt
Body: {
  "character": { ... same structure ... }
}
```

### 4. Get Feature Importance
```http
GET /api/ml/dt-feature-importance?top_n=20
```

### 5. Get Decision Rules
```http
GET /api/ml/dt-rules?max_depth=3
```

### 6. Visualize Tree
```http
GET /api/ml/dt-visualize?tree_type=classifier&max_depth=3
```

### 7. Get Model Info
```http
GET /api/ml/dt-info
```

## Decision Rules Example

Decision Trees provide human-readable rules like:

```
|--- powers_count <= 2.5
|   |--- quote_length <= 45.0
|   |   |--- universe == Marvel
|   |   |   |--- class: iron-man (probability: 0.85)
|   |   |--- universe == DC
|   |   |   |--- class: batman (probability: 0.92)
|   |--- quote_length > 45.0
|   |   |--- tfidf_5 <= 0.3
|   |   |   |--- class: spider-man (probability: 0.78)
|--- powers_count > 2.5
|   |--- name_length <= 10.0
|   |   |--- class: superman (probability: 0.89)
```

This shows **exactly how** the model makes decisions!

## Use Cases in Your Game

### Scenario 1: Explain Predictions
When a user guesses correctly, show the decision tree visualization:
- "Here's how the ML predicted your character"
- Display the tree with highlighted path
- Educational and engaging

### Scenario 2: Feature Analysis
Identify which features matter:
- "Your character has 5 powers (high importance)"
- "Quote length was a strong indicator"
- Help users understand what makes characters unique

### Scenario 3: Difficulty Prediction
Alternative to Linear Regression:
- Decision Tree Regressor for difficulty
- Compare DT vs LR predictions
- Use ensemble (average both) for robustness

### Scenario 4: Game Balance
Analyze decision rules to balance game:
- Which features lead to easy/hard guesses?
- Are certain universes easier to predict?
- Adjust clues based on tree insights

## Comparison with Other Algorithms

| Feature | K-NN | Linear Reg | Naive Bayes | SVM | **Decision Tree** |
|---------|------|------------|-------------|-----|-------------------|
| **Task** | Character ID | Difficulty | Genre/Universe | Character ID | **Both (Clf + Reg)** |
| **Interpretability** | Low | Medium | Medium | Low | **Very High** |
| **Visualization** | No | Weights | Probabilities | No | **Tree Diagram** |
| **Feature Engineering** | No | Yes | No | No | **Yes (required)** |
| **Overfitting Risk** | Low | Low | Low | Low | **Medium-High** |
| **Training Speed** | Instant | Fast | Fast | Moderate | **Fast** |
| **Prediction Speed** | Slow | Very Fast | Fast | Fast | **Very Fast** |
| **Feature Importance** | No | Yes | Limited | Yes (linear) | **Yes (native)** |
| **Categorical Features** | No | No (encode) | Yes | No | **Yes (native)** |
| **Best For** | Simple matching | Numerical | Classification | Complex text | **Explainability** |

## Why Decision Tree Was Added

1. **Explainability**: Only algorithm that shows exact decision rules
2. **Visualization**: Tree diagrams are powerful for demos/presentations
3. **Dual Purpose**: Handles both classification and regression
4. **Feature Engineering**: Great for structured character attributes
5. **Educational Value**: Helps students/users understand ML decisions
6. **Complementary**: Works differently than neural/distance-based models

## Strengths & Weaknesses

### Strengths ✅
- **Human-readable rules**: Anyone can understand the decisions
- **No scaling needed**: Works with raw numerical values
- **Handles mixed data**: Categorical + numerical seamlessly
- **Feature importance**: Built-in importance scores
- **Fast**: Quick training and prediction
- **Visual**: Can generate tree diagrams

### Weaknesses ⚠️
- **Overfitting prone**: Deep trees memorize training data
- **Unstable**: Small data changes can drastically change tree
- **Not optimal for high-dim text**: SVM/NB better for raw TF-IDF
- **Bias to dominant classes**: Struggles with imbalanced data
- **No probability calibration**: Probabilities less reliable than SVM

### Mitigation Strategies:
- Use `max_depth=10` to prevent overfitting
- Cross-validation to ensure robust performance
- Ensemble with other models for production
- Reduce TF-IDF to 50 features (from 1000)

## Performance Metrics

### Typical Performance:
- **Classifier Accuracy**: 60-80% (test set)
- **Regressor R²**: 0.40-0.70
- **Cross-Validation**: ±5-10% variation
- **Tree Depth**: 8-10 levels
- **Number of Leaves**: 20-50 nodes
- **Training Time**: 1-2 seconds
- **Prediction Time**: <1ms per character

## Testing

Run the comprehensive test suite:
```bash
python test_decision_tree.py
```

Tests include:
1. Health check (all 5 models)
2. Decision Tree training (classifier + regressor)
3. Character prediction (classification)
4. Difficulty prediction (regression)
5. Feature importance analysis
6. Decision rules extraction
7. Tree visualization (base64 PNG)
8. Model information retrieval

## Integration with UI

### Example: Display Tree on Correct Guess
```javascript
// When user guesses correctly
const response = await fetch('/api/ml/dt-visualize?tree_type=classifier&max_depth=3');
const data = await response.json();

if (data.success) {
  // data.image is base64-encoded PNG
  const imgSrc = `data:image/png;base64,${data.image}`;
  
  // Display in modal or reveal screen
  modalElement.innerHTML = `
    <h2>How we predicted it!</h2>
    <img src="${imgSrc}" alt="Decision Tree" />
    <p>The ML model followed this decision path to identify your character.</p>
  `;
}
```

### Example: Show Decision Rules
```javascript
const response = await fetch('/api/ml/dt-rules?max_depth=3');
const data = await response.json();

if (data.success) {
  // Display formatted rules
  console.log(data.rules);
  rulesElement.textContent = data.rules;
}
```

## Future Enhancements

### Possible Improvements:
- [ ] **Random Forest**: Ensemble of trees for higher accuracy
- [ ] **Gradient Boosting**: Sequential tree building (XGBoost/LightGBM)
- [ ] **Pruning**: Post-training tree simplification
- [ ] **Interactive Tree**: Clickable nodes in UI to explore paths
- [ ] **Rule Export**: Save rules as JSON for non-ML systems
- [ ] **A/B Testing**: Compare DT vs SVM for character prediction

### Advanced Features:
- [ ] **Cost-complexity pruning**: Automatic optimal depth selection
- [ ] **Feature selection**: Recursive feature elimination
- [ ] **Class weights**: Handle imbalanced character datasets
- [ ] **Ensemble voting**: Combine DT + SVM + K-NN predictions

## Conclusion

**Decision Tree is the most interpretable algorithm in your ML system**, providing:
- ✅ **Crystal-clear explanations** of predictions
- ✅ **Visual tree diagrams** for UI integration
- ✅ **Feature importance** to understand what matters
- ✅ **Dual functionality** (classification + regression)
- ✅ **Fast and simple** - perfect for demos

It complements the existing algorithms by offering **explainability and transparency** that neural networks and distance-based methods lack. Use it when you need to **show your work** and explain **why** a prediction was made.

---

**Status**: ✅ Fully Integrated  
**Auto-Training**: Enabled on server startup  
**Endpoints**: 7 API routes (train, predict, predict-difficulty, feature-importance, rules, visualize, info)  
**Test Coverage**: 8 comprehensive tests  
**Dual Models**: Classifier + Regressor trained simultaneously  
**Last Updated**: November 5, 2025
