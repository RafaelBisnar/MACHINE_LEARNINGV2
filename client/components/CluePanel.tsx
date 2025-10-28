interface CluePanelProps {
  incorrectGuesses: number;
}

export default function CluePanel({ incorrectGuesses }: CluePanelProps) {
  return (
    <div className="relative z-20 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {/* Clue 1: Pixelated Image */}
      <div className="bg-background/50 border border-primary/30 rounded-lg p-6 backdrop-blur-sm">
        <div className="text-center">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">
            Clue 1: Visual
          </h3>
          {incorrectGuesses >= 1 ? (
            <div className="w-full aspect-square bg-gradient-to-br from-primary/20 to-transparent rounded flex items-center justify-center border-2 border-dashed border-primary/40">
              <div
                className="w-48 h-48 bg-primary/30"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, transparent 48%, rgba(229, 9, 20, 0.8) 49%, rgba(229, 9, 20, 0.8) 51%, transparent 52%),
                    linear-gradient(-45deg, transparent 48%, rgba(229, 9, 20, 0.8) 49%, rgba(229, 9, 20, 0.8) 51%, transparent 52%),
                    repeating-linear-gradient(0deg, rgba(229, 9, 20, 0.4) 0px, rgba(229, 9, 20, 0.4) 2px, transparent 2px, transparent 4px),
                    repeating-linear-gradient(90deg, rgba(229, 9, 20, 0.4) 0px, rgba(229, 9, 20, 0.4) 2px, transparent 2px, transparent 4px)
                  `,
                  backgroundSize: "100% 100%, 100% 100%, 20px 20px, 20px 20px",
                  backgroundPosition: "0 0, 0 0, 0 0, 0 0",
                }}
              />
            </div>
          ) : (
            <div className="w-full aspect-square bg-gray-800/50 rounded flex items-center justify-center border-2 border-dashed border-gray-600">
              <p className="text-gray-500 text-sm">Locked</p>
            </div>
          )}
        </div>
      </div>

      {/* Clue 2: Quote */}
      <div className="bg-background/50 border border-primary/30 rounded-lg p-6 backdrop-blur-sm">
        <div className="text-center">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">
            Clue 2: Quote
          </h3>
          {incorrectGuesses >= 2 ? (
            <div className="bg-primary/10 border-l-4 border-primary rounded px-4 py-3">
              <p className="text-white/90 italic text-sm leading-relaxed">
                "All we have to decide is what to do with the time that is given us."
              </p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded px-4 py-3 border-l-4 border-gray-600 flex items-center justify-center min-h-20">
              <p className="text-gray-500 text-sm">Locked</p>
            </div>
          )}
        </div>
      </div>

      {/* Clue 3: Source */}
      <div className="bg-background/50 border border-primary/30 rounded-lg p-6 backdrop-blur-sm">
        <div className="text-center">
          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-4">
            Clue 3: Source
          </h3>
          {incorrectGuesses >= 3 ? (
            <div className="bg-primary/10 rounded px-4 py-3">
              <p className="text-white/90 font-semibold text-sm">
                The Lord of the Rings
              </p>
              <p className="text-white/70 text-xs mt-1">Fantasy Epic</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded px-4 py-3 flex items-center justify-center min-h-20">
              <p className="text-gray-500 text-sm">Locked</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
