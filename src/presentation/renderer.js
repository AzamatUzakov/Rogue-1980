import blessed from "blessed";
import { gameSession } from "../domain/entities/gameSession.js";

// createRenderer: создаёт терминальный UI и функции отрисовки
export function createRenderer(screen) {
    const layout = {};

    // Основные панели
    layout.map = blessed.box({
        top: 0,
        left: 0,
        width: "70%",
        height: "100%",
        tags: false,
        style: { fg: "white", bg: "black" },
        content: ""
    });

    layout.sidebar = blessed.box({
        top: 0,
        left: "70%",
        width: "30%",
        height: "100%",
        style: { fg: "white", bg: "black" },
    });

    layout.status = blessed.box({
        parent: layout.sidebar,
        top: 0,
        left: 0,
        width: "100%",
        height: "40%",
        label: " Статус ",
        border: { type: "line" },
        tags: true,
    });

    layout.inventory = blessed.box({
        parent: layout.sidebar,
        top: "40%",
        left: 0,
        width: "100%",
        height: "60%",
        label: " Инвентарь (h/j/k/e) ",
        border: { type: "line" },
        tags: true,
        scrollable: true,
        keys: true,
        vi: true,
        alwaysScroll: true,
    });

    screen.append(layout.map);
    screen.append(layout.sidebar);

    const seen = new Set(); // туман войны: посещённые тайлы как "x,y"

    // --- утилиты координат ---
    function tileKey(x, y) { return `${x},${y}`; }

    function getGlobalPlayerPos() {
        const lvl = gameSession.levels[gameSession.player.level - 1];
        const room = lvl.rooms.find(r => r.id === gameSession.player.currentRoomId);
        return {
            x: room.position.x + gameSession.player.position.x,
            y: room.position.y + gameSession.player.position.y
        };
    }

    function isRoomFloor(level, x, y) {
        return level.rooms.some(r => x >= r.position.x && x < r.position.x + r.size.width && y >= r.position.y && y < r.position.y + r.size.height);
    }

    function isRoomWall(level, x, y) {
        for (const r of level.rooms) {
            const left = r.position.x, right = r.position.x + r.size.width - 1;
            const top = r.position.y, bottom = r.position.y + r.size.height - 1;
            if (x >= left && x <= right && y >= top && y <= bottom) {
                return x === left || x === right || y === top || y === bottom;
            }
        }
        return false;
    }

    function isCorridor(level, x, y) {
        return level.corridors.some(c => c.path && c.path.some(p => p.x === x && p.y === y));
    }

    function computeVisible(level, radius = 12) {
        const cur = getGlobalPlayerPos();
        const visible = new Set();
        // простое лучевое сканирование по окружности
        for (let a = 0; a < 360; a += 2) {
            const rad = a * Math.PI / 180;
            let x = cur.x, y = cur.y;
            for (let s = 0; s < radius; s++) {
                x = Math.round(cur.x + Math.cos(rad) * s);
                y = Math.round(cur.y + Math.sin(rad) * s);
                visible.add(tileKey(x, y));
                if (isRoomWall(level, x, y)) break; // стена блокирует обзор
            }
        }
        // всегда видна текущая комната полностью
        const room = level.rooms.find(r => r.id === gameSession.player.currentRoomId);
        for (let y = room.position.y; y < room.position.y + room.size.height; y++) {
            for (let x = room.position.x; x < room.position.x + room.size.width; x++) {
                visible.add(tileKey(x, y));
            }
        }
        // отмечаем просмотренные
        visible.forEach(k => seen.add(k));
        return visible;
    }

    function draw() {
        const level = gameSession.levels[gameSession.player.level - 1];
        if (!level) return;
        const visible = computeVisible(level);
        const width = level.width ?? 60;
        const height = level.height ?? 45;
        const lines = [];
        for (let y = 0; y < height; y++) {
            let row = "";
            for (let x = 0; x < width; x++) {
                const key = tileKey(x, y);
                const seenBefore = seen.has(key);
                const nowVisible = visible.has(key);
                if (!seenBefore) { row += " "; continue; }
                // показ только стен в просмотренных зонах вне текущей видимости
                if (!nowVisible) {
                    row += isRoomWall(level, x, y) ? "#" : " ";
                    continue;
                }
                // в зоне видимости: стены/коридоры/пол
                if (isRoomWall(level, x, y)) row += "#";
                else if (isRoomFloor(level, x, y) || isCorridor(level, x, y)) row += ".";
                else row += " ";
            }
            lines.push(row);
        }

        // акторы и предметы поверх
        const cur = getGlobalPlayerPos();
        const mapChars = lines.map(l => l.split(""));
        // предметы/враги в видимых клетках
        for (const room of level.rooms) {
            for (const e of room.enemies) {
                const gx = room.position.x + (e.position?.x ?? 0);
                const gy = room.position.y + (e.position?.y ?? 0);
                if (visible.has(tileKey(gx, gy))) mapChars[gy][gx] = "E";
            }
            for (const it of room.items) {
                const gx = room.position.x + (it.position?.x ?? 0);
                const gy = room.position.y + (it.position?.y ?? 0);
                if (visible.has(tileKey(gx, gy))) mapChars[gy][gx] = "*";
            }
        }
        // игрок
        mapChars[cur.y][cur.x] = "@";

        layout.map.setContent(mapChars.map(a => a.join("")).join("\n"));

        // статус
        const p = gameSession.player;
        layout.status.setContent(
            `Имя: ${p.name}\n` +
            `Уровень: ${p.level}\n` +
            `HP: ${p.currentHealth}/${p.maxHealth}\n` +
            `Сокровища: ${p.gold}\n` +
            `Комната: ${p.currentRoomId}`
        );

        // инвентарь, сортировка по ценности сокровищ (value) сверху
        const items = p.backpack.items ?? p.backpack; // поддержка двух форматов
        const sorted = [...items].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
        const linesInv = sorted.map((it, idx) => `${idx + 1}. ${it.type}:${it.subtype ?? ""}`);
        layout.inventory.setContent(linesInv.join("\n"));

        screen.render();
    }

    return { layout, draw };
}


