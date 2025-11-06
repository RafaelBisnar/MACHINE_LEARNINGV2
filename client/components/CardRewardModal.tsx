import { useEffect, useState } from "react";
import { CardReward } from "@shared/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { CharacterCardDisplay } from "./CharacterCardDisplay";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Trophy, Star, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface CardRewardModalProps {
  reward: CardReward | null;
  open: boolean;
  onClose: () => void;
}

export function CardRewardModal({ reward, open, onClose }: CardRewardModalProps) {
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (open && reward) {
      // Delay card reveal for dramatic effect
      const timer = setTimeout(() => {
        setShowCard(true);
        triggerConfetti(reward.card.rarity);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setShowCard(false);
    }
  }, [open, reward]);

  const triggerConfetti = (rarity: string) => {
    const count = rarity === 'mythic' ? 200 : 
                   rarity === 'legendary' ? 150 : 
                   rarity === 'epic' ? 100 : 50;

    const colors = rarity === 'mythic' ? ['#ec4899', '#a855f7', '#6366f1'] :
                   rarity === 'legendary' ? ['#fbbf24', '#f97316'] :
                   rarity === 'epic' ? ['#a855f7', '#8b5cf6'] :
                   rarity === 'rare' ? ['#60a5fa', '#3b82f6'] :
                   ['#9ca3af', '#6b7280'];

    confetti({
      particleCount: count,
      spread: 100,
      origin: { y: 0.6 },
      colors,
    });
  };

  if (!reward) return null;

  const performanceGrade = 
    reward.performance.score >= 95 ? 'S' :
    reward.performance.score >= 85 ? 'A' :
    reward.performance.score >= 75 ? 'B' :
    reward.performance.score >= 65 ? 'C' :
    reward.performance.score >= 50 ? 'D' : 'F';

  const gradeColor = 
    performanceGrade === 'S' ? 'text-pink-400' :
    performanceGrade === 'A' ? 'text-yellow-400' :
    performanceGrade === 'B' ? 'text-purple-400' :
    performanceGrade === 'C' ? 'text-blue-400' :
    'text-gray-400';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-purple-500/30">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎉 Card Unlocked! 🎉
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Card reveal animation */}
          <div className="flex justify-center">
            <div className={cn(
              "transition-all duration-700 transform",
              showCard ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-180 opacity-0"
            )}>
              <CharacterCardDisplay 
                card={reward.card} 
                size="large"
                showStats={true}
              />
            </div>
          </div>

          {/* First time badge */}
          {reward.isFirstTime && (
            <div className="flex justify-center animate-bounce">
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-lg py-2 px-4">
                <Sparkles className="w-4 h-4 mr-2" />
                First Time Unlock!
              </Badge>
            </div>
          )}

          {/* Duplicate notice */}
          {reward.isDuplicate && (
            <div className="flex justify-center">
              <Badge className="text-gray-400 text-sm border-gray-400">
                Duplicate Card
              </Badge>
            </div>
          )}

          {/* Performance stats */}
          <div className="bg-black/30 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Performance Summary
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-sm font-bold text-white">{reward.performance.guessTime}s</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Star className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-400">Clues Used</p>
                  <p className="text-sm font-bold text-white">{reward.performance.cluesUsed}/3</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-4 h-4 text-red-400">✗</div>
                <div>
                  <p className="text-xs text-gray-400">Wrong Attempts</p>
                  <p className="text-sm font-bold text-white">{reward.performance.wrongAttempts}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Trophy className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-400">Grade</p>
                  <p className={cn("text-2xl font-bold", gradeColor)}>{performanceGrade}</p>
                </div>
              </div>
            </div>

            {/* Score bar */}
            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Performance Score</span>
                <span className="text-sm font-bold text-purple-300">
                  {Math.round(reward.performance.score)}/100
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${reward.performance.score}%` }}
                />
              </div>
            </div>

            {/* Bonus multiplier */}
            {reward.bonusMultiplier > 0.5 && (
              <div className="text-center text-sm text-yellow-300">
                ⚡ {(reward.bonusMultiplier * 100).toFixed(0)}% Bonus Multiplier Applied!
              </div>
            )}
          </div>

          {/* Achievement unlocks */}
          {reward.unlockedAchievements.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4 space-y-2">
              <h3 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                New Achievements!
              </h3>
              
              <div className="space-y-2">
                {reward.unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3"
                  >
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <p className="font-bold text-yellow-300">{achievement.name}</p>
                      <p className="text-xs text-gray-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Close button */}
          <div className="flex justify-center pt-2">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8"
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
