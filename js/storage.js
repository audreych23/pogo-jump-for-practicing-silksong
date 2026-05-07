export class StorageManager {
  loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch { return fallback; }
  }

  saveJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  get playerName() {
    return localStorage.getItem('pogoPlayerName') || 'Player';
  }

  set playerName(name) {
    localStorage.setItem('pogoPlayerName', name);
  }

  get highScore() {
    return parseInt(localStorage.getItem('pogoHighScore') || '0');
  }

  set highScore(val) {
    localStorage.setItem('pogoHighScore', val.toString());
  }

  get coins() {
    return parseInt(localStorage.getItem('pogoCoins') || '100');
  }

  set coins(val) {
    localStorage.setItem('pogoCoins', val.toString());
  }

  get leaderboard() {
    return this.loadJSON('pogoLeaderboard', []);
  }

  addScore(name, score) {
    const board = this.leaderboard;
    board.push({ name, score, date: Date.now() });
    board.sort((a, b) => b.score - a.score);
    if (board.length > 50) board.length = 50;
    this.saveJSON('pogoLeaderboard', board);
  }

  get inventory() {
    return this.loadJSON('pogoInventory', []);
  }

  addItem(itemId) {
    const inv = this.inventory;
    inv.push(itemId);
    this.saveJSON('pogoInventory', inv);
  }

  get equipped() {
    return this.loadJSON('pogoEquipped', { sword: null, cape: null, skin: null });
  }

  set equipped(val) {
    this.saveJSON('pogoEquipped', val);
  }
}
