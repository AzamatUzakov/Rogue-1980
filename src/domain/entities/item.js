export function createItem(option) {
  const item = {
    id: option.id,
    type: option.type,
    subtype: option.subtype,
    position: option.position ?? null,
    health: option.health ?? 0,
    maxHealth: option.maxHealth ?? 0,
    strength: option.strength ?? 0,
    dexterity: option.dexterity ?? 0,
    value: option.value ?? 0,
    stat: option.stat,
    amount: option.amount ?? 0,
    duration: option.duration ?? 0,

    use(target) {
      switch (this.type) {
        case "Food":
          target.heal(this.health);
          console.log(`${target.name} съел ${this.subtype} и восстановил ${this.health} HP`);
          break;

        case "Weapon":
          target.equipWeapon(this);
          console.log(`${target.name} экипировал ${this.subtype} (+${this.strength} силы)`);
          break;

        case "Treasure":
          target.gold += this.value;
          console.log(`${target.name} получил ${this.value} золота 💰`);
          break;

        case "Elixir":
          target.applyTemporaryEffect({ stat: this.stat, amount: this.amount, turns: this.duration });
          console.log(`${target.name} выпил эликсир: +${this.amount} к ${this.stat} на ${this.duration} ходов`);
          break;

        case "Scroll":
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
