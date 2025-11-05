import { createBackpack } from "./backpack.js";
import { createCharacter } from "./character.js";
import { highScores } from "./highscores.js";

export function createGameSession(initial) {
  return {
    levels: [],
    player: initial.player,
    highscores: initial.highscores,
    startTime: initial.startTime,
    isActive: initial.isActive,
  };
}

export const gameSession = createGameSession({
  player: createCharacter({
    name: "Azamat",
    maxHealth: 100,
    currentHealth: 100,
    strength: 10,
    dexterity: 10,
    currentWeapon: null,
    backpack: createBackpack({ items: [], maxPerType: 9 }),
    gold: 0,
  }),
  highscores: highScores,
  startTime: Date.now(),
  isActive: true,
});

globalThis.gameSession = gameSession;