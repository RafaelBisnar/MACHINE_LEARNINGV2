interface CharactleBoardProps {
  guesses: string[];
}

export default function CharactleBoard({ guesses }: CharactleBoardProps) {
  const totalSlots = 6;
  const slots = Array(totalSlots)
    .fill(null)
    .map((_, index) => guesses[index] || "");

  return (
    <div className="relative z-20 mb-8">
      <h2 className="text-primary text-sm uppercase font-bold tracking-widest mb-4">
        Guesses ({guesses.length}/{totalSlots})
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {slots.map((guess, index) => (
          <div
            key={index}
            className={`aspect-square rounded-lg border-2 flex items-center justify-center text-center p-4 transition-all duration-200 ${
              guess
                ? "border-primary bg-primary/10 backdrop-blur-sm"
                : "border-gray-700 bg-gray-900/40"
            }`}
          >
            {guess ? (
              <div>
                <p className="text-white font-bold text-sm sm:text-base line-clamp-2">
                  {guess}
                </p>
              </div>
            ) : (
              <p className="text-gray-600 text-xs">Attempt {index + 1}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
