import { turnSystem } from "../domain/gameplay/turnSystem.js";
import { gameSession } from "../domain/entities/gameSession.js";

export function bindControls(screen, redraw) {
    const move = (dx, dy) => {
        if (turnSystem.playerAction('moveInRoom', { dx, dy })) redraw();
    };

    screen.key(['w', 'W', 'up'], () => move(0, -1));
    screen.key(['s', 'S', 'down'], () => move(0, 1));
    screen.key(['a', 'A', 'left'], () => move(-1, 0));
    screen.key(['d', 'D', 'right'], () => move(1, 0));

    function chooseAndUse(filterFn) {
        const items = (gameSession.player.backpack.items ?? gameSession.player.backpack).filter(filterFn);
        if (!items.length) return;
        console.log("Выберите предмет (1–9), 0 — снять оружие");
        let handler;
        handler = (ch, key) => {
            const name = key.name;
            if (name === 'escape') { screen.removeListener('keypress', handler); return; }
            if (name === '0') {
                gameSession.player.equipWeapon(null);
                screen.removeListener('keypress', handler);
                redraw();
                return;
            }
            const idx = parseInt(name, 10);
            if (!isNaN(idx) && idx >= 1 && idx <= Math.min(9, items.length)) {
                const item = items[idx - 1];
                gameSession.player.useItem(item.id);
                screen.removeListener('keypress', handler);
                redraw();
            }
        };
        screen.on('keypress', handler);
    }

    screen.key(['h', 'H'], () => chooseAndUse(it => it.type === 'Weapon'));
    screen.key(['j', 'J'], () => chooseAndUse(it => it.type === 'Food'));
    screen.key(['k', 'K'], () => chooseAndUse(it => it.type === 'Elixir'));
    screen.key(['e', 'E'], () => chooseAndUse(it => it.type === 'Scroll'));

    screen.key(['q', 'Q'], () => process.exit(0));
}


