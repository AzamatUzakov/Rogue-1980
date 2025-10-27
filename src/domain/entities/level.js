export function createLevel(option) {
    return option

}
/* 
const option = {
    id: 1,                       // номер уровня
    rooms: [                      // массив комнат
        { id: 1, position: { x: 0, y: 0 }, size: { width: 10, height: 8 }, enemies: [], items: [], isStart: true, isExit: false },
        { id: 2, position: { x: 15, y: 0 }, size: { width: 12, height: 8 }, enemies: [], items: [], isStart: false, isExit: true },
        { id: 3, position: { x: 0, y: 12 }, size: { width: 8, height: 10 }, enemies: [], items: [], isStart: false, isExit: false }
    ],
    corridors: [                  // соединения между комнатами (пока можно просто для структуры)
        { from: 1, to: 2 },
        { from: 1, to: 3 }
    ],
    startRoomId: 1,               // id стартовой комнаты
    exitRoomId: 2                 // id комнаты выхода
}



createLevel(option) */