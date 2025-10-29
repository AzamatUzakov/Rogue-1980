import './level.js';
import './room.js';
//import './corridor.js'
import { gameSession } from './gameSession.js';




//console.log(gameSession.levels.rooms);



gameSession.levels.forEach(element => {
    element.rooms.forEach(room => {
        console.log(room.id < room.id + 1 ? true : false);
    })
}); 
