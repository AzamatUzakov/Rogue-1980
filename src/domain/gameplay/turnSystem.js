// turnSystem.js
import { attack } from "./combat.js";
import { gameSession } from "../entities/gameSession.js";
import { highScores } from "../entities/highscores.js";

export function createTurnSystem() {
    const turnSystem = {
        isPlayerTurn: true,
        currentLevelIndex: 0,
        turnCount: 0,
        playerAsleepTurns: 0, // счётчик сна игрока (задерживает ход)

        // Главная функция хода игрока
        playerAction(actionType, data) {
            if (!this.isPlayerTurn) {
                console.log("🚫 Сейчас не ваш ход!");
                return false;
            }

            // Если игрок усыплён — пропускает ход
            if (this.playerAsleepTurns > 0) {
                console.log("😴 Вы усыплены и пропускаете ход");
                this.playerAsleepTurns -= 1;
                this.isPlayerTurn = false;
                this.enemyTurn();
                this.turnCount++;
                return true;
            }

            console.log(`🎮 Ход ${this.turnCount + 1}: Игрок выполняет ${actionType}`);

            // Выполняем действие игрока
            let actionSuccess = false;
            switch (actionType) {
                case 'move':
                    actionSuccess = this.executePlayerMove(data.roomId);
                    break;
                case 'moveInRoom':
                    actionSuccess = this.executePlayerMoveInRoom(data.dx, data.dy);
                    break;
                case 'attack':
                    actionSuccess = this.executePlayerAttack(data.enemyId);
                    break;
                case 'useItem':
                    actionSuccess = this.executePlayerUseItem(data.itemId);
                    break;
                case 'pickup':
                    actionSuccess = this.executePlayerPickup(data.itemId);
                    break;
                case 'wait':
                    actionSuccess = this.executePlayerWait();
                    break;
            }

            if (actionSuccess) {
                // Передаем ход врагам
                this.isPlayerTurn = false;
                this.enemyTurn();
                this.turnCount++;
            }

            return actionSuccess;
        },

        executePlayerMove(targetRoomId) {
            const character = gameSession.player;
            return character.moveToRoom(targetRoomId);
        },

        executePlayerMoveInRoom(dx, dy) {
            const character = gameSession.player;
            return character.moveInRoom(dx, dy);
        },

        executePlayerAttack(enemyId) {
            const character = gameSession.player;
            const currentRoom = this.getCurrentRoom();
            const enemy = currentRoom.enemies.find(e => e.id === enemyId);

            if (enemy && enemy.currentHealth > 0) {
                attack(character, enemy);

                // Если враг умер, убираем его из комнаты
                if (enemy.currentHealth <= 0) {
                    const enemyIndex = currentRoom.enemies.indexOf(enemy);
                    if (enemyIndex > -1) {
                        currentRoom.enemies.splice(enemyIndex, 1);
                        console.log(`💀 ${enemy.name} повержен и удален из комнаты!`);
                    }
                }
                return true;
            }
            console.log("❌ Враг не найден или уже мертв");
            return false;
        },

        executePlayerUseItem(itemId) {
            const character = gameSession.player;
            character.useItem(itemId);
            return true;
        },

        executePlayerPickup(itemId) {
            const character = gameSession.player;
            const currentRoom = this.getCurrentRoom();
            const itemIndex = currentRoom.items.findIndex(i => i.id === itemId);

            if (itemIndex !== -1) {
                const item = currentRoom.items[itemIndex];
                if (character.backpack.add(item)) {
                    currentRoom.items.splice(itemIndex, 1);
                    console.log(`✅ Подобран предмет: ${item.subtype}`);
                    return true;
                }
            }
            console.log("❌ Предмет не найден");
            return false;
        },

        executePlayerWait() {
            console.log("⏳ Игрок пропускает ход");
            return true;
        },

        enemyTurn() {
            console.log("🎭 Ход противников...");
            const currentLevel = gameSession.levels[this.currentLevelIndex];
            let enemyActions = 0;

            // Все живые враги на уровне делают ход
            currentLevel.rooms.forEach(room => {
                room.enemies.forEach(enemy => {
                    if (enemy.currentHealth > 0) {
                        this.executeEnemyAction(enemy, room);
                        enemyActions++;
                    }
                });
            });

            console.log(`🤖 Выполнено действий врагов: ${enemyActions}`);

            // Проверяем состояние после хода врагов
            this.checkLevelCompletion();
            this.checkPlayerDeath();

            // Тикаем временные эффекты игрока
            gameSession.player.tickEffects();

            // Возвращаем ход игроку
            this.isPlayerTurn = true;
            console.log("🎮 Ваш ход!");
        },

        executeEnemyAction(enemy, room) {
            const character = gameSession.player;
            const currentLevel = gameSession.levels[this.currentLevelIndex];

            // Если враг в той же комнате, что и игрок - атакует
            if (room.id === character.currentRoomId) {
                console.log(`⚔️ ${enemy.name} атакует игрока!`);
                // Особое поведение огра: отдых после атаки
                if (enemy._restTurns && enemy._restTurns > 0) {
                    enemy._restTurns -= 1;
                    console.log(`${enemy.name} отдыхает.`);
                    return;
                }
                // Если у огра помечена гарантированная контратака — бьёт дважды
                if (enemy._counterNext) {
                    attack(enemy, character);
                    enemy._counterNext = false;
                }
                attack(enemy, character);
                // После успешной атаки некоторые типы накладывают эффекты
                if (enemy.type === "Vampire") {
                    // Вампир отнимает часть максимального HP
                    character.maxHealth = Math.max(1, character.maxHealth - 1);
                    if (character.currentHealth > character.maxHealth) character.currentHealth = character.maxHealth;
                }
                if (enemy.type === "Ogre") {
                    // Огр отдыхает один ход после атаки
                    enemy._restTurns = 1;
                    enemy._counterNext = true; // затем гарантированно контратакует
                }
                if (enemy.type === "SnakeMage") {
                    // Шанс усыпить игрока на 1 ход
                    if (Math.random() < 0.3) {
                        this.playerAsleepTurns = 1;
                        console.log("💤 Вас усыпили на 1 ход!");
                    }
                }
            } else {
                // Иначе двигается. При агро — идёт к игроку по комнатам, иначе по паттерну
                enemy.checkAggro(character.position);
                if (enemy.movePattern === 'chase') {
                    const path = this.shortestRoomPath(currentLevel, room.id, character.currentRoomId);
                    if (path && path.length > 1) {
                        const nextRoomId = path[1];
                        const nextRoom = currentLevel.rooms.find(r => r.id === nextRoomId);
                        if (nextRoom) {
                            // переносим врага в соседнюю комнату по коридору
                            const idx = room.enemies.indexOf(enemy);
                            if (idx > -1) room.enemies.splice(idx, 1);
                            enemy.position = { x: Math.floor(Math.random() * nextRoom.size.width), y: Math.floor(Math.random() * nextRoom.size.height) };
                            nextRoom.enemies.push(enemy);
                            return;
                        }
                    }
                }
                // если пути нет — двигается внутри комнаты по своему паттерну
                enemy.move(room);
            }
        },

        // Поиск кратчайшего пути по комнатам с использованием коридоров
        shortestRoomPath(level, startId, goalId) {
            if (startId === goalId) return [startId];
            const graph = new Map();
            level.corridors.forEach(c => {
                if (!graph.has(c.from)) graph.set(c.from, []);
                if (!graph.has(c.to)) graph.set(c.to, []);
                if (!c.locked) {
                    graph.get(c.from).push(c.to);
                    graph.get(c.to).push(c.from);
                }
            });
            const queue = [startId];
            const prev = new Map();
            const visited = new Set([startId]);
            while (queue.length) {
                const cur = queue.shift();
                const neighbors = graph.get(cur) || [];
                for (const nb of neighbors) {
                    if (visited.has(nb)) continue;
                    visited.add(nb);
                    prev.set(nb, cur);
                    if (nb === goalId) {
                        // восстановим путь
                        const path = [goalId];
                        let p = goalId;
                        while (prev.has(p)) { p = prev.get(p); path.unshift(p); }
                        return path;
                    }
                    queue.push(nb);
                }
            }
            return null;
        },

        getCurrentRoom() {
            const character = gameSession.player;
            const currentLevel = gameSession.levels[this.currentLevelIndex];
            return currentLevel.rooms.find(room => room.id === character.currentRoomId);
        },

        checkLevelCompletion() {
            const character = gameSession.player;
            const currentRoom = this.getCurrentRoom();

            if (currentRoom && currentRoom.isExit) {
                console.log("🚪 Найден выход с уровня!");
                character.goToNextLevel();
                this.currentLevelIndex = character.level - 1;

                // Если прошли все уровни
                if (character.level > 21) {
                    console.log("🎉 Победа! Вы прошли все 21 уровень!");
                    highScores.addScore(character.name, 21, character.gold);
                    this.gameOver(true);
                }
            }
        },

        checkPlayerDeath() {
            const character = gameSession.player;
            if (character.currentHealth <= 0) {
                console.log("💀 Игрок погиб! Добавляем в таблицу рекордов...");
                highScores.addScore(character.name, character.level, character.gold);
                this.gameOver(false);
            }
        },

        gameOver(isVictory) {
            if (isVictory) {
                console.log("🏆 ПОБЕДА! Вы прошли все 21 уровень!");
            } else {
                console.log("💀 ГAME OVER");
                // Автоматический рестарт через 2 секунды
                setTimeout(() => {
                    gameSession.player.die();
                    this.reset();
                }, 2000);
            }
        },

        reset() {
            this.isPlayerTurn = true;
            this.currentLevelIndex = 0;
            this.turnCount = 0;
            console.log("🔄 Игра перезапущена! Ваш ход.");
        },

        // Получить доступные действия для текущей комнаты
        getAvailableActions() {
            const currentRoom = this.getCurrentRoom();
            const character = gameSession.player;

            return {
                canMove: true, // всегда можно перемещаться
                enemies: currentRoom ? currentRoom.enemies.filter(e => e.currentHealth > 0) : [],
                items: currentRoom ? currentRoom.items : [],
                backpack: character.backpack.items
            };
        },

        // Получить текущее состояние игры
        getGameState() {
            return {
                isPlayerTurn: this.isPlayerTurn,
                turnCount: this.turnCount,
                currentLevel: this.currentLevelIndex + 1,
                playerHealth: gameSession.player.currentHealth,
                playerRoom: gameSession.player.currentRoomId,
                gold: gameSession.player.gold
            };
        }
    };

    return turnSystem;
}

// Создаем глобальный экземпляр
export const turnSystem = createTurnSystem();