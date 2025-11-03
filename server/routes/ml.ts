import { RequestHandler } from "express";

/**
 * POST /api/ml/predict
 * Get ML-powered character predictions based on clues
 * 
 * Body:
 *   {
 *     "quote": "optional quote",
 *     "source": "optional source",
 *     "universe": "optional universe",
 *     "genre": "optional genre",
 *     "top_k": 5
 *   }
 */
export const handleMLPredict: RequestHandler = async (req, res) => {
  try {
    const { quote = "", source = "", universe = "", genre = "", top_k = 5 } = req.body;
    
    // Call Python ML service
    const mlResponse = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote, source, universe, genre, top_k })
    });
    
    if (!mlResponse.ok) {
      throw new Error(`ML service returned ${mlResponse.status}`);
    }
    
    const data = await mlResponse.json();
    res.json(data);
    
  } catch (error) {
    console.error("ML prediction error:", error);
    res.status(503).json({ 
      success: false,
      error: 'ML service unavailable. Make sure Python service is running on port 5000.' 
    });
  }
};

/**
 * POST /api/ml/analyze-game
 * Analyze current game state and get ML suggestions
 * 
 * Body:
 *   {
 *     "clues": { visual, quote, source },
 *     "incorrectGuesses": number
 *   }
 */
export const handleMLAnalyzeGame: RequestHandler = async (req, res) => {
  try {
    const { clues, incorrectGuesses = 0 } = req.body;
    
    // Call Python ML service
    const mlResponse = await fetch('http://localhost:5000/analyze-clues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clues, incorrectGuesses })
    });
    
    if (!mlResponse.ok) {
      throw new Error(`ML service returned ${mlResponse.status}`);
    }
    
    const data = await mlResponse.json();
    res.json(data);
    
  } catch (error) {
    console.error("ML analysis error:", error);
    res.status(503).json({ 
      success: false,
      error: 'ML service unavailable' 
    });
  }
};

/**
 * GET /api/ml/health
 * Check if ML service is available
 */
export const handleMLHealth: RequestHandler = async (_req, res) => {
  try {
    const mlResponse = await fetch('http://localhost:5000/health');
    const data = await mlResponse.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({ 
      status: 'unavailable',
      error: 'ML service is not running'
    });
  }
};

/**
 * POST /api/ml/predict-difficulty
 * Predict character difficulty using Linear Regression
 * 
 * Body:
 *   {
 *     "character": { name, attributes, etc. }
 *   }
 */
export const handleMLPredictDifficulty: RequestHandler = async (req, res) => {
  try {
    const { character } = req.body;
    
    if (!character) {
      return res.status(400).json({
        success: false,
        error: 'Character data required'
      });
    }
    
    // Call Python ML service
    const mlResponse = await fetch('http://localhost:5000/predict-difficulty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character })
    });
    
    if (!mlResponse.ok) {
      throw new Error(`ML service returned ${mlResponse.status}`);
    }
    
    const data = await mlResponse.json();
    res.json(data);
    
  } catch (error) {
    console.error("ML difficulty prediction error:", error);
    res.status(503).json({ 
      success: false,
      error: 'ML service unavailable' 
    });
  }
};

/**
 * GET /api/ml/difficulty-rankings
 * Get difficulty rankings for all characters
 */
export const handleMLDifficultyRankings: RequestHandler = async (_req, res) => {
  try {
    const mlResponse = await fetch('http://localhost:5000/difficulty-rankings');
    
    if (!mlResponse.ok) {
      throw new Error(`ML service returned ${mlResponse.status}`);
    }
    
    const data = await mlResponse.json();
    res.json(data);
    
  } catch (error) {
    console.error("ML difficulty rankings error:", error);
    res.status(503).json({ 
      success: false,
      error: 'ML service unavailable' 
    });
  }
};

/**
 * GET /api/ml/feature-importance
 * Get feature importance from Linear Regression model
 */
export const handleMLFeatureImportance: RequestHandler = async (_req, res) => {
  try {
    const mlResponse = await fetch('http://localhost:5000/feature-importance');
    
    if (!mlResponse.ok) {
      throw new Error(`ML service returned ${mlResponse.status}`);
    }
    
    const data = await mlResponse.json();
    res.json(data);
    
  } catch (error) {
    console.error("ML feature importance error:", error);
    res.status(503).json({ 
      success: false,
      error: 'ML service unavailable' 
    });
  }
};
