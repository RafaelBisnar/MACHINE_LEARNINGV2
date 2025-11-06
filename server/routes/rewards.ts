import { RequestHandler } from "express";
import {
  AwardCardRequest,
  AwardCardResponse,
  CardReward,
  CharacterCard,
  CardRarity,
  CardCollection,
  Achievement,
} from "@shared/api";
import { CHARACTERS } from "../data/characters";

// In-memory storage (replace with database in production)
const cardCollections = new Map<string, CharacterCard[]>();
const achievements = new Map<string, Achievement[]>();

// Rarity configuration
const RARITY_CONFIG = {
  common: { label: 'Common', color: 'text-gray-400', glowColor: '#9ca3af', dropRate: 50, icon: '⚪' },
  rare: { label: 'Rare', color: 'text-blue-400', glowColor: '#60a5fa', dropRate: 30, icon: '🔵' },
  epic: { label: 'Epic', color: 'text-purple-400', glowColor: '#a78bfa', dropRate: 15, icon: '🟣' },
  legendary: { label: 'Legendary', color: 'text-yellow-400', glowColor: '#fbbf24', dropRate: 4, icon: '🟡' },
  mythic: { label: 'Mythic', color: 'text-pink-400', glowColor: '#f472b6', dropRate: 1, icon: '⭐' },
};

/**
 * Calculate performance score (0-100)
 */
