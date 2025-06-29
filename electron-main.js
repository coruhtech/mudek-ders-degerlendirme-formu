const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const path = require('path');

// Auto-updater kaldırıldı, sadece basit desktop app
const fs = require('fs');
const os = require('os');
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
                    label: 'Ders Tanimi Yukle',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        openFile();
                    }
                },
                {
                    label: 'Ders Tanimi Kaydet',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        saveFile();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Ogrenci Listesi Yukle',
                    accelerator: 'CmdOrCtrl+Shift+O',
                    click: () => {
                        loadStudents();
                    }
                },
                {
                    label: 'Notlari Disa Aktar',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        exportGrades();
                    }
                },
                { type: 'separator' },
                {
                    label: 'Yedek Klasorunu Ac',
                    accelerator: 'CmdOrCtrl+B',
                    click: () => {
                        openBackupFolder();
                    }
                },
                {
                    label: 'Yedek Dosyadan Yukle',
                    accelerator: 'CmdOrCtrl+Shift+B',
                    click: () => {
                        loadFromBackup();
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
            label: 'Duzenle',
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
                    label: 'Yapistir',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Tumunu Sec',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall'
                }
            ]
        },
        {
            label: 'Gorunum',
            submenu: [
                {
                    label: 'Yeniden Yukle',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: 'Gelistirici Araclari',
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
                    label: 'Yakinlastir',
                    accelerator: 'CmdOrCtrl+Plus',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomFactor();
                        mainWindow.webContents.setZoomFactor(currentZoom + 0.1);
                    }
                },
                {
                    label: 'Uzaklastir',
                    accelerator: 'CmdOrCtrl+-',
                    click: () => {
                        const currentZoom = mainWindow.webContents.getZoomFactor();
                        mainWindow.webContents.setZoomFactor(Math.max(currentZoom - 0.1, 0.5));
                    }
                },
                {
                    label: 'Gercek Boyut',
                    accelerator: 'CmdOrCtrl+0',
                    click: () => {
                        mainWindow.webContents.setZoomFactor(1.0);
                    }
                }
            ]
        },
        {
            label: 'Yardim',
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
                    label: 'Guncelleme Kontrol Et',
                    click: () => {
                        checkForUpdates();
                    }
                },
                {
                    label: 'Hakkinda',
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
 * Yedek klasörünü aç
 */
async function openBackupFolder() {
    try {
        const documentsPath = app.getPath('documents');
        const backupDir = path.join(documentsPath, 'MUDEK Backups');
        
        // Klasörün var olduğundan emin ol
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            console.log('📁 MUDEK Backups klasörü oluşturuldu:', backupDir);
        }
        
        // Klasörü aç
        await shell.openPath(backupDir);
        console.log('📂 Yedek klasörü açıldı:', backupDir);
        
    } catch (error) {
        console.error('❌ Yedek klasörü açma hatası:', error);
        dialog.showErrorBox('Hata', 'Yedek klasörü açılamadı: ' + error.message);
    }
}

/**
 * Yedek dosyadan yükle
 */
async function loadFromBackup() {
    try {
        const documentsPath = app.getPath('documents');
        const backupDir = path.join(documentsPath, 'MUDEK Backups');
        
        const result = await dialog.showOpenDialog(mainWindow, {
            title: 'Yedek Dosyadan Yükle',
            defaultPath: backupDir,
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
                
                // MUDEK yedek dosyası mı kontrol et
                let jsonData;
                try {
                    const backupData = JSON.parse(content);
                    
                    // Eğer yedek dosyası formatındaysa (data property'si varsa)
                    if (backupData.data && backupData.timestamp) {
                        jsonData = backupData.data;
                        console.log('📖 MUDEK yedek dosyası yüklendi:', path.basename(filePath));
                        console.log('📅 Yedek tarihi:', new Date(backupData.timestamp));
                    } else {
                        // Normal JSON dosyası
                        jsonData = backupData;
                        console.log('📖 Normal JSON dosyası yüklendi:', path.basename(filePath));
                    }
                    
                    mainWindow.webContents.send('load-json-file', { 
                        content: JSON.stringify(jsonData), 
                        filename: path.basename(filePath),
                        isBackup: true
                    });
                    
                } catch (parseError) {
                    console.error('❌ JSON parse hatası:', parseError);
                    dialog.showErrorBox('Hata', 'Dosya geçerli bir JSON formatında değil: ' + parseError.message);
                }
                
            } catch (readError) {
                console.error('❌ Dosya okuma hatası:', readError);
                dialog.showErrorBox('Hata', 'Dosya okunamadı: ' + readError.message);
            }
        }
    } catch (error) {
        console.error('❌ Yedek dosya yükleme hatası:', error);
        dialog.showErrorBox('Hata', 'Yedek dosya yükleme işlemi başarısız: ' + error.message);
    }
}

