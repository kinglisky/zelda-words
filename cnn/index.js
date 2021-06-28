const tf = require('@tensorflow/tfjs');
const WORDS = require('./words.json');
const WORDS_INDEXS = Array.from({ length: WORDS.length }).map((_, i) => i)
const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;

tf.util.shuffle(data);
console.log(data);
