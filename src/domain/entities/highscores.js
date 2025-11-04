// highscores.js
// Определяем кроссплатформенное хранилище: localStorage в браузере или JSON-файл в Node
let nodeFs = null;
let nodePath = null;
let storageFilePath = null;

const hasLocalStorage = typeof localStorage !== 'undefined';

if (!hasLocalStorage) {
    // Ленивая загрузка модулей Node для ESM
    const fs = await import('node:fs');
    const path = await import('node:path');
    nodeFs = fs;
    nodePath = path;
    storageFilePath = nodePath.resolve(process.cwd(), 'highscores.json');
}

// loadFromStorage: читает массив рекордов из источника (браузер/файл)
function loadFromStorage() {
    if (hasLocalStorage) {
        try {
            return JSON.parse(localStorage.getItem('rogueHighScores')) || [];
        } catch {
            return [];
        }
    }
    try {
        if (nodeFs.default.existsSync(storageFilePath)) {
            const raw = nodeFs.default.readFileSync(storageFilePath, 'utf-8');
            return JSON.parse(raw || '[]');
        }
    } catch {}
    return [];
}

// saveToStorage: сохраняет массив рекордов в источник (браузер/файл)
function saveToStorage(scores) {
    if (hasLocalStorage) {
        localStorage.setItem('rogueHighScores', JSON.stringify(scores));
        return;
    }
    try {
        nodeFs.default.writeFileSync(storageFilePath, JSON.stringify(scores, null, 2), 'utf-8');
    } catch {}
}

export function createHighScores() {
    const highScores = {
        // scores: оперативное состояние, загруженное из хранилища
        scores: loadFromStorage(),

        // addScore: добавляет запись, сортирует и персистит
        addScore(playerName, level, gold) {
            this.scores.push({
                playerName,
                level,
                gold,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now()
            });

            this.scores.sort((a, b) => b.gold - a.gold);
            this.scores = this.scores.slice(0, 10);
            saveToStorage(this.scores);
            console.log(`🏆 Добавлен рекорд: ${playerName} - Уровень ${level}, Золото: ${gold}`);
        },

        // getScores: возвращает текущий топ
        getScores() {
            return this.scores;
        },

        // clear: очищает таблицу рекордов и персистит
        clear() {
            this.scores = [];
            if (hasLocalStorage) {
                localStorage.removeItem('rogueHighScores');
            } else {
                saveToStorage(this.scores);
            }
            console.log("🗑️ Таблица рекордов очищена");
        },

        // show: печатает таблицу в консоль
        show() {
            console.log("🏆 ТАБЛИЦА РЕКОРДОВ:");
            this.scores.forEach((score, index) => {
                console.log(`${index + 1}. ${score.playerName} - Ур.${score.level} - ${score.gold} золота (${score.date})`);
            });
        }
    };

    return highScores;
}

export const highScores = createHighScores();