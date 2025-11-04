import { gameSession } from "./gameSession.js";
import { createEnemy } from "./enemy.js";
import { createItem } from "./item.js";

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
    for (let roomId = 0; roomId < 9; roomId++) {
        level.rooms.push({
            id: roomId,
            position: { x: roomId % 3, y: Math.floor(roomId / 3) },
            size: { width: 10, height: 8 },
            enemies: [],
            items: [],
            isStart: roomId === level.startRoomId,
            isExit: roomId === level.exitRoomId,
        });
    }
}

// generateConnectedCorridors: соединяет комнаты в связный граф (3x3 решётка)
function generateConnectedCorridors(level) {
    const toId = (x, y) => y * 3 + x;
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            const from = toId(x, y);
            if (x < 2) {
                level.corridors.push({ from, to: toId(x + 1, y), locked: false });
            }
            if (y < 2) {
                level.corridors.push({ from, to: toId(x, y + 1), locked: false });
            }
        }
    }
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
    const level = createLevel({ id: levelIndex });
    generateRooms(level);
    generateConnectedCorridors(level);
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