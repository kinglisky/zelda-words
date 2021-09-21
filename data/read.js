const util = require('util');
const fs = require('fs');
const sharp = require('sharp');
const shell = require('shelljs');
const readFile = util.promisify(fs.readFile);
const data = require('./dataset/test.json');

(async function main() {
    const {
        count,
        width,
        height,
        data: path,
        indexs,
    } = data;
    const buffer = await readFile(path);
    const chunkSize = width * height * 4;
    const options = {
        raw: {
            width,
            height,
            channels: 4
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
