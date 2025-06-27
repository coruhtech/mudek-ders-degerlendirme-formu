const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');

// Optional electron-updater import (production modunda kullanılır)
let autoUpdater = null;
try {
    autoUpdater = require('electron-updater').autoUpdater;
} catch (error) {
    console.log('electron-updater modülü bulunamadı (geliştirici modunda normal)');
}
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// Ana pencere referansı
let mainWindow;

/**
 * Ana pencereyi oluşturur
 */
function createWindow() {
    // Ana pencereyi oluştur
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        icon: path.join(__dirname, 'app/v2/assets/img/rteu-logo.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'electron-preload.js'),
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false
        },
        titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
        show: false, // Pencereyi başlangıçta gizle, hazır olduğunda göster
        backgroundColor: '#f8fafb', // RTEÜ tema rengi
        title: 'MUDEK Ders Değerlendirme Sistemi v2.0'
    });

    // HTML dosyasını yükle
    const htmlPath = path.join(__dirname, 'app/v2/index.html');
    mainWindow.loadFile(htmlPath);

    // Pencere hazır olduğunda göster
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Development modunda DevTools'u aç
        if (isDev) {
            mainWindow.webContents.openDevTools();
        }
        
        console.log('MUDEK Ders Değerlendirme Sistemi başlatıldı');
    });

    // Pencere kapatıldığında
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Dış bağlantıları varsayılan tarayıcıda aç
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Navigasyon güvenliği
    mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        // Sadece local dosyalara navigasyona izin ver
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
            shell.openExternal(navigationUrl);
        }
    });

    // Uygulama menüsünü oluştur
    createMenu();
}

/**
 * Uygulama menüsünü oluşturur
 */
function createMenu() {
    const template = [
        {
            label: 'Dosya',
            submenu: [
                {
                    label: 'Ders Tanımı Yükle',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        openFile();
                    }
                },
                {
                    label: 'Ders Tanımı Kaydet',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        saveFile();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Öğrenci Listesi Yükle',
                    accelerator: 'CmdOrCtrl+Shift+O',
                    click: () => {
                        loadStudents();
                    }
                },
                {
                    label: 'Notları Dışa Aktar',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        exportGrades();
                    }
                },
                { type: 'separator' },
                {
                    label: process.platform === 'darwin' ? 'Çıkış' : 'Çıkış',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Düzenle',
            submenu: [
                {
                    label: 'Geri Al',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Yinele',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                { type: 'separator' },
                {
                    label: 'Kes',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Kopyala',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Yapıştır',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Tümünü Seç',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall'
                }
            ]
        },
        {
            label: 'Görünüm',
            submenu: [
                {
                    label: 'Yeniden Yükle',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: 'Geliştirici Araçları',
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Tam Ekran',
                    accelerator: process.platform === 'darwin' ? 'Ctrl+Cmd+F' : 'F11',
                    click: () => {
                        mainWindow.setFullScreen(!mainWindow.isFullScreen());
                    }
                },
                {
                    label: 'Yakınlaştır',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomFactor();
                        mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
                    }
                },
                {
                    label: 'Uzaklaştır',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomFactor();
                        mainWindow.webContents.setZoomFactor(Math.max(currentZoom - 0.1, 0.5));
                    }
                },
                {
                    label: 'Gerçek Boyut',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        mainWindow.webContents.setZoomFactor(1.0);
                    }
                }
            ]
        },
        {
            label: 'Yardım',
            submenu: [
                {
                    label: 'Web Sitesi',
                    click: () => {
                        shell.openExternal('https://coruhtech.github.io/mudek-ders-degerlendirme-formu/app/v2/');
                    }
                },
                {
                    label: 'GitHub Repository',
                    click: () => {
                        shell.openExternal('https://github.com/coruhtech/mudek-ders-degerlendirme-formu');
                    }
                },
                {
                    label: 'CORUH R&D',
                    click: () => {
                        shell.openExternal('https://www.coruh.com.tr');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Güncelleme Kontrol Et',
                    click: () => {
                        checkForUpdates();
                    }
                },
                {
                    label: 'Hakkında',
                    click: () => {
                        showAbout();
                    }
                }
            ]
        }
    ];

    // macOS için özel menü düzenlemeleri
    if (process.platform === 'darwin') {
        template.unshift({
            label: app.getName(),
            submenu: [
                {
                    label: 'Hakkında ' + app.getName(),
                    click: () => showAbout()
                },
                { type: 'separator' },
                {
                    label: 'Servisleri',
                    role: 'services',
                    submenu: []
                },
                { type: 'separator' },
                {
                    label: app.getName() + ' Gizle',
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: 'Diğerlerini Gizle',
                    accelerator: 'Command+Shift+H',
                    role: 'hideothers'
                },
                {
                    label: 'Tümünü Göster',
                    role: 'unhide'
                },
                { type: 'separator' },
                {
                    label: 'Çıkış',
                    accelerator: 'Command+Q',
                    click: () => app.quit()
                }
            ]
        });
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

/**
 * Dosya açma dialogu
 */
async function openFile() {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Ders Tanımı JSON Dosyası Seç',
        filters: [
            { name: 'JSON Dosyaları', extensions: ['json'] },
            { name: 'Tüm Dosyalar', extensions: ['*'] }
        ],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            mainWindow.webContents.send('load-json-file', { content, filename: path.basename(filePath) });
        } catch (error) {
            dialog.showErrorBox('Hata', 'Dosya okunamadı: ' + error.message);
        }
    }
}

