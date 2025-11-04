import { createBackpack } from "./backpack.js";
import { createCharacter } from "./character.js";
import { highScores } from "./highscores.js";

// createGameSession: создаёт контейнер состояния игры (уровни, игрок, рекорды)
export function createGameSession(initial) {
  return {
    levels: [],
    player: initial.player,
    highscores: initial.highscores,
    startTime: initial.startTime,
    isActive: initial.isActive,
  };
}

// gameSession: глобальная сессия текущей игры
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

// Делаем доступным для простых AI через globalThis
globalThis.gameSession = gameSession;