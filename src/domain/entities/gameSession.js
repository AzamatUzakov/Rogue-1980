import { createLevel } from "./level.js"

export function createGameSession(option) {
    return option
}


const gameSession = createGameSession({
    id: 1,
    playerName: "Azamat",
    currentLevel: 1,
    maxLevels: 3,
    score: 0,
    isActive: true,
    startTime: Date.now(),
    levels: [],
    inventory: [],
    player: {
        maxHealth: 100,
        health: 100,
        agility: 10,
        strength: 10,
        currentWeapon: null,
    },
})

const level1 = createLevel({
    id: 1,
    rooms: [],
    corridors: [
        { from: 1, to: 2 },
    ],
    startRoomId: 1,
    exitRoomId: 2,
})

const room = {
    id: 1,                           // уникальный идентификатор комнаты
    position: { x: 0, y: 0 },        // координаты верхнего левого угла комнаты
    size: { width: 10, height: 8 },  // размеры комнаты
    enemies: [],                        // массив врагов в комнате

    items: [], // массив предметов в комнате
    isStart: true,                    // стартовая комната для игрока
    isExit: false                     // комната выхода на следующий уровень
}


const enemy = {
    id: 1,
    type: "Zombie",//тип противника, можно использовать для разных паттернов поведения.
    health: 15,//текущее и максимальное здоровье.
    maxHealth: 15,//текущее и максимальное здоровье.
    strength: 4,//базовый урон.
    dexterity: 2,//шанс попадания / уклонения.
    hostility: 3,       // радиус преследования игрока
    position: { x: 0, y: 0 }, // координаты на уровне
    loot: 5             // количество сокровищ при победе
}

const item = {
    id: 1,
    type: "Food",            // тип предмета: еда
    subtype: "Apple",        // подтип предмета
    health: 5,               // восстанавливает 5 единиц здоровья
    maxHealth: 0,            // не влияет на максимальное здоровье
    strength: 0,             // не увеличивает силу
    dexterity: 0,            // не увеличивает ловкость
    value: 0                 // стоимость предмета (для сокровищ)

}

gameSession.levels.push(level1)
gameSession.levels[0].rooms.push(room)
gameSession.levels[0].rooms[0].enemies.push(enemy)
gameSession.levels[0].rooms[0].items.push(item)
console.log(gameSession);
//console.log(gameSession.levels[0].rooms); //Путь к комнатам
//console.log(gameSession.levels[0].rooms[0]); //Путь к противникам
//console.log(gameSession.levels[0].rooms[0]); //Путь к предметам


