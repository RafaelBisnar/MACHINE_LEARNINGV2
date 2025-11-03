import { Brain } from "lucide-react";

export default function GameHeader() {
  return (
    <header className="relative z-20 border-b border-primary/20 py-6 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-netflix-red animate-pulse" />
            <h1 className="text-5xl sm:text-6xl font-black text-white">
              CHARACTLE
            </h1>
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-netflix-red animate-pulse" />
          </div>
          <p className="text-primary text-sm sm:text-base font-semibold tracking-widest">
            AI-Powered Superhero Guessing Game
          </p>
        </div>
      </div>
    </header>
  );
}
