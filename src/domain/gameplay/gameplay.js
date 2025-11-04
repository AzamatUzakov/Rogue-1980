import { initializeLevels } from "../entities/level.js";
import { gameSession } from "../entities/gameSession.js";
import { turnSystem } from "./turnSystem.js";

// Gameplay: фасад игрового цикла и инициализации
export default class Gameplay {
    constructor(screen) {
        this.screen = screen; // ссылка на UI, если нужен
    }

    // init: генерирует уровни и выставляет стартовую позицию игрока
    init() {
        initializeLevels();

        const level0 = gameSession.levels[0];
        gameSession.player.level = 1;
        gameSession.player.currentRoomId = level0.startRoomId;
        // случайная позиция внутри стартовой комнаты при старте игры
        const startRoom = level0.rooms.find(r => r.id === level0.startRoomId);
        if (startRoom) {
            gameSession.player.position = {
                x: Math.floor(Math.random() * startRoom.size.width),
                y: Math.floor(Math.random() * startRoom.size.height),
            };
        }

        // начальное сообщение в UI/консоль
        // (логика отрисовки экрана может находиться здесь)
        // этот метод лишь гарантирует корректный старт состояния
    }

    // tickPlayer: проксирует действие игрока в пошаговую систему
    tickPlayer(actionType, data) {
        return turnSystem.playerAction(actionType, data);
    }
}

