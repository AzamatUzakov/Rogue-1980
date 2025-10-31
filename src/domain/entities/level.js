import { gameSession } from "./gameSession.js";


export function createLevel(option) {
    gameSession.levels.push(option)
}





let levelCount = 0

while (levelCount < 21) {
    const option = {
        id: levelCount,                       // номер уровня
        rooms: [],// массив комнат  
        corridors: [],          // соединения между комнатами (пока можно просто для структуры)
        startRoomId: 1,               // id стартовой комнаты
        exitRoomId: 2                 // id комнаты выхода
    }
    createLevel(option)
    levelCount++
}
