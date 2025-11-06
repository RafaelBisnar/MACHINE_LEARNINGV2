/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Character interface for the guessing game
 */
export interface Character {
  id: string;
  name: string;
  aliases: string[]; // Alternate names that should also match
  universe: 'Marvel' | 'DC' | 'Other';
  quote: string;
  source: string; // e.g., "The Avengers", "Batman: The Dark Knight"
  genre: string; // e.g., "Superhero", "Action", "Fantasy"
  imageUrl: string; // Clue image (symbolic representation)
  characterImageUrl: string; // Actual character image (revealed on win)
  pixelatedImageUrl?: string; // Pre-pixelated version or will be generated
  attributes: {
    alignment: 'hero' | 'villain' | 'anti-hero';
    powers: string[];
    team?: string;
    firstAppearance?: string;
  };
}

/**
 * Daily challenge interface
 */
export interface DailyChallenge {
  date: string; // YYYY-MM-DD format
  character: Character;
}

/**
 * Game state for a player
 */
export interface GameState {
  date: string;
  characterId: string;
  guesses: GuessResult[];
  isComplete: boolean;
  isWon: boolean;
}

/**
 * Result of a single guess
 */
export interface GuessResult {
  guess: string;
  isCorrect: boolean;
  timestamp: string;
}

/**
 * Response when submitting a guess
 */
export interface GuessResponse {
  isCorrect: boolean;
  isGameOver: boolean;
  isWon: boolean;
  attemptsRemaining: number;
  guessResult: GuessResult;
  revealedCharacter?: Character; // Only sent if game is over
}

/**
 * Response for getting today's game state
 */
export interface TodayGameResponse {
  date: string;
  clues: {
    visual: string | null; // Image URL or null if locked
    quote: string | null; // Quote or null if locked
    source: {
      title: string;
      genre: string;
    } | null; // Source info or null if locked
  };
  guesses: GuessResult[];
  attemptsRemaining: number;
  isComplete: boolean;
  isWon: boolean;
  revealedCharacter?: Character; // Only if game is complete
}

/**
 * Character list response for autocomplete
 */
export interface CharacterListResponse {
  characters: Array<{
    id: string;
    name: string;
    aliases: string[];
  }>;
}

/**
 * ML Hint System interfaces
 */
export interface MLHint {
  character: string;
  confidence: number;
  source: 'knn' | 'svm' | 'decision_tree' | 'ann' | 'multiple';
}

export interface MLHintResponse {
  success: boolean;
  hints: MLHint[];
  message: string;
  error?: string;
}

/**
 * Character Card Reward System
 */

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface CardRarityConfig {
  rarity: CardRarity;
  label: string;
  color: string; // Tailwind color class
  glowColor: string; // CSS color for glow effect
  dropRate: number; // Percentage chance
  icon: string; // Icon identifier
}

export interface CharacterCard {
  id: string; // unique card instance ID
  characterId: string;
  characterName: string;
  rarity: CardRarity;
  serialNumber: number; // e.g., #001/500
  maxSupply: number; // Total possible cards of this character+rarity
  unlockedAt: string; // ISO timestamp
  variant?: 'standard' | 'shiny' | 'holographic' | 'animated';
  stats: {
    popularity: number; // 1-100
    difficulty: number; // 1-100
    power: number; // 1-100
  };
  imageUrl: string;
  characterImageUrl: string;
}

export interface CardCollection {
  userId?: string; // For future user auth
  cards: CharacterCard[];
  totalCards: number;
  uniqueCharacters: number;
  rarityCount: Record<CardRarity, number>;
  completionPercentage: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string; // ISO timestamp or undefined if locked
  progress: number; // 0-100
  maxProgress: number;
  reward?: {
    type: 'card' | 'coins' | 'badge';
    value: string;
  };
}

export interface CardReward {
  card: CharacterCard;
  isFirstTime: boolean; // First time unlocking this character
  isDuplicate: boolean;
  performance: {
    guessTime: number; // seconds
    cluesUsed: number;
    wrongAttempts: number;
    score: number; // Performance score 0-100
  };
  bonusMultiplier: number; // Rarity boost from performance
  unlockedAchievements: Achievement[];
}

export interface AwardCardRequest {
  characterId: string;
  guessTime: number;
  cluesUsed: number;
  wrongAttempts: number;
  isWon: boolean;
}

export interface AwardCardResponse {
  success: boolean;
  reward?: CardReward;
  error?: string;
}
