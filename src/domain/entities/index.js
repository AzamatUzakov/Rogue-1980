// index.js (helpers for integration with UI)
import Gameplay from "../gameplay/gameplay.js";
import { highScores } from "./highscores.js";

// Инициализация геймплея
const gameplay = new Gameplay();
gameplay.init();

// Функции для UI-интеграции
export function moveToRoom(roomId) {
    gameplay.tickPlayer('move', { roomId });
}

export function attackEnemy(enemyId) {
    gameplay.tickPlayer('attack', { enemyId });
}

export function useItem(itemId) {
    gameplay.tickPlayer('useItem', { itemId });
}

export function pickupItem(itemId) {
    gameplay.tickPlayer('pickup', { itemId });
}

export function showHighScores() {
    return highScores.getScores();
}

console.log("🎮 Игра началась! Ваш ход.");