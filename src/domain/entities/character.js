import { gameSession } from "./gameSession.js";

export function createCharacter(options) {
    const character = {
        name: options.name ?? "Безымянный герой",
        level: options.level ?? 1,
        maxHealth: options.maxHealth ?? 100,
        currentHealth: options.currentHealth ?? options.maxHealth ?? 100,
        strength: options.strength ?? 5,
        dexterity: options.dexterity ?? 5,
        weapon: options.weapon ?? null,
        currentRoomId: 0,
        position: options.position ?? { x: 0, y: 0 },
        // 🎒 новое
        backpack: options.backpack ?? [],
        gold: options.gold ?? 0,

        // --- метод: получить урон ---
        takeDamage(amount) {
            this.currentHealth -= amount;
            console.log(`Получен урон: -${amount} HP`);

            if (this.currentHealth <= 0) {
                this.currentHealth = 0;
                this.die();
            }

            this.showHealth();
        },

        // --- метод: восстановить здоровье ---
        heal(amount) {
            this.currentHealth += amount;
            if (this.currentHealth > this.maxHealth) {
                this.currentHealth = this.maxHealth;
            }
            console.log(`Восстановлено ${amount} HP`);
            this.showHealth();
        },

        // --- показать здоровье ---
        showHealth() {
            console.log(`❤️ Здоровье: ${this.currentHealth}/${this.maxHealth}`);
        },

        // --- смерть ---
        die() {
            console.log("💀 Вы умерли. Игра окончена!");

            // 🔁 Сброс состояния игрока
            this.level = 1;
            this.currentHealth = this.maxHealth;
            this.backpack = [];
            this.gold = 0;
            this.currentRoomId = 0;

            // 🔁 Сброс состояния сессии
            gameSession.currentLevel = 1;
            gameSession.score = 0;
            gameSession.startTime = Date.now();
            gameSession.inventory = [];
            gameSession.isActive = true;

            // Обновляем здоровье игрока через gameSession, если нужно
            if (gameSession.player) {
                gameSession.player.health = gameSession.player.maxHealth;
            }

            console.log("🔁 Игра начата заново!");
            console.log(`🏁 Уровень: ${gameSession.currentLevel}, ❤️ Здоровье: ${gameSession.player.health}/${gameSession.player.maxHealth}`);
        },

        // --- добавить предмет ---
        addItem(item) {
            this.backpack.push(item);
            console.log(`🎒 Добавлен предмет: ${item.subtype}`);
        },

        // --- показать инвентарь ---
        showInventory() {
            if (this.backpack.length === 0) {
                console.log("📭 Рюкзак пуст.");
            } else {
                console.log("🎒 Рюкзак содержит:");
                this.backpack.forEach((item, i) => {
                    console.log(`${i + 1}. ${item.type} - ${item.subtype}`);
                });
            }
        },

        // --- использовать предмет ---
        useItem(itemId) {
            const itemIndex = this.backpack.findIndex((i) => i.id === itemId);
            if (itemIndex === -1) {
                console.log("❌ Такого предмета нет.");
                return;
            }

            const item = this.backpack[itemIndex];

            if (item.type === "Food") {
                this.heal(item.health);
                console.log(`🍎 Вы съели ${item.subtype}.`);
            } else if (item.type === "Weapon") {
                this.weapon = item;
                console.log(`🗡️ Вы экипировали ${item.subtype}.`);
            } else if (item.type === "Treasure") {
                this.gold += item.value;
                console.log(`💰 Вы подобрали сокровище: +${item.value} золота.`);
            }

            // удалить использованный предмет
            this.backpack.splice(itemIndex, 1);
        },

        // --- переход на новый уровень ---
        goToNextLevel() {
            this.level += 1;
            console.log(`🚪 Вы перешли на уровень ${this.level}!`);
            const nextLevel = gameSession.levels.find(lvl => lvl.id === this.level)

            if (!nextLevel) {
                console.log("🎉 Вы прошли все уровни! Игра завершена!");
                return
            }

            this.currentRoomId = nextLevel.startRoomId
            const startRoom = nextLevel.rooms.find(r => r.id === this.currentRoomId);
            if (startRoom) {
                // случайная позиция внутри стартовой комнаты
                this.position = {
                    x: Math.floor(Math.random() * startRoom.size.width),
                    y: Math.floor(Math.random() * startRoom.size.height)
                };
            }
            console.log(`📍 Вы появились в комнате №${this.currentRoomId} уровня ${this.level}.`);
        },

        moveToRoom(targetRoomId) {// переход в другую комнату
            const currentLevel = gameSession.levels[this.level - 1]; // текущий уровень
            const currentRoom = this.currentRoomId;

            // соединяющий текущую и целевую комнаты
            const corridor = currentLevel.corridors.find(c =>
                !c.locked &&
                ((c.from === currentRoom && c.to === targetRoomId) ||
                    (c.to === currentRoom && c.from === targetRoomId))
            );

            if (!corridor) {
                console.log("🚫 Путь между комнатами недоступен.");
                return;
            }

            // перемещаем игрока
            this.currentRoomId = targetRoomId;
            console.log(`🚶 Вы перешли в комнату №${targetRoomId} уровня ${this.level}.`);

            // проверяем события комнаты
            const room = currentLevel.rooms.find(r => r.id === targetRoomId);

            if (room.isExit) {
                console.log("🚪 Это выход из уровня! Хотите перейти дальше?");
            }

            if (room.enemies.length > 0) {
                console.log(`⚔️ В комнате ${room.enemies.length} противников!`);
            }

            if (room.items.length > 0) {
                console.log(`🎁 В комнате есть предметы: ${room.items.map(i => i.subtype).join(", ")}`);
            }
        },

    };
    console.log("-------------------------", character.level);


    return character;
}
//console.log(createCharacter());

// пример использовния в другом файле:



// import { createCharacter } from "./character.js";
// import { createItem } from "./item.js";

// const hero = createCharacter({ name: "Леон", strength: 6 });
// const apple = createItem({
//   id: 1, type: "Food", subtype: "Apple", health: 10,
// });
// const sword = createItem({
//   id: 2, type: "Weapon", subtype: "Sword", strength: 3, damage: 5,
// });
// const gold = createItem({
//   id: 3, type: "Treasure", subtype: "Gold", value: 20,
// });

// hero.addItem(apple);
// hero.addItem(sword);
// hero.addItem(gold);
// hero.showInventory();

// hero.useItem(1); // еда — лечит
// hero.useItem(2); // оружие — экипируется
// hero.useItem(3); // золото — добавляется

// hero.goToNextLevel();
