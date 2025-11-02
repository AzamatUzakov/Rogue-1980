import { createCharacter } from "../entities/character.js";
import { createEnemy } from "../entities/enemy.js";
import { attack } from "./combat.js";

export function turnSystem() {
    // создаём героя и врага один раз — они живут между ходами
    const hero = createCharacter({
        name: "Герой",
        strength: 5,
        dexterity: 6,
        currentHealth: 20,
    });

    const enemy = createEnemy({
        name: "Зомби",
        strength: 3,
        dexterity: 2,
        currentHealth: 12,
    });

    let turn = 1;

    console.log("Бой начинается!");
    console.log(`${hero.name} против ${enemy.name}\n`);

    // игровой цикл
    while (hero.currentHealth > 0 && enemy.currentHealth > 0) {
        console.log(`Ход ${turn}:`);

        // игрок атакует
        attack(hero, enemy);

        // проверяем — жив ли враг после удара
        if (enemy.currentHealth <= 0) {
            console.log(`${enemy.name} побеждён!`);
            break;
        }

        //  враг отвечает
        attack(enemy, hero);

        // проверяем — жив ли игрок
        if (hero.currentHealth <= 0) {
            console.log(`${hero.name} пал в бою...`);
            break;
        }

        turn++;
        console.log("------------------");
        console.log(turn);

    }

    console.log("Бой завершён!");
}

turnSystem();
