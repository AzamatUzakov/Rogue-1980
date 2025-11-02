import { gameSession } from "./gameSession.js";
import { createEnemy } from "./enemy.js";
import { createItem } from "./item.js";

function optionIdGen() {
    return Math.floor(Math.random() * 1000000);
}

function roomIdGen() {
    return Math.floor(Math.random() * 1000000);
}


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
        generateEntities(option.enemies, option.items, option.isStart, levelIndex)
    }
});


function generateEntities(enemy, items, isStart, levelIndex) {

    //для предметов
    const itemTemplates = [
        {
            id: 1,
            type: "Food",
            subtype: "Apple",
            health: 10,
        },
        {
            id: 2,
            type: "Weapon",
            subtype: "Sword",
            strength: 3,
            damage: 5,
        },
        {
            id: 3,
            type: "Treasure",
            subtype: "Gold",
            value: 20,
        },
    ];
    const randomIndex = Math.floor(Math.random() * itemTemplates.length);
    const template = itemTemplates[randomIndex];
    if (isStart === false) {
        enemy.push(createEnemy({
            id: `${levelIndex}-${optionIdGen()}`, // сделайте функцию генерации id
            name: `Enemy_L${levelIndex}`,
            type: "Zombie",
            maxHealth: 10 + levelIndex * 2,
            strength: 2 + Math.floor(levelIndex / 2),
            dexterity: 2,
            agroRange: 2,
            position: { x: 0, y: 0 },
            movePattern: "idle",
        }));
        // уникальный id для предмета
        const itemInstance = { ...template, id: `${levelIndex}-${roomIdGen()}` };
        items.push(createItem(itemInstance));
    }
    console.log(items);

}

