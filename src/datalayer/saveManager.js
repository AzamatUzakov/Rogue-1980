// saveManager.js — сохранение/загрузка прогресса в JSON
let fs = null;
let path = null;
let baseDir = null;

async function ensureNode() {
    if (!fs || !path) {
        fs = await import('node:fs');
        path = await import('node:path');
        baseDir = path.resolve(process.cwd(), 'saves');
        if (!fs.default.existsSync(baseDir)) fs.default.mkdirSync(baseDir, { recursive: true });
    }
}

// saveState: сохраняет произвольный объект состояния в файл
export async function saveState(state) {
    await ensureNode();
    const file = path.resolve(baseDir, 'savegame.json');
    fs.default.writeFileSync(file, JSON.stringify(state, null, 2), 'utf-8');
}

// loadState: загружает сохранение последней сессии
export async function loadState() {
    await ensureNode();
    const file = path.resolve(baseDir, 'savegame.json');
    if (!fs.default.existsSync(file)) return null;
    try {
        const raw = fs.default.readFileSync(file, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

// makeSerializableSession: формирует сериализуемый снимок состояния
export function makeSerializableSession(gameSession) {
    return {
        player: {
            name: gameSession.player.name,
            level: gameSession.player.level,
            maxHealth: gameSession.player.maxHealth,
            currentHealth: gameSession.player.currentHealth,
            strength: gameSession.player.strength,
            dexterity: gameSession.player.dexterity,
            weapon: gameSession.player.weapon,
            currentRoomId: gameSession.player.currentRoomId,
            position: gameSession.player.position,
            backpack: gameSession.player.backpack.items ?? gameSession.player.backpack,
            gold: gameSession.player.gold,
        },
        levels: gameSession.levels,
        timestamp: Date.now()
    };
}

// applyStateToSession: восстанавливает состояние в текущую сессию
export function applyStateToSession(gameSession, snapshot) {
    if (!snapshot) return false;
    try {
        gameSession.levels = snapshot.levels;
        Object.assign(gameSession.player, snapshot.player);
        return true;
    } catch {
        return false;
    }
}


