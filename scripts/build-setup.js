#!/usr/bin/env node

/**
 * Build Setup Script
 * Electron build için gerekli icon dosyalarını ve klasörleri oluşturur
 */

const fs = require('fs');
const path = require('path');

console.log('');
console.log('    ╔═══════════════════════════════════════╗');
console.log('    ║           CORUH ARGE LOGO             ║');
console.log('    ║    📱 MUDEK Ders Değerlendirme       ║');
console.log('    ║       Sistemi Kurulumu v2.0           ║');
console.log('    ╚═══════════════════════════════════════╝');
console.log('');
console.log('🔧 Build setup başlatılıyor...');

// Gerekli klasörleri oluştur
const dirs = [
    'dist',
    'app/v2/assets/img'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Klasör oluşturuldu: ${dir}`);
    }
});

// Icon dosyalarını kontrol et
const iconFiles = [
    'app/v2/assets/img/app-icon.png',
    'app/v2/assets/img/app-icon.ico',
    'app/v2/assets/img/app-icon.icns'
];

const baseIcon = 'app/v2/assets/img/coruh-logo.png';

if (fs.existsSync(baseIcon)) {
    iconFiles.forEach(iconPath => {
        if (!fs.existsSync(iconPath)) {
            // Base icon'u kopyala (gerçek uygulamada icon converter kullanılmalı)
            try {
                fs.copyFileSync(baseIcon, iconPath);
                console.log(`📄 Icon kopyalandı: ${iconPath}`);
            } catch (error) {
                console.warn(`⚠️ Icon kopyalanamadı: ${iconPath}`);
            }
        }
    });
}

// Package.json kontrol
if (!fs.existsSync('package.json')) {
    console.error('❌ package.json bulunamadı!');
    process.exit(1);
}

console.log('✅ Build setup tamamlandı!');
console.log('');
console.log('📋 Kullanım:');
console.log('  npm start          - Electron uygulamasını başlat');
console.log('  npm run dev        - Development modunda başlat');
console.log('  npm run build      - Tüm platformlar için build');
console.log('  npm run build:win  - Windows için build');
console.log('  npm run build:mac  - macOS için build');
console.log('  npm run build:linux - Linux için build'); 