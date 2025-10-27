export function createItem(option) {
    return option

}

/* 
const option = [
    {
        id:1,
        type: "Food",            // тип предмета: еда
        subtype: "Apple",        // подтип предмета
        health: 5,               // восстанавливает 5 единиц здоровья
        maxHealth: 0,            // не влияет на максимальное здоровье
        strength: 0,             // не увеличивает силу
        dexterity: 0,            // не увеличивает ловкость
        value: 0                 // стоимость предмета (для сокровищ)
    },

    {
        id: 2,
        type: "Weapon",          // оружие
        subtype: "Sword",
        health: 0,
        maxHealth: 0,
        strength: 3,             // добавляет 3 к силе при атаке
        dexterity: 0,
        value: 10                // стоимость предмета
    },

    {
        id: 3,
        type: "Treasure",        // сокровище
        subtype: "Gold",
        health: 0,
        maxHealth: 0,
        strength: 0,
        dexterity: 0,
        value: 20                // количество очков / стоимость
    }
]

createItem(option) */