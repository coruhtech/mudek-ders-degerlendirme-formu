const { contextBridge, ipcRenderer } = require('electron');

/**
 * Electron Preload Script
 * Güvenli API köprüsü oluşturur
 */

// API köprüsünü oluştur
contextBridge.exposeInMainWorld('electronAPI', {
    // Platform bilgisi
    platform: process.platform,
    
    // Dosya işlemleri
    saveJsonDialog: (data) => ipcRenderer.invoke('save-json-dialog', data),
    saveGradesDialog: (data) => ipcRenderer.invoke('save-grades-dialog', data),
    
    // Event listeners
    onLoadJsonFile: (callback) => ipcRenderer.on('load-json-file', callback),
    onSaveJsonRequest: (callback) => ipcRenderer.on('save-json-request', callback),
    onLoadStudentsFile: (callback) => ipcRenderer.on('load-students-file', callback),
    onExportGradesRequest: (callback) => ipcRenderer.on('export-grades-request', callback),
    
    // Event listener temizleme
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Toast mesajları için global fonksiyon ekle
contextBridge.exposeInMainWorld('showToast', (message, type = 'info', duration = 3000) => {
    // Web uygulamasındaki toast sistemini kullan
    if (window.showToast) {
        window.showToast(message, type, duration);
    } else {
        // Fallback - console.log
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
});

// Electron ortamı flag'i
contextBridge.exposeInMainWorld('isElectron', true);

// Sürüm bilgileri
contextBridge.exposeInMainWorld('versions', {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
    app: '2.0.0'
});

console.log('Electron Preload Script yüklendi'); 