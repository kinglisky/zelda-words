const util = require('util');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const shell = require('shelljs');
const readFile = util.promisify(fs.readFile);
const data = require('../src/cnn/test.json');

(async function main() {
    const {
        count,
        width,
        height,
        buffer: bufferName,
        indexs,
    } = data;
    const buffer = await readFile(path.join(__dirname, '../src/cnn', bufferName));
    const chunkSize = width * height;
    const options = {
        raw: {
            width,
            height,
            channels: 1
        }
    };
    let i = 0;
    while (i < count) {
        const start = i * chunkSize;
        const end = start + chunkSize;
        const data = buffer.slice(start , end);
        const targetIndex = indexs[i];
        const fileName = `${targetIndex}.png`;
        await sharp(data, options).png().toFile(fileName);
        await shell.exec(`open ${fileName}`);
        i+=1;
    }
})();
