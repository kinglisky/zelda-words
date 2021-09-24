#!/usr/bin/env node
const util = require('util');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const cheerio = require('cheerio');
const Color = require('color');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const tf = require('@tensorflow/tfjs');
const WORDS = require('./words.json');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

const WORDS_INDEXS = Array.from({ length: WORDS.length }).map((_, i) => i);
const IMAGE_WIDTH = Number(argv.size || 28);
const IMAGE_HEIGHT = Number(argv.size || 28);
const COUNT = Number(argv.count || 1);
const NAME = argv.name || 'temp';

console.log({
    COUNT,
    NAME,
    IMAGE_HEIGHT,
    IMAGE_WIDTH,
});

function randomValue(value, base = 0) {
    return Math.round(Math.random() * value + base);
}

function fillSvg(svg, color) {
    const $ = cheerio.load(svg, { xmlMode: true });
    const fill = Color(color).hex();
    $('svg').attr('fill', fill);
    return $.xml();
}

async function loadSvg(word) {
    const svgPath = path.join(__dirname, '../src/assets', word.path);
    const data = await readFile(svgPath, 'utf8');
    const svgContent = fillSvg(data, {
        r: 255,
        g: 255,
        b: 255,
    });
    return Buffer.from(svgContent);
}

async function createWordImage(word) {
    const size = randomValue(200, 24);
    // const rotate = randomValue(360);
    const svg = await loadSvg(word);
    const rotateImageBuffer = await sharp(svg)
        .resize(size, size)
        // .rotate(rotate, {
        //     background: {
        //         r: 0,
        //         g: 0,
        //         b: 0,
        //         alpha: 0,
        //     },
        // })
        .trim()
        .png().toBuffer();
    const wordImageBuffer = await sharp(rotateImageBuffer)
        .resize(IMAGE_WIDTH, IMAGE_HEIGHT)
        .png().toBuffer();
    // 每个字符的底色
    const baseImageBuffer = await sharp({
        create: {
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            channels: 4,
            background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0,
            },
        }
    }).png().toBuffer();
    const image = await sharp(baseImageBuffer).composite([{
        input: wordImageBuffer,
        top: 0,
        left: 0,
    }]).sharpen().raw().toBuffer();
    return image;
}

(async function main() {
    let data = null;
    const indexs = [];
    for (let i = 0; i < COUNT; i++) {
        console.log('batch create images --------------------------------------> ', i);
        // 打乱字符顺序
        tf.util.shuffle(WORDS_INDEXS);
        const createWords = WORDS_INDEXS.map(async (index) => {
            const word = WORDS[index];
            const buffer = await createWordImage(word);
            return {
                index,
                buffer,
            };
        });
        const res = await Promise.all(createWords);
        res.forEach(({ index, buffer }) => {
            const pixs = [];
            for (let i = 0; i < buffer.length; i += 4) {
                const a = buffer[i + 3] / 255;
                const r = buffer[i] * a;
                const g = buffer[i + 1] * a;
                const b = buffer[i + 2] * a;
                pixs.push(Math.floor(r * 0.299 + g * 0.587 + b * 0.114));
            }
            indexs.push(index);
            const pixsBuffer = Buffer.from(pixs);
            data = data ? Buffer.concat([data, pixsBuffer]) : pixsBuffer;
        });
        const meta = {
            indexs,
            count: (i + 1) * WORDS_INDEXS.length,
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            buffer: `${NAME}.buffer`,
        };
        await writeFile(path.join(__dirname, `../src/cnn/${NAME}.buffer`), data);
        await writeFile(path.join(__dirname, `../src/cnn/${NAME}.json`), JSON.stringify(meta));
        console.log(`batch save images --------------------------------------> ${i}, count ${meta.count}`);
    }
    console.log('done!');
})();
