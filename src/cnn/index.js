import * as tf from '@tensorflow/tfjs';
import { dataset, IMAGE_H, IMAGE_W, WORDS_COUNT } from './data.js';
import modelURL from './model.json?url';


const BATCH_SIZE = 400;

function createModel() {
    // Create a sequential neural network model. tf.sequential provides an API
    // for creating "stacked" models where the output from one layer is used as
    // the input to the next layer.
    const model = tf.sequential();

    // The first layer of the convolutional neural network plays a dual role:
    // it is both the input layer of the neural network and a layer that performs
    // the first convolution operation on the input. It receives the 28x28 pixels
    // black and white images. This input layer uses 16 filters with a kernel size
    // of 5 pixels each. It uses a simple RELU activation function which pretty
    // much just looks like this: __/
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_H, IMAGE_W, 1],
        kernelSize: 3,
        filters: 16,
        activation: 'relu'
    }));

    // After the first layer we include a MaxPooling layer. This acts as a sort of
    // downsampling using max values in a region instead of averaging.
    // https://www.quora.com/What-is-max-pooling-in-convolutional-neural-networks
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Our third layer is another convolution, this time with 32 filters.
    model.add(tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: 'relu' }));

    // Max pooling again.
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));

    // Add another conv2d layer.
    model.add(tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: 'relu' }));

    // Now we flatten the output from the 2D filters into a 1D vector to prepare
    // it for input into our last layer. This is common practice when feeding
    // higher dimensional data to a final classification output layer.
    model.add(tf.layers.flatten({}));

    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));

    // Our last layer is a dense layer which has 10 output units, one for each
    // output class (i.e. 0, 1, 2, 3, 4, 5, 6, 7, 8, 9). Here the classes actually
    // represent numbers, but it's the same idea if you had classes that
    // represented other entities like dogs and cats (two output classes: 0, 1).
    // We use the softmax function as the activation for the output layer as it
    // creates a probability distribution over our 10 classes so their output
    // values sum to 1.
    model.add(tf.layers.dense({ units: WORDS_COUNT, activation: 'softmax' }));

    return model;
}

async function showPredictions(model, data) {
    const testExamples = 40;
    const examples = data.getTestData(testExamples);

    // Code wrapped in a tf.tidy() function callback will have their tensors freed
    // from GPU memory after execution without having to call dispose().
    // The tf.tidy callback runs synchronously.
    tf.tidy(() => {
        const output = model.predict(examples.images);
        const axis = 1;
        const labels = Array.from(examples.labels.argMax(axis).dataSync());
        const predictions = Array.from(output.argMax(axis).dataSync());
        const res = predictions.filter((it, index) => it === labels[index]);
        console.log('Show Predictions', res.length, res);
    });
}

async function train({ model, data, onIteration }) {
    const optimizer = 'rmsprop';
    model.compile({
        optimizer,
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    const batchSize = BATCH_SIZE;

    // Leave out the last 15% of the training data for validation, to monitor
    // overfitting during training.
    const validationSplit = 0.15;

    // Get number of training epochs from the UI.
    const trainEpochs = 100;

    // We'll keep a buffer of loss and accuracy values over time.
    let trainBatchCount = 0;
    let trainEpochCount = 0;

    const trainData = data.getTrainData();
    const testData = data.getTestData();

    const totalNumBatches = Math.ceil(trainData.images.shape[0] * (1 - validationSplit) / batchSize) * trainEpochs;

    // During the long-running fit() call for model training, we include
    // callbacks, so that we can plot the loss and accuracy values in the page
    // as the training progresses.
    let valAcc;
    await model.fit(trainData.images, trainData.labels, {
        batchSize,
        validationSplit,
        epochs: trainEpochs,
        callbacks: {
            onBatchEnd: async (batch, logs) => {
                trainBatchCount++;
                console.log(`训练进度：${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%`);
                console.log(`loss: ${logs.loss}`);
                console.log(`acc: ${logs.acc}`);
                if (onIteration && batch % 10 === 0) {
                    onIteration('onBatchEnd', batch, logs);
                }
                await tf.nextFrame();
            },
            onEpochEnd: async (epoch, logs) => {
                trainEpochCount++;
                valAcc = logs.val_acc;
                console.log(`训练进度：批次 ${trainEpochCount}`);
                console.log(`val_loss: ${logs.val_loss}`);
                console.log(`val_acc: ${logs.val_acc}`);
                if (onIteration) {
                    onIteration('onEpochEnd', epoch, logs);
                }
                await tf.nextFrame();
            }
        }
    });

    const testResult = model.evaluate(testData.images, testData.labels);
    const testAccPercent = testResult[1].dataSync()[0] * 100;
    const finalValAccPercent = valAcc * 100;
    console.log(`检验集准确率: ${finalValAccPercent.toFixed(1)}%`);
    console.log(`测试集准确率: ${testAccPercent.toFixed(1)}%`);

    const saveResults = await model.save('downloads://zelda-words-model');
    console.log('保存模型', saveResults);
}

async function run() {
    await dataset.loadData();
    const model = createModel();
    train({
        model,
        data: dataset,
        onIteration: (action) => {
            console.log(action);
            showPredictions(model, dataset);
        },
    });
};

async function predict() {
    const model = await tf.loadLayersModel(modelURL);
    await dataset.loadData();
    const examples = dataset.getTestData(40);
    const output = model.predict(examples.images);
    const axis = 1;
    const labels = Array.from(examples.labels.argMax(axis).dataSync());
    const predictions = Array.from(output.argMax(axis).dataSync());
    const res = predictions.filter((it, index) => it === labels[index]);
    console.log('Show Predictions', res.length, res);
}

window.addEventListener('load', () => {
    document.querySelector('.run').addEventListener('click', run, false);
    document.querySelector('.predict').addEventListener('click', predict, false);
});
