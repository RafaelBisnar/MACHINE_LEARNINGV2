export default function GameHeader() {
  return (
    <header className="relative z-20 border-b border-primary/20 py-6 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-2">
            CHARACTLE
          </h1>
          <p className="text-primary text-sm sm:text-base font-semibold tracking-widest">
            Guess the Character. 6 Attempts.
          </p>
        </div>
      </div>
    </header>
  );
}
