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
