import blessed from "blessed";
import Game from "./src/core/game.js";

const screen = blessed.screen({
  smartCSR: true,
  title: "Rogue JS",
});

const game = new Game(screen);
game.start();