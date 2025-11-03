import { RequestHandler } from "express";
import { GuessResponse, GuessResult } from "@shared/api";
import { getCharacterByName, getCharacterById } from "../data/characters";
import { getGameState, updateGameState } from "../data/gameState";

/**
 * POST /api/game/guess
 * Submit a guess for today's character
 * Body: { guess: string }
 */
export const handleGuess: RequestHandler = (req, res) => {
  try {
    const { guess } = req.body;
    
    if (!guess || typeof guess !== "string") {
      return res.status(400).json({ error: "Guess is required" });
    }
    
    // In production, get from authenticated user session
    const sessionId = req.headers["x-session-id"] as string || "default-session";
    
    const state = getGameState(sessionId);
    // Use the stored character ID from state (same for entire day)
    const dailyCharacter = getCharacterById(state.characterId);
    
    if (!dailyCharacter) {
      return res.status(500).json({ error: "Character not found" });
    }
    
    // Check if game is already complete (won)
    if (state.isComplete) {
      return res.status(400).json({ 
        error: "Game is already complete",
        isComplete: true,
        isWon: state.isWon,
      });
    }
    
    // Check if guess is correct
    const guessedCharacter = getCharacterByName(guess);
    const isCorrect = guessedCharacter?.id === dailyCharacter.id;
    
    // Create guess result
    const guessResult: GuessResult = {
      guess: guess.trim(),
      isCorrect,
      timestamp: new Date().toISOString(),
    };
    
    // Update game state
    state.guesses.push(guessResult);
    
    // Only mark complete if correct (unlimited attempts)
    if (isCorrect) {
      state.isComplete = true;
      state.isWon = true;
    }
    
    // Save the updated state
    updateGameState(sessionId, state);
    
    const attemptsRemaining = -1; // Unlimited attempts
    
    // Build response
    const response: GuessResponse = {
      isCorrect,
      isGameOver: state.isComplete,
      isWon: state.isWon,
      attemptsRemaining,
      guessResult,
    };
    
    // If game is over, reveal the character
    if (state.isComplete) {
      response.revealedCharacter = dailyCharacter;
    }
    
    res.json(response);
  } catch (error) {
    console.error("Error processing guess:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
