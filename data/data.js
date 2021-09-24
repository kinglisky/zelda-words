const fs = require('fs');
const path = require('path');
const util = require('util');
const tf = require('@tensorflow/tfjs');
const readFile = util.promisify(fs.readFile);
const WORDS = require('./words.json');
const TRAIN = require('../src/cnn/train.json');
const TEST = require('../src/cnn/test.json');
const loadBuffer = async (data) => {
    const {
        count,
        width,
        height,
        buffer: bufferName,
        indexs,
    } = data;
    const buffers = await readFile(path.join(__dirname, '../src/cnn', bufferName));
    const images = new Float32Array(buffers);
    for (let i = 0; i < images.length; i++) {
        images[i] = images[i] / 255;
    }
    const labels = new Int32Array(indexs);
    return {
        count,
        width,
        height,
        images,
        labels,
    };
}

class Dataset {
    constructor() {
        this.dataset = {};
    }

    async loadData() {
        const train = await loadBuffer(TRAIN);
        const test = await loadBuffer(TEST);
        this.dataset = {
            train,
            test,
        };
    }

    getData(key) {
        const target = this.dataset[key];
        const imagesShape = [target.count, target.height, target.height, 1 ];
        return {
            images: tf.tensor4d(target.images, imagesShape),
            labels: tf.oneHot(tf.tensor1d(target.labels, 'int32'), WORDS.length).toFloat(),
        };
    }

    getTrainData() {
        return this.getData('train');
    }

    getTestData() {
        return this.getData('test');
    }
}

module.exports = new Dataset();
