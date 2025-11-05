function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function manhattan(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function lineBresenham(x0, y0, x1, y1) {
    const points = [];
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    let x = x0;
    let y = y0;
    while (true) {
        points.push({ x, y });
        if (x === x1 && y === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x += sx; }
        if (e2 <= dx) { err += dx; y += sy; }
    }
    return points;
}

function rectCenter(room) {
    return {
        x: room.position.x + Math.floor(room.size.width / 2),
        y: room.position.y + Math.floor(room.size.height / 2)
    };
}

function buildCorridorPath(a, b) {
    const firstHorizontal = Math.random() < 0.5;
    const mid = firstHorizontal ? { x: b.x, y: a.y } : { x: a.x, y: b.y };
    const seg1 = lineBresenham(a.x, a.y, mid.x, mid.y);
    const seg2 = lineBresenham(mid.x, mid.y, b.x, b.y);
    return seg1.concat(seg2.slice(1));
}

function minimumSpanningTree(nodes) {
    const n = nodes.length;
    if (n === 0) return [];
    const inTree = new Array(n).fill(false);
    inTree[0] = true;
    const edges = [];
    for (let k = 0; k < n - 1; k++) {
        let best = null;
        for (let i = 0; i < n; i++) if (inTree[i]) {
            for (let j = 0; j < n; j++) if (!inTree[j]) {
                const w = manhattan(nodes[i], nodes[j]);
                if (!best || w < best.w) best = { i, j, w };
            }
        }
        if (!best) break;
        inTree[best.j] = true;
        edges.push({ fromIndex: best.i, toIndex: best.j });
    }
    return edges;
}

export function generateConnectedLevel(levelIndex, options = {}) {
    const width = options.width ?? 60;
    const height = options.height ?? 45;
    const sectionsX = 3;
    const sectionsY = 3;
    const sectionW = Math.floor(width / sectionsX);
    const sectionH = Math.floor(height / sectionsY);

    const level = {
        id: levelIndex,
        width,
        height,
        rooms: [],
        corridors: [],
        startRoomId: 0,
        exitRoomId: 8
    };

    for (let sy = 0; sy < sectionsY; sy++) {
        for (let sx = 0; sx < sectionsX; sx++) {
            const id = sy * sectionsX + sx;
            const maxW = Math.max(6, sectionW - 4);
            const maxH = Math.max(5, sectionH - 4);
            const w = randInt(Math.max(5, Math.floor(maxW * 0.6)), maxW);
            const h = randInt(Math.max(4, Math.floor(maxH * 0.6)), maxH);
            const offsetX = sx * sectionW;
            const offsetY = sy * sectionH;
            const x = offsetX + randInt(1, Math.max(1, sectionW - w - 1));
            const y = offsetY + randInt(1, Math.max(1, sectionH - h - 1));
            level.rooms.push({
                id,
                position: { x, y },
                size: { width: w, height: h },
                enemies: [],
                items: [],
                isStart: false,
                isExit: false
            });
        }
    }

    const centers = level.rooms.map(rectCenter);
    const mst = minimumSpanningTree(centers);
    mst.forEach(({ fromIndex, toIndex }) => {
        const a = centers[fromIndex];
        const b = centers[toIndex];
        const path = buildCorridorPath(a, b);
        level.corridors.push({
            id: `${fromIndex}-${toIndex}`,
            from: fromIndex,
            to: toIndex,
            path,
            locked: false
        });
    });

    const extra = randInt(2, 4);
    for (let e = 0; e < extra; e++) {
        const i = randInt(0, centers.length - 1);
        let j = randInt(0, centers.length - 1);
        if (j === i) j = (j + 1) % centers.length;
        const exists = level.corridors.some(c =>
            (c.from === i && c.to === j) || (c.from === j && c.to === i)
        );
        if (!exists) {
            const path = buildCorridorPath(centers[i], centers[j]);
            level.corridors.push({ id: `${i}-${j}`, from: i, to: j, path, locked: false });
        }
    }

    let bestA = 0, bestB = 0, bestD = -1;
    for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
            const d = manhattan(centers[i], centers[j]);
            if (d > bestD) { bestD = d; bestA = i; bestB = j; }
        }
    }
    level.startRoomId = bestA;
    level.exitRoomId = bestB;
    level.rooms.forEach(r => {
        r.isStart = r.id === level.startRoomId;
        r.isExit = r.id === level.exitRoomId;
    });

    return level;
}


