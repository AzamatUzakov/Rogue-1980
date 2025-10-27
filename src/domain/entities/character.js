
export function createCharacter(option) {
    console.log(option);
}

//параметры персонажа
const option = {
    maxHealth: 20,
    currentHealth: 20,
    strength: 5,
    dexterity: 4,
    weapon: null,        // пока оружия нет
    backpack: null       // позже сюда будет объект рюкзака
}
createCharacter(option)