function calculatePerformanceScore(
  guessTime: number,
  cluesUsed: number,
  wrongAttempts: number,
  isWon: boolean
): number {
  if (!isWon) return 0;

  let score = 100;

  // Time penalty (max 30 seconds for perfect score)
  const timePenalty = Math.min(30, guessTime) / 30 * 30;
  score -= timePenalty;

  // Clues penalty (each clue -10 points)
  score -= cluesUsed * 10;

  // Wrong attempts penalty (each attempt -5 points)
  score -= wrongAttempts * 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Determine card rarity based on performance score
 */
function determineRarity(performanceScore: number): CardRarity {
  // Perfect score (95+): High chance of legendary/mythic
  if (performanceScore >= 95) {
    const roll = Math.random() * 100;
    if (roll < 20) return 'mythic';
    if (roll < 60) return 'legendary';
    return 'epic';
  }

  // Great score (80-94): High chance of epic/legendary
  if (performanceScore >= 80) {
    const roll = Math.random() * 100;
    if (roll < 5) return 'mythic';
    if (roll < 30) return 'legendary';
    if (roll < 70) return 'epic';
    return 'rare';
  }

  // Good score (60-79): Mainly epic/rare
  if (performanceScore >= 60) {
    const roll = Math.random() * 100;
    if (roll < 40) return 'epic';
    if (roll < 80) return 'rare';
    return 'common';
  }

  // Average score (40-59): Mainly rare/common
  if (performanceScore >= 40) {
    const roll = Math.random() * 100;
    if (roll < 10) return 'epic';
    if (roll < 50) return 'rare';
    return 'common';
  }

  // Low score (below 40): Mainly common
  const roll = Math.random() * 100;
  if (roll < 20) return 'rare';
  return 'common';
}

/**
 * Determine card variant based on rarity
 */
function determineVariant(rarity: CardRarity): 'standard' | 'shiny' | 'holographic' | 'animated' {
  const roll = Math.random() * 100;

  if (rarity === 'mythic') {
    if (roll < 50) return 'animated';
    if (roll < 80) return 'holographic';
    return 'shiny';
  }

  if (rarity === 'legendary') {
    if (roll < 20) return 'animated';
    if (roll < 50) return 'holographic';
    if (roll < 80) return 'shiny';
    return 'standard';
  }

  if (rarity === 'epic') {
    if (roll < 10) return 'holographic';
    if (roll < 40) return 'shiny';
    return 'standard';
  }

  if (rarity === 'rare') {
    if (roll < 20) return 'shiny';
    return 'standard';
  }

  return 'standard';
}

/**
 * Calculate character stats based on character data
 * Integrates with ML Linear Regression for difficulty scoring
 */
async function calculateCharacterStats(characterId: string) {
  const character = CHARACTERS.find(c => c.id === characterId);
  if (!character) {
    return { popularity: 50, difficulty: 50, power: 50 };
  }

  // Calculate popularity based on universe (simplified)
  const popularUniverses = ['Marvel Comics', 'DC Comics', 'Star Wars', 'Harry Potter'];
  const popularity = popularUniverses.includes(character.universe) ? 
    Math.floor(Math.random() * 30) + 70 : 
    Math.floor(Math.random() * 50) + 30;

  // 🔥 USE ML LINEAR REGRESSION FOR DIFFICULTY
  let difficulty = 50; // Default fallback
  try {
    const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';
    const response = await fetch(`${ML_SERVICE_URL}/predict-difficulty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character_name: character.name }),
    });
    
    if (response.ok) {
      const data = await response.json();
      // Convert ML difficulty score (0-100) to card stat
      difficulty = Math.round(data.difficulty_score);
    }
  } catch (error) {
    console.error('Failed to get ML difficulty, using random:', error);
    difficulty = Math.floor(Math.random() * 100);
  }

  // Calculate power based on character attributes
  const hasPowers = character.attributes.powers && character.attributes.powers.length > 0;
  const power = hasPowers ? 
    Math.floor(Math.random() * 30) + 60 : 
    Math.floor(Math.random() * 60) + 20;

  return { popularity, difficulty, power };
}

/**
 * Get or create collection for user
 */
function getCollection(userId: string = 'default'): CharacterCard[] {
  if (!cardCollections.has(userId)) {
    cardCollections.set(userId, []);
  }
  return cardCollections.get(userId)!;
}

/**
 * Award card after successful game
 * 🔥 NOW USES ML LINEAR REGRESSION FOR DIFFICULTY
 */
export const awardCard: RequestHandler = async (req, res) => {
  try {
    const { characterId, guessTime, cluesUsed, wrongAttempts, isWon } = req.body as AwardCardRequest;

    // Validate input
    if (!characterId || guessTime === undefined || cluesUsed === undefined || wrongAttempts === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      } as AwardCardResponse);
    }

    // Find character
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character) {
      return res.status(404).json({
        success: false,
        error: 'Character not found',
      } as AwardCardResponse);
    }

    // Calculate performance score
    const performanceScore = calculatePerformanceScore(guessTime, cluesUsed, wrongAttempts, isWon);
    
    // Determine rarity based on performance
    const rarity = determineRarity(performanceScore);
    const variant = determineVariant(rarity);

    // Get user collection
    const collection = getCollection('default');

    // Check if first time unlocking this character
    const existingCards = collection.filter(c => c.characterId === characterId);
    const isFirstTime = existingCards.length === 0;
    
    // Calculate serial number
    const serialNumber = existingCards.length + 1;
    const maxSupply = rarity === 'mythic' ? 100 : 
                      rarity === 'legendary' ? 500 : 
                      rarity === 'epic' ? 1000 : 
                      rarity === 'rare' ? 5000 : 10000;

    // 🔥 Get ML-powered character stats
    const characterStats = await calculateCharacterStats(characterId);

    // Create card
    const newCard: CharacterCard = {
      id: `${characterId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      characterId,
      characterName: character.name,
      rarity,
      serialNumber,
      maxSupply,
      unlockedAt: new Date().toISOString(),
      variant,
      stats: characterStats,
      imageUrl: character.imageUrl,
      characterImageUrl: character.characterImageUrl || character.imageUrl,
    };

    // Add to collection
    collection.push(newCard);

    // Calculate bonus multiplier
    const bonusMultiplier = performanceScore / 100;

    // Check for achievement unlocks
    const unlockedAchievements: Achievement[] = [];

    // First card achievement
    if (collection.length === 1) {
      unlockedAchievements.push({
        id: 'first-card',
        name: 'First Card',
        description: 'Unlock your first character card',
        icon: '🎴',
        unlockedAt: new Date().toISOString(),
        progress: 1,
        maxProgress: 1,
      });
    }

    // Collector achievement (10 cards)
    if (collection.length === 10) {
      unlockedAchievements.push({
        id: 'collector',
        name: 'Collector',
        description: 'Unlock 10 character cards',
        icon: '📚',
        unlockedAt: new Date().toISOString(),
        progress: 10,
        maxProgress: 10,
      });
    }

    // First legendary
    if (rarity === 'legendary' && collection.filter(c => c.rarity === 'legendary').length === 1) {
      unlockedAchievements.push({
        id: 'legendary-pull',
        name: 'Legendary Pull',
        description: 'Unlock your first legendary card',
        icon: '🌟',
        unlockedAt: new Date().toISOString(),
        progress: 1,
        maxProgress: 1,
      });
    }

    // Perfect game achievement
    if (performanceScore === 100) {
      unlockedAchievements.push({
        id: 'perfect-game',
        name: 'Perfect Game',
        description: 'Complete a game with a perfect score',
        icon: '💯',
        unlockedAt: new Date().toISOString(),
        progress: 1,
        maxProgress: 1,
      });
    }

    const reward: CardReward = {
      card: newCard,
      isFirstTime,
      isDuplicate: !isFirstTime,
      performance: {
        guessTime,
        cluesUsed,
        wrongAttempts,
        score: performanceScore,
      },
      bonusMultiplier,
      unlockedAchievements,
    };

    res.json({
      success: true,
      reward,
    } as AwardCardResponse);

  } catch (error) {
    console.error('Error awarding card:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to award card',
    } as AwardCardResponse);
  }
};

/**
 * Get user's card collection
 */
export const getCardCollection: RequestHandler = (req, res) => {
  try {
    const collection = getCollection('default');
    
    // Calculate stats
    const uniqueCharacters = new Set(collection.map(c => c.characterId)).size;
    const rarityCount = collection.reduce((acc, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      return acc;
    }, {} as Record<CardRarity, number>);

    // Fill missing rarities with 0
    const allRarities: CardRarity[] = ['common', 'rare', 'epic', 'legendary', 'mythic'];
    allRarities.forEach(rarity => {
      if (!rarityCount[rarity]) rarityCount[rarity] = 0;
    });

    const completionPercentage = (uniqueCharacters / CHARACTERS.length) * 100;

    const response: CardCollection = {
      cards: collection.sort((a, b) => 
        new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime()
      ),
      totalCards: collection.length,
      uniqueCharacters,
      rarityCount,
      completionPercentage,
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
};

/**
 * Get user's achievements
 */
export const getAchievements: RequestHandler = (req, res) => {
  try {
    const collection = getCollection('default');
    
    const allAchievements: Achievement[] = [
      {
        id: 'first-card',
        name: 'First Card',
        description: 'Unlock your first character card',
        icon: '🎴',
        progress: Math.min(collection.length, 1),
        maxProgress: 1,
        unlockedAt: collection.length >= 1 ? collection[0].unlockedAt : undefined,
      },
      {
        id: 'collector',
        name: 'Collector',
        description: 'Unlock 10 character cards',
        icon: '📚',
        progress: Math.min(collection.length, 10),
        maxProgress: 10,
        unlockedAt: collection.length >= 10 ? collection[9].unlockedAt : undefined,
      },
      {
        id: 'master-collector',
        name: 'Master Collector',
        description: 'Unlock 50 character cards',
        icon: '🏆',
        progress: Math.min(collection.length, 50),
        maxProgress: 50,
        unlockedAt: collection.length >= 50 ? collection[49].unlockedAt : undefined,
      },
      {
        id: 'legendary-pull',
        name: 'Legendary Pull',
        description: 'Unlock your first legendary card',
        icon: '🌟',
        progress: Math.min(collection.filter(c => c.rarity === 'legendary').length, 1),
        maxProgress: 1,
        unlockedAt: collection.find(c => c.rarity === 'legendary')?.unlockedAt,
      },
      {
        id: 'mythic-hunter',
        name: 'Mythic Hunter',
        description: 'Unlock a mythic card',
        icon: '⭐',
        progress: Math.min(collection.filter(c => c.rarity === 'mythic').length, 1),
        maxProgress: 1,
        unlockedAt: collection.find(c => c.rarity === 'mythic')?.unlockedAt,
      },
    ];

    res.json({ achievements: allAchievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
};
