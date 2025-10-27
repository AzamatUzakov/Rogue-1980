import Gameplay from "../domain/gameplay/gameplay.js";

export default class Game {
  constructor(screen) {
    this.screen = screen;
    this.gameplay = new Gameplay(screen);
  }

  start() {
    this.gameplay.init();
  }
}