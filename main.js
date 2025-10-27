// main.js
import blessed from "blessed";

const screen = blessed.screen({
    smartCSR: true,
    title: "Rogue JS"
});

const box = blessed.box({
    top: "center",
    left: "center",
    width: "50%",
    height: "50%",
    content: "Welcome to Rogue!",
    border: { type: "line" },
    style: { border: { fg: "green" } }
});

screen.append(box);
screen.render();

screen.key(["escape", "q", "C-c"], () => process.exit(0));
