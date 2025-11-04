import { gameSession } from "./gameSession.js";
import { createEnemy } from "./enemy.js";
import { createItem } from "./item.js";
import { generateConnectedLevel } from "../world/generator.js";

// createLevel: создаёт пустую структуру уровня с базовыми полями
export function createLevel(options) {
    return {
        id: options.id,
        rooms: [],
        corridors: [],
        startRoomId: 0,
        exitRoomId: 8,
    };
}

// generateRooms: создаёт 9 комнат и помечает стартовую и выход
function generateRooms(level) {
    // Секция перенесена в генератор мира; оставлено для совместимости вызовов
}

// generateConnectedCorridors: соединяет комнаты в связный граф (3x3 решётка)
function generateConnectedCorridors(level) {
    // Коридоры формируются генератором мира
}

// populateRooms: наполняет комнаты врагами/предметами с ростом сложности и лута
function populateRooms(level, levelIndex) {
    const difficulty = levelIndex; // 1..21
    const enemyCountBase = 1 + Math.floor(difficulty / 3);
    const foodCountBase = Math.max(4 - Math.floor(difficulty / 4), 0);
    const lootMultiplier = 1 + Math.floor(difficulty / 5);

    level.rooms.forEach((room) => {
        if (room.isStart) return; // стартовая комната пустая

        const enemiesInRoom = enemyCountBase + Math.floor(Math.random() * 2); // +0..1
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

        // Добавим шанс лёгкого оружия (без сокровищ в комнатах — сокровища только с врагов)
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

        // Шанс на эликсир (временный баф)
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

        // Шанс на свиток (постоянный баф)
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

// generateLevel: собирает комнаты, коридоры и наполнение для конкретного уровня
export function generateLevel(levelIndex) {
    // Генерация уровня с делением на 9 секций, случайными комнатами и коридорами с путями
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

// initializeLevels: создаёт и регистрирует 21 уровень в сессии
export function initializeLevels() {
    gameSession.levels = [];
    for (let i = 1; i <= 21; i++) {
        const level = generateLevel(i);
        gameSession.levels.push(level);
    }
}