import { gameSession } from "./gameSession.js";
import { createBackpack } from "./backpack.js";
import { attack } from "../gameplay/combat.js";

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
        // ⚗️ активные временные эффекты эликсиров
        activeEffects: [],

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
            this.backpack = createBackpack({ items: [], maxPerType: 9 });
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

            // делегируем применению предмета собственную логику
            item.use(this);

            // удалить использованный предмет
            // Оружие не тратится, но мы удаляем из рюкзака экземпляр, т.к. он экипирован
            this.backpack.splice(itemIndex, 1);
        },

        // --- экиповать оружие и уронить предыдущее на пол ---
        equipWeapon(newWeapon) {
            if (this.weapon) {
                const currentLevel = gameSession.levels[this.level - 1];
                const room = currentLevel.rooms.find(r => r.id === this.currentRoomId);
                if (room) {
                    // Положим старое оружие на соседнюю клетку
                    const dirs = [
                        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
                    ];
                    const d = dirs[Math.floor(Math.random() * dirs.length)];
                    const dropX = Math.max(0, Math.min(room.size.width - 1, this.position.x + d.x));
                    const dropY = Math.max(0, Math.min(room.size.height - 1, this.position.y + d.y));
                    this.weapon.position = { x: dropX, y: dropY };
                    room.items.push(this.weapon);
                }
            }
            this.weapon = newWeapon;
        },

        // --- применить временный эффект (эликсир) ---
        applyTemporaryEffect({ stat, amount, turns }) {
            this[stat] = (this[stat] ?? 0) + amount;
            this.activeEffects.push({ stat, amount, turns });
        },

        // --- применить постоянный буст (свиток) ---
        applyPermanentBoost({ stat, amount }) {
            this[stat] = (this[stat] ?? 0) + amount;
            if (stat === "maxHealth") {
                // При росте максимального здоровья — сразу растёт текущее
                this.currentHealth += amount;
            }
        },

        // --- тик эффектов: уменьшаем длительность и откатываем бафы ---
        tickEffects() {
            if (!this.activeEffects.length) return;
            this.activeEffects.forEach(e => (e.turns -= 1));
            const expired = this.activeEffects.filter(e => e.turns <= 0);
            // откатываем истёкшие эффекты
            expired.forEach(e => {
                this[e.stat] = (this[e.stat] ?? 0) - e.amount;
                if (e.stat === "maxHealth") {
                    // Клэмпим здоровье и страхуемся на минимальное 1, если стало ≤ 0
                    if (this.currentHealth > this.maxHealth) this.currentHealth = this.maxHealth;
                    if (this.currentHealth <= 0) this.currentHealth = 1;
                }
            });
            this.activeEffects = this.activeEffects.filter(e => e.turns > 0);
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
                // Предметы теперь лежат на клетках — автоподбор будет при шаге по клетке
            }
        },

        // --- перемещение внутри комнаты на dx,dy; автоподбор и контакт-атака ---
        moveInRoom(dx, dy) {
            const currentLevel = gameSession.levels[this.level - 1];
            const room = currentLevel.rooms.find(r => r.id === this.currentRoomId);
            if (!room) return false;

            const nx = Math.max(0, Math.min(room.size.width - 1, this.position.x + dx));
            const ny = Math.max(0, Math.min(room.size.height - 1, this.position.y + dy));
            this.position = { x: nx, y: ny };

            // Подбор предметов по наступанию на клетку
            let remaining = [];
            for (const it of room.items) {
                if (it.position && it.position.x === nx && it.position.y === ny) {
                    this.backpack.add(it);
                } else {
                    remaining.push(it);
                }
            }
            room.items = remaining;

            // Если наступили на клетку с врагом — инициация боя (один удар от игрока)
            const enemy = room.enemies.find(e => e.position && e.position.x === nx && e.position.y === ny && e.currentHealth > 0);
            if (enemy) {
                // Если это призрак и он невидим — становится видимым, бой со следующего удара
                if (enemy.type === 'Ghost' && enemy._invisible) {
                    enemy._invisible = false;
                    console.log("👻 Привидение проявилось!");
                    return true;
                }
                // простой контакт-бой: один удар игрока в свой ход
                attack(this, enemy);
            }
            return true;
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
