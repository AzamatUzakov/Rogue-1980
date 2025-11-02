import { gameSession } from "./gameSession.js";


export function createLevel(option) {
    return option
}
for (let i = 1; i <= 21; i++) {
    const level = createLevel({
        id: i,
        rooms: [],
        corridors: [],
        startRoomId: 1,
        exitRoomId: 9,
    });

    const enemyCount = 2 + i;      // больше врагов с каждым уровнем
    const foodCount = Math.max(5 - Math.floor(i / 3), 1); // меньше еды
    const lootMultiplier = 1 + i * 0.1; // больше сокровищ

    // добавление врагов и предметы в комнаты
    level.rooms.forEach(room => {
        if (!room.isStart) {
            // враги
            for (let e = 0; e < enemyCount; e++) {
                room.enemies.push({
                    id: e,
                    type: "Zombie",
                    health: 10 + i * 5,
                    maxHealth: 10 + i * 5,
                    strength: 2 + i,
                    loot: Math.floor(3 * lootMultiplier),
                });
            }

            // еда
            for (let f = 0; f < foodCount; f++) {
                room.items.push({
                    id: f,
                    type: "Food",
                    subtype: "Apple",
                    health: 5,
                });
            }
        }
    });

    gameSession.levels.push(level);
}
