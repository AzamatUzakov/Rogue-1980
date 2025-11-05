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
        backpack: options.backpack ?? [],
        gold: options.gold ?? 0,
        activeEffects: [],

        takeDamage(amount) {
            this.currentHealth -= amount;
            console.log(`Получен урон: -${amount} HP`);

            if (this.currentHealth <= 0) {
                this.currentHealth = 0;
                this.die();
            }

            this.showHealth();
        },

        heal(amount) {
            this.currentHealth += amount;
            if (this.currentHealth > this.maxHealth) {
                this.currentHealth = this.maxHealth;
            }
            console.log(`Восстановлено ${amount} HP`);
            this.showHealth();
        },

        showHealth() {
            console.log(`❤️ Здоровье: ${this.currentHealth}/${this.maxHealth}`);
        },

        die() {
            console.log("💀 Вы умерли. Игра окончена!");
            this.level = 1;
            this.currentHealth = this.maxHealth;
            this.backpack = createBackpack({ items: [], maxPerType: 9 });
            this.gold = 0;
            this.currentRoomId = 0;
            gameSession.currentLevel = 1;
            gameSession.score = 0;
            gameSession.startTime = Date.now();
            gameSession.inventory = [];
            gameSession.isActive = true;
            if (gameSession.player) {
                gameSession.player.health = gameSession.player.maxHealth;
            }
            console.log("🔁 Игра начата заново!");
            console.log(`🏁 Уровень: ${gameSession.currentLevel}, ❤️ Здоровье: ${gameSession.player.health}/${gameSession.player.maxHealth}`);
        },

        addItem(item) {
            this.backpack.push(item);
            console.log(`🎒 Добавлен предмет: ${item.subtype}`);
        },

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

        useItem(itemId) {
            const itemIndex = this.backpack.findIndex((i) => i.id === itemId);
            if (itemIndex === -1) {
                console.log("❌ Такого предмета нет.");
                return;
            }

            const item = this.backpack[itemIndex];
            item.use(this);
            this.backpack.splice(itemIndex, 1);
        },

        equipWeapon(newWeapon) {
            if (this.weapon) {
                const currentLevel = gameSession.levels[this.level - 1];
                const room = currentLevel.rooms.find(r => r.id === this.currentRoomId);
                if (room) {
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

        applyTemporaryEffect({ stat, amount, turns }) {
            this[stat] = (this[stat] ?? 0) + amount;
            this.activeEffects.push({ stat, amount, turns });
        },

        applyPermanentBoost({ stat, amount }) {
            this[stat] = (this[stat] ?? 0) + amount;
            if (stat === "maxHealth") {
                this.currentHealth += amount;
            }
        },

        tickEffects() {
            if (!this.activeEffects.length) return;
            this.activeEffects.forEach(e => (e.turns -= 1));
            const expired = this.activeEffects.filter(e => e.turns <= 0);
            expired.forEach(e => {
                this[e.stat] = (this[e.stat] ?? 0) - e.amount;
                if (e.stat === "maxHealth") {
                    if (this.currentHealth > this.maxHealth) this.currentHealth = this.maxHealth;
                    if (this.currentHealth <= 0) this.currentHealth = 1;
                }
            });
            this.activeEffects = this.activeEffects.filter(e => e.turns > 0);
        },

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
                this.position = {
                    x: Math.floor(Math.random() * startRoom.size.width),
                    y: Math.floor(Math.random() * startRoom.size.height)
                };
            }
            console.log(`📍 Вы появились в комнате №${this.currentRoomId} уровня ${this.level}.`);
        },

        moveToRoom(targetRoomId) {
            const currentLevel = gameSession.levels[this.level - 1];
            const currentRoom = this.currentRoomId;
            const corridor = currentLevel.corridors.find(c =>
                !c.locked &&
                ((c.from === currentRoom && c.to === targetRoomId) ||
                    (c.to === currentRoom && c.from === targetRoomId))
            );

            if (!corridor) {
                console.log("🚫 Путь между комнатами недоступен.");
                return;
            }
            this.currentRoomId = targetRoomId;
            console.log(`🚶 Вы перешли в комнату №${targetRoomId} уровня ${this.level}.`);
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

        moveInRoom(dx, dy) {
            const currentLevel = gameSession.levels[this.level - 1];
            const room = currentLevel.rooms.find(r => r.id === this.currentRoomId);
            if (!room) return false;

            const wantX = this.position.x + dx;
            const wantY = this.position.y + dy;
            const insideX = wantX >= 0 && wantX < room.size.width;
            const insideY = wantY >= 0 && wantY < room.size.height;

            if (insideX && insideY) {
                this.position = { x: wantX, y: wantY };
            } else {
                const globalX = room.position.x + this.position.x + dx;
                const globalY = room.position.y + this.position.y + dy;
                const corridors = currentLevel.corridors.filter(c => c.from === room.id || c.to === room.id);
                const corridor = corridors.find(c => c.path?.some(p => p.x === globalX && p.y === globalY));
                if (corridor) {
                    const targetRoomId = corridor.from === room.id ? corridor.to : corridor.from;
                    const targetRoom = currentLevel.rooms.find(r => r.id === targetRoomId);
                    if (targetRoom) {
                        let entry = null;
                        for (const p of corridor.path) {
                            const inside = p.x >= targetRoom.position.x && p.x < targetRoom.position.x + targetRoom.size.width &&
                                p.y >= targetRoom.position.y && p.y < targetRoom.position.y + targetRoom.size.height;
                            if (inside) { entry = p; break; }
                        }
                        if (!entry) entry = { x: Math.max(targetRoom.position.x, Math.min(targetRoom.position.x + targetRoom.size.width - 1, globalX)),
                            y: Math.max(targetRoom.position.y, Math.min(targetRoom.position.y + targetRoom.size.height - 1, globalY)) };
                        this.currentRoomId = targetRoomId;
                        this.position = { x: entry.x - targetRoom.position.x, y: entry.y - targetRoom.position.y };
                        return true;
                    }
                }
                return false;
            }
            let remaining = [];
            for (const it of room.items) {
                if (it.position && it.position.x === nx && it.position.y === ny) {
                    this.backpack.add(it);
                } else {
                    remaining.push(it);
                }
            }
            room.items = remaining;
            const enemy = room.enemies.find(e => e.position && e.position.x === this.position.x && e.position.y === this.position.y && e.currentHealth > 0);
            if (enemy) {
                if (enemy.type === 'Ghost' && enemy._invisible) {
                    enemy._invisible = false;
                    console.log("👻 Привидение проявилось!");
                    return true;
                }
                attack(this, enemy);
            }
            return true;
        },

    };
    console.log("-------------------------", character.level);


    return character;
}
