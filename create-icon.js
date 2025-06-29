const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Mevcut PNG icon'ı kullan
const sourceIcon = path.join(__dirname, 'app/v2/assets/img/app-icon.png');
const outputIcon = path.join(__dirname, 'icon.ico');

if (!fs.existsSync(sourceIcon)) {
    console.error('Kaynak icon dosyası bulunamadı:', sourceIcon);
    console.log('Lütfen app/v2/assets/img/app-icon.png dosyasının mevcut olduğundan emin olun.');
    process.exit(1);
}

// PNG'yi ICO'ya dönüştür
const toIco = require('to-ico');

fs.readFile(sourceIcon, (err, buf) => {
    if (err) {
        console.error('Icon dosyası okunamadı:', err);
        return;
    }
    
    console.log('Icon dönüştürülüyor...');
    
    toIco([buf], {
        resize: true,
        sizes: [16, 32, 48, 64, 128, 256]
    })
    .then(buf => {
        fs.writeFileSync(outputIcon, buf);
        console.log(`✅ Icon başarıyla oluşturuldu: ${outputIcon}`);
        console.log('Boyutlar: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256');
    })
    .catch(err => {
        console.error('❌ ICO dönüşümünde hata:', err);
    });
}); 