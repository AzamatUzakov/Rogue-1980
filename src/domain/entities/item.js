export function createItem(option) {
  const item = {
    id: option.id,
    type: option.type,         // "Food" | "Weapon" | "Treasure"
    subtype: option.subtype,   // "Apple", "Sword", "Gold"
    position: option.position ?? null, // позиция в комнате (для подбора наступанием)
    health: option.health ?? 0,
    maxHealth: option.maxHealth ?? 0,
    strength: option.strength ?? 0,
    dexterity: option.dexterity ?? 0,
    value: option.value ?? 0,
    // Новые поля для простых баф-типов
    stat: option.stat,         // для Elixir/Scroll: имя характеристики
    amount: option.amount ?? 0, // величина изменения характеристики
    duration: option.duration ?? 0, // для Elixir: количество ходов

    // --- метод: использование предмета ---
    use(target) {
      switch (this.type) {
        case "Food":
          target.heal(this.health);
          console.log(`${target.name} съел ${this.subtype} и восстановил ${this.health} HP`);
          break;

        case "Weapon":
          // При смене оружия — старое оружие падает на пол (в комнату)
          target.equipWeapon(this);
          console.log(`${target.name} экипировал ${this.subtype} (+${this.strength} силы)`);
          break;

        case "Treasure":
          target.gold += this.value;
          console.log(`${target.name} получил ${this.value} золота 💰`);
          break;

        case "Elixir":
          // Временный баф на указанную характеристику
          target.applyTemporaryEffect({ stat: this.stat, amount: this.amount, turns: this.duration });
          console.log(`${target.name} выпил эликсир: +${this.amount} к ${this.stat} на ${this.duration} ходов`);
          break;

        case "Scroll":
          // Постоянное повышение указанной характеристики
          target.applyPermanentBoost({ stat: this.stat, amount: this.amount });
          console.log(`${target.name} прочитал свиток: +${this.amount} к ${this.stat} (постоянно)`);
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
