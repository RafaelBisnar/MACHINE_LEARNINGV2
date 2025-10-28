import { useState, useRef, useEffect } from "react";
import { Search, Send } from "lucide-react";

interface AutocompleteInputProps {
  onSubmit: (guess: string) => void;
  disabled?: boolean;
}

const CHARACTER_SUGGESTIONS = [
  "Gandalf",
  "Frodo Baggins",
  "Aragorn",
  "Legolas",
  "Gimli",
  "Boromir",
  "Samwise Gamgee",
  "Elrond",
  "Galadriel",
  "Saruman",
  "Sauron",
  "Harry Potter",
  "Hermione Granger",
  "Ron Weasley",
  "Dumbledore",
  "Voldemort",
  "Snape",
  "Luke Skywalker",
  "Darth Vader",
  "Yoda",
  "Leia Organa",
  "Han Solo",
  "Katniss Everdeen",
  "Haymitch Abernathy",
  "Snow",
  "Jon Snow",
  "Daenerys Targaryen",
  "Tyrion Lannister",
  "Arya Stark",
  "Tyrion",
  "Sansa Stark",
];

export default function AutocompleteInput({
  onSubmit,
  disabled = false,
}: AutocompleteInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (input.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const filtered = CHARACTER_SUGGESTIONS.filter((char) =>
      char.toLowerCase().includes(input.toLowerCase())
    );

    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setSelectedIndex(-1);
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === "Enter") {
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          handleSubmit();
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSubmit(input.trim());
      setInput("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative z-20">
      <div className="relative">
        <div className="relative flex items-center bg-background/50 border-2 border-primary/50 rounded-lg overflow-hidden focus-within:border-primary transition-colors">
          <Search className="w-5 h-5 text-primary/60 ml-4 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => input && setShowSuggestions(true)}
            placeholder="Type a character name..."
            disabled={disabled}
            className="flex-1 bg-transparent text-white px-4 py-3 outline-none placeholder:text-gray-500 disabled:opacity-50"
            autoComplete="off"
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="px-4 py-3 bg-netflix-red hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Guess</span>
          </button>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-2 bg-netflix-black/90 border border-netflix-red/30 rounded-lg backdrop-blur-sm z-50 shadow-lg"
          >
            {suggestions.slice(0, 8).map((suggestion, index) => (
              <button
                key={suggestion}
                onClick={() => selectSuggestion(suggestion)}
                className={`w-full px-4 py-3 text-left transition-colors flex items-center gap-3 ${
                  index === selectedIndex
                    ? "bg-netflix-red/30 border-l-2 border-netflix-red"
                    : "hover:bg-gray-900/50"
                } ${index === 0 ? "" : "border-t border-gray-800/50"}`}
              >
                <Search className="w-4 h-4 text-netflix-red/60 flex-shrink-0" />
                <span className="text-white font-medium">{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
