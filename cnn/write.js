#!/usr/bin/env node
const util = require('util');
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
    const path = `./${word.path}`;
    const data = await readFile(path, 'utf8');
    const svgContent = fillSvg(data, {
        r: randomValue(255),
        g: randomValue(255),
        b: randomValue(255),
    });
    return Buffer.from(svgContent);
}

async function createWordImage(word) {
    const size = randomValue(200, 24);
    const rotate = randomValue(360);
    const svg = await loadSvg(word);
    const rotateImageBuffer = await sharp(svg)
        .resize(size, size)
        .rotate(rotate, {
            background: {
                r: 0,
                g: 0,
                b: 0,
                alpha: 0,
            },
        })
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
                r: randomValue(255),
                g: randomValue(255),
                b: randomValue(255),
                alpha: 255,
            },
        }
    }).png().toBuffer();
    const image = await sharp(baseImageBuffer).composite([{
        input: wordImageBuffer,
        top: 0,
        left: 0,
    }]).raw().toBuffer();
    return image;
}

(async function main() {
    let data = null;
    const indexs = [];
    for (let i = 0; i < COUNT; i++) {
        console.log('create images --------------------------------------> ', i);
        // 打乱字符顺序
        tf.util.shuffle(WORDS_INDEXS);
        const createWords = WORDS_INDEXS.map(async (index) => {
            const word = WORDS[index];
            console.log(`create: index: ${index} -> word: ${word.symbol}`);
            const buffer = await createWordImage(word);
            return {
                index,
                buffer,
            };
        });
        const res = await Promise.all(createWords);
        res.forEach(({ index, buffer }) => {
            indexs.push(index);
            data = data ? Buffer.concat([data, buffer]) : buffer;
        });
    }
    const res = {
        indexs,
        count: COUNT * WORDS.length,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        data: `./dataset/${NAME}.buffer`,
    };
    await writeFile(`./dataset/${NAME}.buffer`, data);
    await writeFile(`./dataset/${NAME}.json`, JSON.stringify(res));
    console.log(res);
})();
