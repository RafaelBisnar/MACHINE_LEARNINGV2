import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CardCollection, CharacterCard, CardRarity, Achievement } from "@shared/api";
import { CharacterCardDisplay } from "@/components/CharacterCardDisplay";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CollectionPage() {
  const navigate = useNavigate();
  const [collection, setCollection] = useState<CardCollection | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | "all">("all");

  useEffect(() => {
    fetchCollection();
    fetchAchievements();
  }, []);

  const fetchCollection = async () => {
    try {
      const response = await fetch("/api/rewards/collection");
      const data = await response.json();
      setCollection(data);
    } catch (error) {
      console.error("Failed to fetch collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/rewards/achievements");
      const data = await response.json();
      setAchievements(data.achievements || []);
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    }
  };

  const filteredCards = collection?.cards.filter((card) =>
    selectedRarity === "all" ? true : card.rarity === selectedRarity
  );

  const rarityStats: Record<CardRarity, number> = {
    common: collection?.rarityCount.common || 0,
    rare: collection?.rarityCount.rare || 0,
    epic: collection?.rarityCount.epic || 0,
    legendary: collection?.rarityCount.legendary || 0,
    mythic: collection?.rarityCount.mythic || 0,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-xl text-purple-300">Loading collection...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-purple-300 hover:text-purple-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Game
          </Button>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🎴 Card Collection
          </h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-300">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{collection?.totalCards || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-300">Unique Characters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{collection?.uniqueCharacters || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-purple-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-300">Completion</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {collection?.completionPercentage.toFixed(1)}%
              </div>
              <Progress 
                value={collection?.completionPercentage || 0} 
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="cards" className="space-y-6">
          <TabsList className="bg-black/30 border border-purple-500/30">
            <TabsTrigger value="cards" className="data-[state=active]:bg-purple-500/30">
              🎴 Cards
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-500/30">
              🏆 Achievements
            </TabsTrigger>
          </TabsList>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            {/* Rarity filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRarity === "all" ? "default" : "outline"}
                onClick={() => setSelectedRarity("all")}
                className={cn(
                  selectedRarity === "all" && "bg-purple-500 hover:bg-purple-600"
                )}
              >
                All ({collection?.totalCards || 0})
              </Button>
              {Object.entries(rarityStats).map(([rarity, count]) => (
                <Button
                  key={rarity}
                  variant={selectedRarity === rarity ? "default" : "outline"}
                  onClick={() => setSelectedRarity(rarity as CardRarity)}
                  className={cn(
                    selectedRarity === rarity && "bg-purple-500 hover:bg-purple-600"
                  )}
                >
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)} ({count})
                </Button>
              ))}
            </div>

            {/* Cards grid */}
            {filteredCards && filteredCards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {filteredCards.map((card) => (
                  <CharacterCardDisplay
                    key={card.id}
                    card={card}
                    size="medium"
                    showStats={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-black/30 border-purple-500/30">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400">
                    {selectedRarity === "all" 
                      ? "No cards yet. Play the game to earn your first card!"
                      : `No ${selectedRarity} cards yet. Keep playing to unlock them!`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={cn(
                      "bg-black/30 border-purple-500/30 transition-all",
                      achievement.unlockedAt
                        ? "border-yellow-500/50 bg-yellow-500/5"
                        : "opacity-60"
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{achievement.icon}</span>
                          <div>
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                              {achievement.name}
                              {achievement.unlockedAt && (
                                <Badge className="bg-yellow-500 text-black">
                                  Unlocked
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-gray-400">
                              {achievement.description}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-purple-300">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress
                          value={(achievement.progress / achievement.maxProgress) * 100}
                          className="h-2"
                        />
                        {achievement.unlockedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-black/30 border-purple-500/30">
                <CardContent className="py-12 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">
                    No achievements yet. Play the game to start earning them!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
