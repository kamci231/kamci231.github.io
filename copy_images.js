const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\MasterPc\\.gemini\\antigravity-ide\\brain\\c3c5ea6a-54c3-416e-a4d9-74cb605a45e8';
const destDir = 'c:\\Users\\MasterPc\\Desktop\\kamci231.github.io\\images';

const files = [
    { src: 'gomchwi_hero_1779770060899.png', dest: 'gomchwi_hero.png' },
    { src: 'gomchwi_basket_1779770081077.png', dest: 'gomchwi_basket.png' },
    { src: 'gomchwi_dish_1779770098688.png', dest: 'gomchwi_dish.png' }
];

files.forEach(file => {
    const srcPath = path.join(srcDir, file.src);
    const destPath = path.join(destDir, file.dest);
    
    try {
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Successfully copied ${file.src} to ${file.dest}`);
        } else {
            console.error(`Source file not found: ${srcPath}`);
        }
    } catch (err) {
        console.error(`Error copying ${file.src}:`, err.message);
    }
});
