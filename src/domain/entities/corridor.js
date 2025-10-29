import { gameSession } from "./gameSession.js";

export function createCorridor(option) {
    console.log(option);
}


gameSession.levels.forEach(element => {
    const rooms = element.rooms;
    const lastIndex = rooms.length - 1;

    element.rooms.forEach(room => {
        if (room.id < lastIndex) {

            const option = {
                id: room.id,
                from: room.id,
                to: room.id + 1,
                path: [
                    { x: 0, y: 5 },
                    { x: 1, y: 5 },
                    { x: 2, y: 5 }], // координаты по которым можно пройти
                locked: false
            }
            createCorridor(option)
        }
    })
});


