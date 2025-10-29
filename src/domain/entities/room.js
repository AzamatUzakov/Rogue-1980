import { gameSession } from "./gameSession.js";

export function createRoom(option, levelIndex) {
    gameSession.levels[levelIndex].rooms.push(option);
}

// Для каждого уровня создаём 9 комнат
gameSession.levels.forEach((level, levelIndex) => {
    for (let roomCount = 0; roomCount < 9; roomCount++) {
        const option = {
            id: roomCount,
            position: { x: 0, y: 0 },
            size: { width: 10, height: 8 },
            enemies: [],
            items: [],
            isStart: roomCount === 0,
            isExit: roomCount === 8
        };
        createRoom(option, levelIndex);
    }
});
