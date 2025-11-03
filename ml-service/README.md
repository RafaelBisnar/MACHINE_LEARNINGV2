# ML Machine Learning Service

This Python service uses **K-Nearest Neighbors (K-NN)** and **Linear Regression** algorithms for the Charactle guessing game.

## Machine Learning Algorithms

### 1. K-Nearest Neighbors (K-NN)
- **Purpose**: Predict characters based on text clues
- **Features**: Quote, source, universe, genre embeddings
- **Output**: Top-k most likely characters with confidence scores

### 2. Linear Regression
- **Purpose**: Predict character difficulty (how hard to guess)
- **Features**: Number of powers, name length, universe, aliases, quote length, alignment
- **Output**: Difficulty score (1-15), difficulty level, estimated guesses

## Features

- 🤖 **K-NN Algorithm**: Uses scikit-learn for efficient nearest-neighbor search
- 📈 **Linear Regression**: Predicts character difficulty based on attributes
- 📝 **Text Embeddings**: Sentence transformers for semantic understanding of quotes
- 🎯 **Multi-Clue Analysis**: Combines multiple features for accurate predictions
- 🔌 **REST API**: Flask server that integrates with your Express backend
- 📊 **Confidence & Metrics**: Returns prediction confidence and R² scores

## Architecture

```
┌─────────────────┐
│  Express Server │
│  (Node.js)      │
└────────┬────────┘
         │ HTTP
         ├─────────────────────┐
         │                     │
┌────────▼─────────┐  ┌────────▼──────────┐
│  Game Logic      │  │  ML Service       │
│  /api/game/*     │  │  Python Flask     │
│                  │  │  :5000            │
│  - Daily char    │  │  - K-NN Model     │
│  - Guess check   │  │  - Embeddings     │
│  - Clue unlock   │  │  - Predictions    │
└──────────────────┘  └───────────────────┘
```

## Setup

### 1. Install Python Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

**Note**: First run will download the sentence-transformer model (~80MB). This is one-time only.

### 2. Export Character Data

Run this script to convert your TypeScript characters to JSON:

```bash
python export_characters.py
```

This reads `server/data/characters.ts` and creates `ml-service/characters.json`.

### 3. Start the ML Service

```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### 📊 General

#### Health Check
```http
GET /health
```

Returns service status and both models' readiness.

---

### 🔍 K-NN Endpoints

#### Train K-NN Model
```http
POST /train
Content-Type: application/json

{
  "k": 5  // Optional: number of neighbors (default: 5)
}
```

Trains the k-NN model with your character data. Auto-runs on startup.

#### Predict Character
```http
POST /predict
Content-Type: application/json

{
  "quote": "I am Iron Man",
  "source": "Iron Man",
  "universe": "Marvel",
  "genre": "Superhero Action",
  "top_k": 5
}
```

Returns top-k character predictions with confidence scores.

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "id": "iron-man",
      "name": "Iron Man",
      "universe": "Marvel",
      "confidence": 0.95,
      "match_score": 95.0
    }
  ]
}
```

#### Analyze Game Clues
```http
POST /analyze-clues
Content-Type: application/json

{
  "clues": {
    "visual": "https://...",
    "quote": "I can do this all day",
    "source": {
      "title": "Captain America",
      "genre": "Superhero Action"
    }
  },
  "incorrectGuesses": 2
}
```

Convenience endpoint that takes game state and returns predictions.

---

### 📈 Linear Regression Endpoints

#### Train Linear Regression Model
```http
POST /train-lr
Content-Type: application/json
```

Trains the Linear Regression model for difficulty prediction. Auto-runs on startup.

**Response:**
```json
{
  "success": true,
  "metrics": {
    "r2_score": 0.8523,
    "mae": 0.4231,
    "rmse": 0.5821,
    "num_features": 6
  }
}
```

