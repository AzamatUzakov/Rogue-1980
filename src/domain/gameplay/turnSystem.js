// turnSystem.js
import { attack } from "./combat.js";
import { gameSession } from "../entities/gameSession.js";
import { highScores } from "../entities/highscores.js";

export function createTurnSystem() {
    const turnSystem = {
        isPlayerTurn: true,
        currentLevelIndex: 0,
        turnCount: 0,

        // Главная функция хода игрока
        playerAction(actionType, data) {
            if (!this.isPlayerTurn) {
                console.log("🚫 Сейчас не ваш ход!");
                return false;
            }

            console.log(`🎮 Ход ${this.turnCount + 1}: Игрок выполняет ${actionType}`);

            // Выполняем действие игрока
            let actionSuccess = false;
            switch (actionType) {
                case 'move':
                    actionSuccess = this.executePlayerMove(data.roomId);
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

            // Возвращаем ход игроку
            this.isPlayerTurn = true;
            console.log("🎮 Ваш ход!");
        },

        executeEnemyAction(enemy, room) {
            const character = gameSession.player;

            // Если враг в той же комнате, что и игрок - атакует
            if (room.id === character.currentRoomId) {
                console.log(`⚔️ ${enemy.name} атакует игрока!`);
                attack(enemy, character);
            } else {
                // Иначе двигается (упрощенная логика)
                enemy.checkAggro(character.position);
                enemy.move();
            }
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