export function createCorridor(option) {
    console.log(option);
}

const option = {
    id: 1,
    from: 1,
    to: 2,
    path: [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }], // координаты по которым можно пройти
    locked: false
}


createCorridor(option)