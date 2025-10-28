import { useState } from "react";
import ParticlesBackground from "@/components/ParticlesBackground";
import GameHeader from "@/components/GameHeader";
import CluePanel from "@/components/CluePanel";
import CharactleBoard from "@/components/CharactleBoard";
import AutocompleteInput from "@/components/AutocompleteInput";

export default function Index() {
  const [guesses, setGuesses] = useState<string[]>([
    "Dumbledore",
    "Voldemort",
  ]);
  const incorrectGuesses = guesses.length;

  const handleGuessSubmit = (guess: string) => {
    if (guesses.length < 6) {
      setGuesses([...guesses, guess]);
    }
  };

  return (
    <div className="min-h-screen bg-netflix-black text-white relative overflow-hidden">
      <ParticlesBackground />

      <div className="content-wrapper min-h-screen flex flex-col">
        <GameHeader />

        <main className="flex-1 overflow-auto px-4 sm:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Clue Panel */}
            <CluePanel incorrectGuesses={incorrectGuesses} />

            {/* Game Status */}
            <div className="mb-8 text-center">
              <p className="text-gray-400 text-sm">
                {incorrectGuesses < 6 ? (
                  <>
                    <span className="text-netflix-red font-bold">
                      {6 - incorrectGuesses}
                    </span>
                    {" attempts remaining"}
                  </>
                ) : (
                  <span className="text-netflix-red font-bold">
                    Game Over - No more attempts
                  </span>
                )}
              </p>
            </div>

            {/* Character Board */}
            <CharactleBoard guesses={guesses} />

            {/* Input Section */}
            <div className="mb-8">
              <AutocompleteInput
                onSubmit={handleGuessSubmit}
                disabled={incorrectGuesses >= 6}
              />
            </div>

            {/* Game Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400 mt-12 pt-8 border-t border-gray-800">
              <div className="text-center md:text-left">
                <p className="text-netflix-red font-bold mb-2">How to Play</p>
                <p>Guess the character with the help of visual clues, quotes, and source material.</p>
              </div>
              <div className="text-center">
                <p className="text-netflix-red font-bold mb-2">6 Attempts</p>
                <p>You have 6 chances to guess the correct character.</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-netflix-red font-bold mb-2">New Game Daily</p>
                <p>A fresh character challenge every 24 hours.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
