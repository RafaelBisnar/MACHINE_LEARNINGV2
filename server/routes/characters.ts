import { RequestHandler } from "express";
import { CharacterListResponse } from "@shared/api";
import { getAllCharacterNames } from "../data/characters";

/**
 * GET /api/characters
 * Get list of all characters for autocomplete
 */
export const handleGetCharacters: RequestHandler = (_req, res) => {
  try {
    const characters = getAllCharacterNames();
    
    const response: CharacterListResponse = {
      characters,
    };
    
    res.json(response);
  } catch (error) {
    console.error("Error getting characters:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
