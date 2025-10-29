export function createItem(option) {
  const item = {
    id: option.id,
    type: option.type,         // "Food" | "Weapon" | "Treasure"
    subtype: option.subtype,   // "Apple", "Sword", "Gold"
    health: option.health ?? 0,
    maxHealth: option.maxHealth ?? 0,
    strength: option.strength ?? 0,
    dexterity: option.dexterity ?? 0,
    value: option.value ?? 0,

    // --- метод: использование предмета ---
    use(target) {
      switch (this.type) {
        case "Food":
          target.heal(this.health);
          console.log(`${target.name} съел ${this.subtype} и восстановил ${this.health} HP`);
          break;

        case "Weapon":
          target.weapon = this;
          console.log(`${target.name} экипировал ${this.subtype} (+${this.strength} силы)`);
          break;

        case "Treasure":
          target.gold += this.value;
          console.log(`${target.name} получил ${this.value} золота 💰`);
          break;

        default:
          console.log("Неизвестный тип предмета");
      }
    },
  };

  return item;
}

// использовать в другом файле

// import { createItem } from "./items.js";
// import { createCharacter } from "./character.js";

// const hero = createCharacter({ name: "Герой" });

// const apple = createItem({
//   id: 1,
//   type: "Food",
//   subtype: "Apple",
//   health: 10,
// });

// const sword = createItem({
//   id: 2,
//   type: "Weapon",
//   subtype: "Sword",
//   strength: 5,
// });

// apple.use(hero);  // Герой съел Apple и восстановил 10 HP
// sword.use(hero);  // Герой экипировал Sword (+5 силы)
