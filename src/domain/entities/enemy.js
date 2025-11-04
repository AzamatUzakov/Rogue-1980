export function createEnemy(options) {
  const enemy = {
    name: options.name ?? "Enemy",
    type: options.type ?? "Zombie",
    maxHealth: options.maxHealth ?? 100,
    currentHealth: options.currentHealth ?? options.maxHealth ?? 100,
    strength: options.strength ?? 2,
    dexterity: options.dexterity ?? 2,
    hostility: options.hostility ?? true, // враждебность
    agroRange: options.agroRange ?? 3, // радиус, с которого враг агрится
    position: options.position ?? { x: 0, y: 0 }, // позиция на карте
    movePattern: options.movePattern ?? "idle", // idle, patrol, chase

    // --- метод: показать здоровье ---
    showHealth() {
      console.log(`${this.name} HP: ${this.currentHealth}/${this.maxHealth}`);
    },

    // --- метод: получить урон ---
    takeDamage(amount) {
      this.currentHealth -= amount;
      console.log(`${this.name} получил урон: -${amount} HP`);

      if (this.currentHealth <= 0) {
        this.currentHealth = 0;
        this.die();
      }

      this.showHealth();
    },

    // --- метод: смерть ---
    die() {
      console.log(`💀 ${this.name} побеждён!`);
    },

    // --- метод: проверка агро-зоны ---
    checkAggro(playerPosition) {
      const dx = Math.abs(playerPosition.x - this.position.x);
      const dy = Math.abs(playerPosition.y - this.position.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (this.hostility && distance <= this.agroRange) {
        console.log(`${this.name} заметил игрока!`);
        this.movePattern = "chase";
      }
    },

    // --- метод: движение ---
    move() {
      if (this.movePattern === "idle") return;

      if (this.movePattern === "patrol") {
        const dir = Math.random() < 0.5 ? -1 : 1;
        this.position.x += dir;
        console.log(`${this.name} патрулирует (${this.position.x}, ${this.position.y})`);
      }

      if (this.movePattern === "chase") {
        console.log(`${this.name} бежит к игроку!`);
      }
    },
  };

  return enemy;
}

// EXAMPLES

// 🧟 Зомби — медленный, но живучий
const zombie = createEnemy({
  name: "Zombie",
  type: "Zombie",
  maxHealth: 80,
  strength: 3,
  dexterity: 2,
  agroRange: 2,
  movePattern: "patrol",
});

// 🦇 Вампир — быстрый, первый удар всегда промах
const vampire = createEnemy({
  name: "Vampire",
  type: "Vampire",
  maxHealth: 60,
  strength: 4,
  dexterity: 7,
  agroRange: 4,
});

// 👻 Призрак — слабый, но почти неуязвимый
const ghost = createEnemy({
  name: "Ghost",
  type: "Ghost",
  maxHealth: 40,
  strength: 2,
  dexterity: 8,
  hostility: true,
});

// 👹 Ог — сильный, но медленный
const ogre = createEnemy({
  name: "Ogre",
  type: "Ogre",
  maxHealth: 120,
  strength: 8,
  dexterity: 1,
  agroRange: 3,
});

// 🐍 Змей-маг — ловкий и хитрый
const snakeMage = createEnemy({
  name: "SnakeMage",
  type: "SnakeMage",
  maxHealth: 50,
  strength: 5,
  dexterity: 6,
  agroRange: 5,
});
