const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\MasterPc\\.gemini\\antigravity-ide\\brain\\23078a11-b2f7-4a09-b97d-dd079cfc7ec2';
const destDir = 'c:\\Users\\MasterPc\\Desktop\\kamci231.github.io\\images';

const files = [
    { src: 'gomchwi_hero_1779771256525.png', dest: 'gomchwi_hero.png' }
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
