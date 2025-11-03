import { GuessResult } from "@shared/api";
import { getDailyCharacter, getRandomCharacter } from "./characters";

/**
 * Shared in-memory store for game states
 * In production, this should be in a database
 */
export interface GameStateData {
  date: string;
  characterId: string;
  guesses: GuessResult[];
  isComplete: boolean;
  isWon: boolean;
}

const gameStates = new Map<string, GameStateData>();

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Global daily character - same for ALL users on the same day
 */
let dailyCharacterCache: { date: string; characterId: string } | null = null;

/**
 * Get the daily character ID (same for all users)
 */
function getDailyCharacterId(date: string): string {
  // Check if we already have today's character cached
  if (dailyCharacterCache && dailyCharacterCache.date === date) {
    return dailyCharacterCache.characterId;
  }
  
  // Generate today's character and cache it
  const dailyCharacter = getDailyCharacter(date);
  dailyCharacterCache = {
    date: date,
    characterId: dailyCharacter.id,
  };
  
  console.log(`[Daily Character] ${date}: ${dailyCharacter.id}`);
  
  return dailyCharacter.id;
}

/**
 * Get or create game state for today for a session
 * In production, use user authentication
 */
export function getGameState(sessionId: string): GameStateData {
  const today = getTodayDate();
  const stateKey = `${sessionId}-${today}`;
  
  let state = gameStates.get(stateKey);
  
  // Create new game state if doesn't exist or date changed
  if (!state || state.date !== today) {
    // Use a random character for each new session
    const randomCharacter = getRandomCharacter();
    
    state = {
      date: today,
      characterId: randomCharacter.id,
      guesses: [],
      isComplete: false,
      isWon: false,
    };
    gameStates.set(stateKey, state);
    console.log(`[Game State Created] Session: ${sessionId}, Character: ${randomCharacter.id}`);
  }
  
  return state;
}

/**
 * Update game state
 */
export function updateGameState(sessionId: string, state: GameStateData): void {
  const today = getTodayDate();
  const stateKey = `${sessionId}-${today}`;
  gameStates.set(stateKey, state);
}
