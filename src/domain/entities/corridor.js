import { gameSession } from "./gameSession.js";

export function createCorridor(option, levelIndex) {
    gameSession.levels[levelIndex].corridors.push(option);
}

gameSession.levels.forEach((element, levelIndex) => {
    const rooms = element.rooms;

    console.log(rooms, "------------------------------");

    // минимальная цепочка для связности
    const shuffled = [...rooms].sort(() => Math.random() - 0.5);

    for (let i = 0; i < shuffled.length - 1; i++) {
        const option = {
            id: `${shuffled[i].id}-${shuffled[i + 1].id}`,
            from: shuffled[i].id,
            to: shuffled[i + 1].id,
            path: [
                { x: 0, y: 5 },
                { x: 1, y: 5 },
                { x: 2, y: 5 }
            ],
            locked: false
        };
        createCorridor(option, levelIndex);
    }

    //добавляю дополнительные коридоры
    element.rooms.forEach(room => {
        const possibleIds = rooms
            .map(r => r.id)
            .filter(id => id !== room.id);

        const targets = new Set();

        while (targets.size < 3 && targets.size < possibleIds.length) {
            const randomId = possibleIds[Math.floor(Math.random() * possibleIds.length)];
            targets.add(randomId);
        }

        for (const toId of targets) {

            const exists = element.corridors.some(c =>
                (c.from === room.id && c.to === toId) ||
                (c.from === toId && c.to === room.id)
            );

            if (exists) continue;

            const option = {
                id: `${room.id}-${toId}`,
                from: room.id,
                to: toId,
                path: [
                    { x: 0, y: 5 },
                    { x: 1, y: 5 },
                    { x: 2, y: 5 }
                ],
                locked: false
            };

            createCorridor(option, levelIndex);
        }
    });

});

/* проверяет,
можно ли из одной комнаты уровня попасть во все остальные комнаты через существующие коридоры. */
function isLevelConnected(level) {
    const graph = {};

    // строим граф
    level.rooms.forEach(room => {
        graph[room.id] = [];
    });

    level.corridors.forEach(corridor => {
        graph[corridor.from].push(corridor.to);
        graph[corridor.to].push(corridor.from);
    });

    // BFS или DFS
    const visited = new Set();
    const start = level.rooms[0]?.id;
    if (!start) return false;

    const queue = [start];
    visited.add(start);

    while (queue.length) {
        const current = queue.shift();
        for (const neighbor of graph[current]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }

    return visited.size === level.rooms.length;
}




/* проверяет,
связаны ли все комнаты уровня между собой, и если нет —
автоматически добавляет недостающие коридоры, */
function connectDisconnectedRooms(level) {
    while (!isLevelConnected(level)) {
        const disconnected = new Set(level.rooms.map(r => r.id));

        level.corridors.forEach(corridor => {
            disconnected.delete(corridor.from);
            disconnected.delete(corridor.to);
        });

        const allIds = level.rooms.map(r => r.id);
        const from = allIds[Math.floor(Math.random() * allIds.length)];
        const to = Array.from(disconnected)[Math.floor(Math.random() * disconnected.size)];

        if (!to) break;

        const option = {
            id: `${from}-${to}`,
            from,
            to,
            path: [
                { x: 0, y: 5 },
                { x: 1, y: 5 },
                { x: 2, y: 5 }
            ],
            locked: false
        };

        level.corridors.push(option);
        console.log(`🔗 Добавлен коридор ${from} -> ${to} для связности`);
    }
}

gameSession.levels.forEach((level) => {
    connectDisconnectedRooms(level);
});
