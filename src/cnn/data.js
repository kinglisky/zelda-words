import * as tf from '@tensorflow/tfjs';
import TRAIN from '../data/train.json';
import TEST from '../data/test.json';
import trainBufferURL from '../data/train.buffer?url';
import testBufferURL from '../data/test.buffer?url';

TRAIN.data = trainBufferURL;
TEST.data = testBufferURL;

export const WORDS_COUNT = 40;
export const IMAGE_H = 28;
export const IMAGE_W = 28;
const loadBuffer = async (data) => {
    const {
        count,
        width,
        height,
        data: path,
        indexs,
    } = data;
    const buffers = await fetch(path).then(res => res.arrayBuffer());
    const images = new Float32Array(new Uint8ClampedArray(buffers));
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
        const imagesShape = [target.count, target.height, target.height, 1];
        return {
            images: tf.tensor4d(target.images, imagesShape),
            labels: tf.oneHot(tf.tensor1d(target.labels, 'int32'), WORDS_COUNT).toFloat(),
        };
    }

    getTrainData() {
        return this.getData('train');
    }

    getTestData(numExamples) {
        const res = this.getData('test');
        if (numExamples) {
            return {
                images: res.images.slice([0, 0, 0, 0], [numExamples, IMAGE_H, IMAGE_W, 1]),
                labels: res.labels.slice([0, 0], [numExamples, WORDS_COUNT]),
            };
        }
        return res;
    }
}

export const dataset = new Dataset();
