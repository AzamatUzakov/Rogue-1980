import { gameSession } from "./gameSession.js";
import { createEnemy } from "./enemy.js";
import { createItem } from "./item.js";
import { generateConnectedLevel } from "../world/generator.js";

export function createLevel(options) {
    return {
        id: options.id,
        rooms: [],
        corridors: [],
        startRoomId: 0,
        exitRoomId: 8,
    };
}

function generateRooms(level) {
}

function generateConnectedCorridors(level) {
}

function populateRooms(level, levelIndex) {
    const difficulty = levelIndex;
    const enemyCountBase = 1 + Math.floor(difficulty / 3);
    const foodCountBase = Math.max(4 - Math.floor(difficulty / 4), 0);
    const lootMultiplier = 1 + Math.floor(difficulty / 5);

    level.rooms.forEach((room) => {
        if (room.isStart) return;

        const enemiesInRoom = enemyCountBase + Math.floor(Math.random() * 2);
        for (let i = 0; i < enemiesInRoom; i++) {
            room.enemies.push(
                createEnemy({
                    name: `Enemy_L${difficulty}_${room.id}_${i}`,
                    type: "Zombie",
                    maxHealth: 10 + difficulty * 3,
                    currentHealth: 10 + difficulty * 3,
                    strength: 2 + Math.floor(difficulty / 2),
                    dexterity: 2 + Math.floor(difficulty / 6),
                    agroRange: 2 + Math.floor(difficulty / 7),
                    position: { x: Math.floor(Math.random() * room.size.width), y: Math.floor(Math.random() * room.size.height) },
                    movePattern: "idle",
                })
            );
        }

        const foodsInRoom = foodCountBase + (Math.random() < 0.3 ? 1 : 0);
        for (let f = 0; f < foodsInRoom; f++) {
            room.items.push(
                createItem({
                    id: `${level.id}-${room.id}-F${f}`,
                    type: "Food",
                    subtype: "Apple",
                    health: 5,
                    position: { x: Math.floor(Math.random() * room.size.width), y: Math.floor(Math.random() * room.size.height) },
                })
            );
        }

        if (Math.random() < 0.2) {
            room.items.push(
                createItem({
                    id: `${level.id}-${room.id}-W0`,
                    type: "Weapon",
                    subtype: "Sword",
                    strength: 2 + Math.floor(difficulty / 5),
                    damage: 3 + Math.floor(difficulty / 6),
                    position: { x: Math.floor(Math.random() * room.size.width), y: Math.floor(Math.random() * room.size.height) },
                })
            );
        }

        if (Math.random() < 0.15) {
            room.items.push(
                createItem({
                    id: `${level.id}-${room.id}-E0`,
                    type: "Elixir",
                    subtype: "DexterityElixir",
                    stat: "dexterity",
                    amount: 2,
                    duration: 5,
                    position: { x: Math.floor(Math.random() * room.size.width), y: Math.floor(Math.random() * room.size.height) },
                })
            );
        }

        if (Math.random() < 0.15) {
            room.items.push(
                createItem({
                    id: `${level.id}-${room.id}-S0`,
                    type: "Scroll",
                    subtype: "HealthScroll",
                    stat: "maxHealth",
                    amount: 5,
                    position: { x: Math.floor(Math.random() * room.size.width), y: Math.floor(Math.random() * room.size.height) },
                })
            );
        }
    });
}

export function generateLevel(levelIndex) {
    const generated = generateConnectedLevel(levelIndex);
    const level = {
        id: generated.id,
        rooms: generated.rooms,
        corridors: generated.corridors,
        startRoomId: generated.startRoomId,
        exitRoomId: generated.exitRoomId,
        width: generated.width,
        height: generated.height,
    };
    populateRooms(level, levelIndex);
    return level;
}

export function initializeLevels() {
    gameSession.levels = [];
    for (let i = 1; i <= 21; i++) {
        const level = generateLevel(i);
        gameSession.levels.push(level);
    }
}