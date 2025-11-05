export function attack(attacker, defender) {
  const hitChance = Math.min(
    0.9,
    Math.max(0.1, 0.5 + (attacker.dexterity - defender.dexterity) * 0.05)
  );

  if (defender.type === 'Vampire' && defender._firstHitIgnored !== true) {
    defender._firstHitIgnored = true;
    console.log(`${attacker.name ?? "Атакующий"} промахнулся (первый удар по вампиру)!`);
    return;
  }
  if (Math.random() > hitChance) {
    console.log(`${attacker.name ?? "Персонаж"} промахнулся!`);
    return;
  }

  const baseDamage = attacker.strength;
  const weaponBonus = attacker.weapon?.damage ?? 0;
  const totalDamage = baseDamage + weaponBonus;

  defender.takeDamage(totalDamage);
  console.log(
    `${attacker.name ?? "Атакующий"} попал по ${defender.name ?? "цели"
    } на ${totalDamage} урона!`
  );

  if (defender.currentHealth <= 0) {
    console.log(`${defender.name ?? "Противник"} повержен!`);
    const hostility = defender.agroRange ?? 1;
    const statScore = (defender.strength ?? 0) + (defender.dexterity ?? 0) + Math.floor((defender.maxHealth ?? 0) / 10);
    const base = 1 + Math.floor(Math.random() * 5);
    const loot = Math.max(1, base + Math.floor(statScore / 5) + Math.floor(hostility / 2));

    if (loot > 0) {
      attacker.gold = (attacker.gold ?? 0) + loot;
      console.log(`💰 ${attacker.name} получил ${loot} золота!`);
    }
  }
}
