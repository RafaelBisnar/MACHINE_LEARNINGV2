import { CharacterCard, CardRarity } from "@shared/api";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

interface CharacterCardDisplayProps {
  card: CharacterCard;
  className?: string;
  size?: "small" | "medium" | "large";
  showStats?: boolean;
  onClick?: () => void;
}

const RARITY_CONFIG: Record<CardRarity, {
  label: string;
  gradient: string;
  glow: string;
  border: string;
  text: string;
  badge: string;
}> = {
  common: {
    label: "Common",
    gradient: "from-gray-500 to-gray-600",
    glow: "shadow-gray-500/50",
    border: "border-gray-400",
    text: "text-gray-300",
    badge: "bg-gray-500",
  },
  rare: {
    label: "Rare",
    gradient: "from-blue-500 to-blue-600",
    glow: "shadow-blue-500/50",
    border: "border-blue-400",
    text: "text-blue-300",
    badge: "bg-blue-500",
  },
  epic: {
    label: "Epic",
    gradient: "from-purple-500 to-purple-600",
    glow: "shadow-purple-500/50",
    border: "border-purple-400",
    text: "text-purple-300",
    badge: "bg-purple-500",
  },
  legendary: {
    label: "Legendary",
    gradient: "from-yellow-500 to-orange-500",
    glow: "shadow-yellow-500/50",
    border: "border-yellow-400",
    text: "text-yellow-300",
    badge: "bg-gradient-to-r from-yellow-500 to-orange-500",
  },
  mythic: {
    label: "Mythic",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
    glow: "shadow-pink-500/50",
    border: "border-pink-400",
    text: "text-pink-300",
    badge: "bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500",
  },
};

const SIZE_CONFIG = {
  small: {
    container: "w-32 h-48",
    image: "h-24",
    text: "text-xs",
    stats: "text-[10px]",
  },
  medium: {
    container: "w-48 h-72",
    image: "h-36",
    text: "text-sm",
    stats: "text-xs",
  },
  large: {
    container: "w-64 h-96",
    image: "h-48",
    text: "text-base",
    stats: "text-sm",
  },
};

export function CharacterCardDisplay({
  card,
  className,
  size = "medium",
  showStats = true,
  onClick,
}: CharacterCardDisplayProps) {
  const rarityConfig = RARITY_CONFIG[card.rarity];
  const sizeConfig = SIZE_CONFIG[size];

  const isHolographic = card.variant === "holographic";
  const isShiny = card.variant === "shiny";
  const isAnimated = card.variant === "animated";

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300",
        "hover:scale-105 hover:shadow-2xl",
        sizeConfig.container,
        rarityConfig.border,
        rarityConfig.glow,
        "border-2",
        {
          "animate-pulse-glow": isAnimated,
          "holographic-effect": isHolographic,
          "shiny-effect": isShiny,
        },
        className
      )}
      onClick={onClick}
    >
      {/* Rarity gradient border glow */}
      <div className={cn(
        "absolute inset-0 opacity-20",
        `bg-gradient-to-br ${rarityConfig.gradient}`,
        "pointer-events-none"
      )} />

      <CardContent className="p-3 h-full flex flex-col relative z-10">
        {/* Rarity badge */}
        <div className="flex justify-between items-start mb-2">
          <Badge className={cn(rarityConfig.badge, "text-white text-xs")}>
            {rarityConfig.label}
          </Badge>
          {card.variant !== "standard" && (
            <Badge className="text-xs capitalize border-gray-400">
              {card.variant}
            </Badge>
          )}
        </div>

        {/* Character image */}
        <div className={cn(
          "relative overflow-hidden rounded-lg mb-2",
          sizeConfig.image,
          "bg-gradient-to-br from-black/20 to-black/40"
        )}>
          <img
            src={card.characterImageUrl}
            alt={card.characterName}
            className="w-full h-full object-cover"
          />
          
          {/* Holographic overlay */}
          {isHolographic && (
            <div className="absolute inset-0 holographic-shine pointer-events-none" />
          )}
          
          {/* Shiny overlay */}
          {isShiny && (
            <div className="absolute inset-0 shiny-sparkle pointer-events-none" />
          )}
        </div>

        {/* Character name */}
        <h3 className={cn(
          "font-bold text-center mb-1 truncate",
          rarityConfig.text,
          sizeConfig.text
        )}>
          {card.characterName}
        </h3>

        {/* Serial number */}
        <p className={cn(
          "text-center text-gray-400 mb-2",
          sizeConfig.stats
        )}>
          #{card.serialNumber.toString().padStart(4, '0')}/{card.maxSupply}
        </p>

        {/* Stats */}
        {showStats && (
          <div className="mt-auto space-y-1">
            <div className="flex justify-between items-center">
              <span className={cn("text-gray-400", sizeConfig.stats)}>Popularity</span>
              <div className="flex-1 mx-2 bg-gray-700 rounded-full h-1.5">
                <div
                  className={cn("h-full rounded-full", `bg-gradient-to-r ${rarityConfig.gradient}`)}
                  style={{ width: `${card.stats.popularity}%` }}
                />
              </div>
              <span className={cn("text-gray-300", sizeConfig.stats)}>{card.stats.popularity}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={cn("text-gray-400", sizeConfig.stats)}>Difficulty</span>
              <div className="flex-1 mx-2 bg-gray-700 rounded-full h-1.5">
                <div
                  className={cn("h-full rounded-full", `bg-gradient-to-r ${rarityConfig.gradient}`)}
                  style={{ width: `${card.stats.difficulty}%` }}
                />
              </div>
              <span className={cn("text-gray-300", sizeConfig.stats)}>{card.stats.difficulty}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={cn("text-gray-400", sizeConfig.stats)}>Power</span>
              <div className="flex-1 mx-2 bg-gray-700 rounded-full h-1.5">
                <div
                  className={cn("h-full rounded-full", `bg-gradient-to-r ${rarityConfig.gradient}`)}
                  style={{ width: `${card.stats.power}%` }}
                />
              </div>
              <span className={cn("text-gray-300", sizeConfig.stats)}>{card.stats.power}</span>
            </div>
          </div>
        )}
      </CardContent>

      {/* Unlock timestamp watermark */}
      <div className="absolute bottom-1 right-2 text-[8px] text-gray-500 opacity-50">
        {new Date(card.unlockedAt).toLocaleDateString()}
      </div>
    </Card>
  );
}
