// statsManager.js — сбор/хранение статистики прохождений
let fs = null;
let path = null;
let statsFile = null;

async function ensureNode() {
    if (!fs || !path) {
        fs = await import('node:fs');
        path = await import('node:path');
        const baseDir = path.resolve(process.cwd(), 'saves');
        if (!fs.default.existsSync(baseDir)) fs.default.mkdirSync(baseDir, { recursive: true });
        statsFile = path.resolve(baseDir, 'runs.json');
    }
}

export async function appendRunStat(run) {
    await ensureNode();
    const arr = await loadAllRuns();
    arr.push({ ...run, timestamp: Date.now() });
    fs.default.writeFileSync(statsFile, JSON.stringify(arr, null, 2), 'utf-8');
}

export async function loadAllRuns() {
    await ensureNode();
    if (!fs.default.existsSync(statsFile)) return [];
    try {
        const raw = fs.default.readFileSync(statsFile, 'utf-8');
        return JSON.parse(raw || '[]');
    } catch {
        return [];
    }
}

export async function topByTreasures(limit = 10) {
    const runs = await loadAllRuns();
    return runs.sort((a, b) => (b.treasures ?? 0) - (a.treasures ?? 0)).slice(0, limit);
}


