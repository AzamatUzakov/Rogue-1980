export function attack(attacker, defender) {
  // 1. Вычисляем шанс попадания
  const hitChance = Math.min(
    0.9, // максимум 90%
    Math.max(0.1, 0.5 + (attacker.dexterity - defender.dexterity) * 0.05)
  );

  // 2. Проверяем, попал ли атакующий
  if (Math.random() > hitChance) {
    console.log(`${attacker.name ?? "Персонаж"} промахнулся!`);
    return;
  }

  // 3. Урон зависит от силы
  const baseDamage = attacker.strength;
  const weaponBonus = attacker.weapon?.damage ?? 0;
  const totalDamage = baseDamage + weaponBonus;

  // 4. Наносим урон противнику
  defender.takeDamage(totalDamage);
  console.log(
    `${attacker.name ?? "Атакующий"} попал по ${
      defender.name ?? "цели"
    } на ${totalDamage} урона!`
  );

  // 5. Если противник умер
  if (defender.currentHealth <= 0) {
    console.log(`${defender.name ?? "Противник"} повержен!`);

    // подбираем награду
    const loot = Math.floor(Math.random() * 10) + 1; // лут от 1 до 10 монет

    if (loot > 0) {
      attacker.gold = (attacker.gold ?? 0) + loot;
      console.log(`💰 ${attacker.name} получил ${loot} золота!`);
    }
  }
}
// использование в другом файле:

// import { createCharacter } from "./character.js";
// import { createEnemy } from "./enemy.js";
// import { attack } from "./combat.js";

// const hero = createCharacter({
//   name: "Герой",
//   strength: 5,
//   dexterity: 6,
// });

// const enemy = createEnemy({
//   name: "Зомби",
//   strength: 3,
//   dexterity: 2,
// });

// attack(hero, enemy);  // Герой атакует Зомби
// attack(enemy, hero);  // Зомби атакует Героя
