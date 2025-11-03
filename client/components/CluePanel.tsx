interface CluePanelProps {
  incorrectGuesses: number;
  clues: {
    visual: string | null;
    quote: string | null;
    source: {
      title: string;
      genre: string;
    } | null;
  };
}

export default function CluePanel({ incorrectGuesses, clues }: CluePanelProps) {
  return (
    <div className="relative z-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {/* Clue 1: Character Image */}
      <div className="bg-background/50 border border-primary/30 rounded-lg p-6 backdrop-blur-sm">
        <div className="text-center">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">
            Clue 1: Visual
          </h3>
          {clues.visual ? (
            <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-transparent rounded flex items-center justify-center border-2 border-dashed border-primary/40 overflow-hidden">
              <img 
                src={clues.visual} 
                alt="Character clue" 
                className="w-full h-full object-cover rounded"
                style={{
                  filter: `blur(${Math.max(0, 8 - incorrectGuesses * 2)}px)`,
                  transition: "filter 0.5s ease-in-out",
                }}
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-gray-800/50 rounded flex items-center justify-center border-2 border-dashed border-gray-600">
              <p className="text-gray-500 text-sm">Locked</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {clues.visual ? "✓ Unlocked" : "🔒 Unlocks after 1st guess"}
          </p>
        </div>
      </div>

      {/* Clue 2: Quote */}
      <div className="bg-background/50 border border-primary/30 rounded-lg p-6 backdrop-blur-sm">
        <div className="text-center">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">
            Clue 2: Quote
          </h3>
          {clues.quote ? (
            <div className="bg-primary/10 border-l-4 border-primary rounded px-4 py-3 min-h-32 flex items-center justify-center">
              <p className="text-white/90 italic text-sm leading-relaxed">
                "{clues.quote}"
              </p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded px-4 py-3 border-l-4 border-gray-600 flex items-center justify-center min-h-32">
              <p className="text-gray-500 text-sm">Locked</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {clues.quote ? "✓ Unlocked" : "🔒 Unlocks after 2nd incorrect guess"}
          </p>
        </div>
      </div>

      {/* Clue 3: Source */}
      <div className="bg-background/50 border border-primary/30 rounded-lg p-6 backdrop-blur-sm">
        <div className="text-center">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">
            Clue 3: Source
          </h3>
          {clues.source ? (
            <div className="bg-primary/10 rounded px-4 py-3 min-h-32 flex flex-col items-center justify-center">
              <p className="text-white/90 font-semibold text-sm">
                {clues.source.title}
              </p>
              <p className="text-white/70 text-xs mt-1">{clues.source.genre}</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded px-4 py-3 flex items-center justify-center min-h-32">
              <p className="text-gray-500 text-sm">Locked</p>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            {clues.source ? "✓ Unlocked" : "🔒 Unlocks after 3rd incorrect guess"}
          </p>
        </div>
      </div>
    </div>
  );
}