#### Predict Character Difficulty
```http
POST /predict-difficulty
Content-Type: application/json

{
  "character": {
    "name": "Spider-Man",
    "attributes": {
      "powers": ["Wall-crawling", "Spider-sense", "Superhuman strength"],
      "alignment": "hero"
    },
    "aliases": ["Peter Parker", "Spidey"],
    "quote": "With great power comes great responsibility",
    "universe": "Marvel"
  }
}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "character_name": "Spider-Man",
    "difficulty_score": 4.8,
    "difficulty_level": "Easy",
    "estimated_guesses": 5,
    "features": {
      "num_powers": 3,
      "name_length": 10,
      "num_aliases": 3,
      "universe": "Marvel"
    }
  }
}
```

#### Get Difficulty Rankings
```http
GET /difficulty-rankings
```

Returns all characters ranked by difficulty (easiest to hardest).

**Response:**
```json
{
  "success": true,
  "rankings": [
    {
      "character_name": "Spider-Man",
      "difficulty_score": 3.2,
      "difficulty_level": "Very Easy"
    },
    {
      "character_name": "Batman",
      "difficulty_score": 4.5,
      "difficulty_level": "Easy"
    }
  ],
  "total_characters": 27
}
```

#### Get Feature Importance
```http
GET /feature-importance
```

Returns which features most impact difficulty prediction.

**Response:**
```json
{
  "success": true,
  "feature_importance": {
    "intercept": 5.234,
    "features": {
      "num_powers": {
        "coefficient": 0.312,
        "impact": "increases",
        "magnitude": 0.312
      },
      "num_aliases": {
        "coefficient": -0.487,
        "impact": "decreases",
        "magnitude": 0.487
      }
    }
  }
}
```

## How It Works

### 1. Feature Extraction

The model uses **sentence-transformers** (`all-MiniLM-L6-v2`) to convert text clues into semantic embeddings:

- **Quote**: Character's iconic line
- **Source**: Movie/comic title
- **Universe**: Marvel/DC/Other
- **Genre**: Genre description

All clues are combined and embedded into a 384-dimensional vector.

### 2. K-NN Classification

- Computes **cosine similarity** between query and all character embeddings
- Returns the k most similar characters
- Similarity scores are converted to confidence percentages

### 3. Prediction Quality

The model works best when:
- ✅ Multiple clues are provided (quote + source + universe)
- ✅ Clues contain distinctive keywords
- ✅ Training data covers diverse characters

## Integration with Express

Add this to your Express server to call the ML service:

```typescript
// server/routes/ml-predict.ts
import { RequestHandler } from "express";

export const handleMLPredict: RequestHandler = async (req, res) => {
  try {
    const { quote, source, universe, genre } = req.body;
    
    // Call Python ML service
    const mlResponse = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote, source, universe, genre, top_k: 5 })
    });
    
    const data = await mlResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'ML service unavailable' });
  }
};
```

Register in `server/index.ts`:
```typescript
import { handleMLPredict } from "./routes/ml-predict";
app.post("/api/ml/predict", handleMLPredict);
```

## Model Performance

- **Feature Dimension**: 384 (sentence-transformers)
- **Inference Speed**: ~20-50ms per query
- **Memory**: ~100MB (model + embeddings)
- **Accuracy**: Depends on clue quality and character diversity

### Tuning

You can adjust k (number of neighbors):
```python
knn_model = CharacterKNN(k=10)  # Increase for more suggestions
```

## Troubleshooting

### "Model not trained" Error
Run the `/train` endpoint or restart the server (auto-trains on startup).

### Slow First Prediction
First inference loads the sentence-transformer model. Subsequent calls are fast.

### Characters Not Found
Re-run `python export_characters.py` after updating `characters.ts`.

## Future Enhancements

- 🖼️ **Image Features**: Add ResNet/MobileNet for visual clue analysis
- 🎨 **Color Analysis**: Extract dominant colors from clue images
- 📈 **Learning**: Update embeddings based on user feedback
- 💾 **Caching**: Cache embeddings to speed up training
- 🔍 **FAISS**: Use approximate NN for faster search with large datasets

## License

MIT - Same as parent project
