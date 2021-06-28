const sharp = require('sharp');
const tf = require('@tensorflow/tfjs');
const WORDS = require('./words.json');
const WORDS_INDEXS = Array.from({ length: WORDS.length }).map((_, i) => i)
const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;
const SIZE = 2;

async function createBaseImage({ width, height }) {
    return sharp({
        create: {
            width,
            height,
            channels: 4,
            background: {
                r: 255,
                g: 255,
                b: 255,
                alpha: 255,
            },
        }
    }).png().toBuffer();
}

function createWordImage(word) {
    const size = Math.round(24 + Math.random() * 200);
    return sharp(`./${word.path}`)
        .resize(size, size)
        .rotate(10)
        .resize(IMAGE_WIDTH, IMAGE_HEIGHT)
        .toBuffer();
}

(async function main() {
    const BASE_IMAGE_WIDTH = WORDS.length * IMAGE_WIDTH;
    const BASE_IMAGE_HEIGHT = SIZE * IMAGE_HEIGHT;
    let baseBuffer = await createBaseImage({
        width: BASE_IMAGE_WIDTH,
        height: BASE_IMAGE_HEIGHT,
    });
    for (let i = 0; i < SIZE; i++) {
        console.log('create iamges', i);
        tf.util.shuffle(WORDS_INDEXS);
        await WORDS_INDEXS.reduce((promise, key, j) => {
            const word = WORDS[key];
            return promise
                .then(() => createWordImage(word))
                .then((buffer) => {
                    return sharp(baseBuffer).composite([{
                        input: buffer,
                        top: i * IMAGE_HEIGHT,
                        left: j * IMAGE_WIDTH,
                    }]).png().toBuffer()
                })
                .then(base => {
                    baseBuffer = base;
                });
        }, Promise.resolve());
    }
    sharp(baseBuffer)
        .png()
        .toFile('base.png')
        .then(function (info) {
            console.log(info)
        })
        .catch(function (err) {
            console.log(err)
        })
})();