/**
 * Güncelleme kontrolü
 */
function checkForUpdates() {
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Güncelleme',
        message: 'Manuel güncelleme: GitHub releases sayfasından en son sürümü indirin.',
        buttons: ['GitHub\'a Git', 'Tamam']
    }).then((result) => {
        if (result.response === 0) {
            shell.openExternal('https://github.com/coruhtech/mudek-ders-degerlendirme-formu/releases');
        }
    });
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

// Otomatik kayıt sistemi için IPC handlers
ipcMain.handle('get-auto-save-path', async () => {
    try {
        const documentsPath = app.getPath('documents');
        const autoSaveDir = path.join(documentsPath, 'MUDEK Backups');
        
        // MUDEK Backups klasörünü oluştur
        if (!fs.existsSync(autoSaveDir)) {
            fs.mkdirSync(autoSaveDir, { recursive: true });
            console.log('📁 MUDEK Backups klasörü oluşturuldu:', autoSaveDir);
        }
        
        const autoSaveFile = path.join(autoSaveDir, 'mudek-course-data.json');
        return { 
            success: true, 
            filePath: autoSaveFile,
            backupDir: autoSaveDir
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-auto-data', async (event, data) => {
    try {
        const documentsPath = app.getPath('documents');
        const autoSaveDir = path.join(documentsPath, 'MUDEK Backups');
        
        // MUDEK Backups klasörünü oluştur
        if (!fs.existsSync(autoSaveDir)) {
            fs.mkdirSync(autoSaveDir, { recursive: true });
        }
        
        const autoSaveFile = path.join(autoSaveDir, 'mudek-course-data.json');
        const saveRecord = {
            data: data.content,
            timestamp: new Date().toISOString(),
            type: data.type || 'auto',
            version: '2.0.0',
            platform: process.platform,
            backupLocation: 'Documents/MUDEK Backups'
        };
        
        fs.writeFileSync(autoSaveFile, JSON.stringify(saveRecord, null, 2), 'utf8');
        
        return { 
            success: true, 
            filePath: autoSaveFile,
            timestamp: saveRecord.timestamp,
            backupDir: autoSaveDir
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-auto-data', async () => {
    try {
        const documentsPath = app.getPath('documents');
        const autoSaveFile = path.join(documentsPath, 'MUDEK Backups', 'mudek-course-data.json');
        
        if (!fs.existsSync(autoSaveFile)) {
            return { success: true, data: null, filePath: autoSaveFile };
        }
        
        const content = fs.readFileSync(autoSaveFile, 'utf8');
        const saveRecord = JSON.parse(content);
        
        return { 
            success: true, 
            data: saveRecord.data, 
            filePath: autoSaveFile,
            timestamp: saveRecord.timestamp,
            type: saveRecord.type,
            backupDir: path.dirname(autoSaveFile)
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('clear-auto-data', async () => {
    try {
        const documentsPath = app.getPath('documents');
        const autoSaveFile = path.join(documentsPath, 'MUDEK Backups', 'mudek-course-data.json');
        
        let fileExisted = false;
        if (fs.existsSync(autoSaveFile)) {
            fs.unlinkSync(autoSaveFile);
            fileExisted = true;
        }
        
        return { 
            success: true, 
            filePath: autoSaveFile,
            fileExisted: fileExisted,
            backupDir: path.dirname(autoSaveFile)
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('check-auto-data-exists', async () => {
    try {
        const documentsPath = app.getPath('documents');
        const autoSaveFile = path.join(documentsPath, 'MUDEK Backups', 'mudek-course-data.json');
        
        const exists = fs.existsSync(autoSaveFile);
        let size = 0;
        let timestamp = null;
        
        if (exists) {
            const stats = fs.statSync(autoSaveFile);
            size = stats.size;
            timestamp = stats.mtime.toISOString();
        }
        
        return { 
            success: true, 
            exists: exists,
            filePath: autoSaveFile,
            size: size,
            timestamp: timestamp,
            backupDir: path.dirname(autoSaveFile)
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Electron window reload handler
ipcMain.handle('reload-window', async () => {
    try {
        if (mainWindow && !mainWindow.isDestroyed()) {
            console.log('🔄 Electron Window yeniden yükleniyor...');
            mainWindow.reload();
            return { success: true };
        } else {
            console.log('❌ Ana pencere mevcut değil');
            return { success: false, error: 'Ana pencere mevcut değil' };
        }
    } catch (error) {
        console.error('❌ Window reload hatası:', error);
        return { success: false, error: error.message };
    }
});

// App Event Handlers
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    // Auto Updater kaldırıldı - basit desktop app
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