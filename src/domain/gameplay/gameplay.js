import { initializeLevels } from "../entities/level.js";
import { gameSession } from "../entities/gameSession.js";
import { turnSystem } from "./turnSystem.js";
import { createRenderer } from "../../presentation/renderer.js";
import { bindControls } from "../../presentation/controls.js";
import { loadState, applyStateToSession, makeSerializableSession, saveState } from "../../datalayer/saveManager.js";

// Gameplay: фасад игрового цикла и инициализации
export default class Gameplay {
    constructor(screen) {
        this.screen = screen; // ссылка на UI, если нужен
        this.renderer = null;
    }

    // init: генерирует уровни и выставляет стартовую позицию игрока
    async init() {
        // Пытаемся восстановить сохранение
        const snapshot = await loadState();
        if (snapshot && applyStateToSession(gameSession, snapshot)) {
            console.log("💾 Продолжение последней сессии загружено");
        } else {
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
        }

        // Инициализация рендера и управления
        this.renderer = createRenderer(this.screen);
        bindControls(this.screen, () => this.renderer.draw());
        this.renderer.draw();
    }

    // tickPlayer: проксирует действие игрока в пошаговую систему
    tickPlayer(actionType, data) {
        return turnSystem.playerAction(actionType, data);
    }
}

