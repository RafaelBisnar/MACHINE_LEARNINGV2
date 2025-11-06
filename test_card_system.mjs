#!/usr/bin/env node

/**
 * Test script for Character Card Reward System
 * Tests the backend API endpoints
 */

const BASE_URL = 'http://localhost:8080';

async function testAwardCard() {
  console.log('🧪 Testing Card Award System...\n');

  // Test 1: Award a card with perfect performance
  console.log('1️⃣ Testing perfect performance (should get legendary/mythic)...');
  try {
    const response = await fetch(`${BASE_URL}/api/rewards/award-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId: 'spider-man',
        guessTime: 5,
        cluesUsed: 0,
        wrongAttempts: 0,
        isWon: true,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Card awarded successfully!');
      console.log(`   Card: ${data.reward.card.characterName}`);
      console.log(`   Rarity: ${data.reward.card.rarity}`);
      console.log(`   Variant: ${data.reward.card.variant}`);
      console.log(`   Performance Score: ${data.reward.performance.score.toFixed(1)}`);
      console.log(`   Serial: #${data.reward.card.serialNumber}/${data.reward.card.maxSupply}`);
      if (data.reward.isFirstTime) {
        console.log('   🎉 First time unlock!');
      }
      if (data.reward.unlockedAchievements.length > 0) {
        console.log(`   🏆 Achievements: ${data.reward.unlockedAchievements.map(a => a.name).join(', ')}`);
      }
    } else {
      console.log('❌ Failed to award card:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();

  // Test 2: Award a card with average performance
  console.log('2️⃣ Testing average performance (should get rare/common)...');
  try {
    const response = await fetch(`${BASE_URL}/api/rewards/award-card`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        characterId: 'iron-man',
        guessTime: 30,
        cluesUsed: 2,
        wrongAttempts: 3,
        isWon: true,
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Card awarded successfully!');
      console.log(`   Card: ${data.reward.card.characterName}`);
      console.log(`   Rarity: ${data.reward.card.rarity}`);
      console.log(`   Performance Score: ${data.reward.performance.score.toFixed(1)}`);
    } else {
      console.log('❌ Failed to award card:', data.error);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();

  // Test 3: Get collection
  console.log('3️⃣ Testing collection retrieval...');
  try {
    const response = await fetch(`${BASE_URL}/api/rewards/collection`);
    const data = await response.json();

    console.log('✅ Collection retrieved successfully!');
    console.log(`   Total Cards: ${data.totalCards}`);
    console.log(`   Unique Characters: ${data.uniqueCharacters}`);
    console.log(`   Completion: ${data.completionPercentage.toFixed(1)}%`);
    console.log('   Rarity Breakdown:');
    console.log(`     - Common: ${data.rarityCount.common}`);
    console.log(`     - Rare: ${data.rarityCount.rare}`);
    console.log(`     - Epic: ${data.rarityCount.epic}`);
    console.log(`     - Legendary: ${data.rarityCount.legendary}`);
    console.log(`     - Mythic: ${data.rarityCount.mythic}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log();

  // Test 4: Get achievements
  console.log('4️⃣ Testing achievements retrieval...');
  try {
    const response = await fetch(`${BASE_URL}/api/rewards/achievements`);
    const data = await response.json();

    console.log('✅ Achievements retrieved successfully!');
    console.log(`   Total Achievements: ${data.achievements.length}`);
    const unlocked = data.achievements.filter(a => a.unlockedAt).length;
    console.log(`   Unlocked: ${unlocked}/${data.achievements.length}`);
    
    data.achievements.forEach(achievement => {
      const status = achievement.unlockedAt ? '✅' : '🔒';
      const progress = `${achievement.progress}/${achievement.maxProgress}`;
      console.log(`   ${status} ${achievement.name} (${progress})`);
    });
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n🎉 All tests completed!\n');
}

// Run tests
testAwardCard().catch(console.error);