/**
 * Dosya kaydetme dialogu
 */
async function saveFile() {
    mainWindow.webContents.send('save-json-request');
}

/**
 * Öğrenci listesi yükleme
 */
async function loadStudents() {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Öğrenci Listesi JSON Dosyası Seç',
        filters: [
            { name: 'JSON Dosyaları', extensions: ['json'] },
            { name: 'Tüm Dosyalar', extensions: ['*'] }
        ],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            mainWindow.webContents.send('load-students-file', { content, filename: path.basename(filePath) });
        } catch (error) {
            dialog.showErrorBox('Hata', 'Dosya okunamadı: ' + error.message);
        }
    }
}

/**
 * Notları dışa aktarma
 */
function exportGrades() {
    mainWindow.webContents.send('export-grades-request');
}

/**
 * Güncelleme kontrolü
 */
function checkForUpdates() {
    if (isDev || !autoUpdater) {
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Güncelleme',
            message: 'Development modunda veya güncelleme modülü olmadan güncelleme kontrol edilemez.',
            buttons: ['Tamam']
        });
        return;
    }
    
    autoUpdater.checkForUpdatesAndNotify();
}

/**
 * Hakkında dialogu
 */
function showAbout() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Hakkında',
        message: 'MUDEK Ders Değerlendirme Sistemi',
        detail: `Sürüm: 2.0.0
Platform: ${process.platform}
Electron: ${process.versions.electron}
Node.js: ${process.versions.node}

Geliştirici: Dr. Öğr. Üyesi Uğur CORUH
Firma: CORUH ARGE VE TEKNOLOJİ SANAYİ TİCARET LİMİTED ŞİRKETİ
Web: www.coruh.com.tr
Adres: Fener Mah. Atatürk Cad. No:28/2 İç Kapı No:3 Merkez/Rize

© 2024 CORUH R&D and TECHNOLOGY. Tüm hakları saklıdır.`,
        buttons: ['Tamam'],
        icon: path.join(__dirname, 'app/v2/assets/img/rteu-logo.png')
    });
}

// IPC Event Handlers
ipcMain.handle('save-json-dialog', async (event, data) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Ders Tanımını Kaydet',
        defaultPath: data.filename || 'ders-tanimi.json',
        filters: [
            { name: 'JSON Dosyaları', extensions: ['json'] },
            { name: 'Tüm Dosyalar', extensions: ['*'] }
        ]
    });

    if (!result.canceled) {
        try {
            fs.writeFileSync(result.filePath, data.content, 'utf8');
            return { success: true, filePath: result.filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    return { success: false, cancelled: true };
});

ipcMain.handle('save-grades-dialog', async (event, data) => {
    const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Notları Kaydet',
        defaultPath: data.filename || 'notlar.json',
        filters: [
            { name: 'JSON Dosyaları', extensions: ['json'] },
            { name: 'Excel Dosyaları', extensions: ['xlsx'] },
            { name: 'Tüm Dosyalar', extensions: ['*'] }
        ]
    });

    if (!result.canceled) {
        try {
            fs.writeFileSync(result.filePath, data.content, 'utf8');
            return { success: true, filePath: result.filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    return { success: false, cancelled: true };
});

// App Event Handlers
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Auto Updater ayarları (sadece production modunda ve modül mevcutsa)
    if (!isDev && autoUpdater) {
        autoUpdater.checkForUpdatesAndNotify();
        
        autoUpdater.on('update-available', () => {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Güncelleme Mevcut',
                message: 'Yeni bir sürüm mevcut. İndiriliyor...',
                buttons: ['Tamam']
            });
        });

        autoUpdater.on('update-downloaded', () => {
            dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Güncelleme Hazır',
                message: 'Güncelleme indirildi. Uygulama yeniden başlatılacak.',
                buttons: ['Şimdi Yeniden Başlat', 'Sonra']
            }).then((result) => {
                if (result.response === 0) {
                    autoUpdater.quitAndInstall();
                }
            });
        });
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Güvenlik ayarları
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
        shell.openExternal(navigationUrl);
    });
}); 