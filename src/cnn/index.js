import * as tf from '@tensorflow/tfjs';
import { dataset, IMAGE_H, IMAGE_W, WORDS_COUNT } from './data';
import modelURL from '../data/model.json?url';

const BATCH_SIZE = 400;

function createModel() {
    const model = tf.sequential();
    // conv2d 层，进行卷积操作
    model.add(tf.layers.conv2d({
        inputShape: [IMAGE_H, IMAGE_W, 1],
        kernelSize: 3,
        filters: 16,
        activation: 'relu'
    }));
    // 卷积后进行池化
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    // 在重复一次卷积与池化
    model.add(tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: 'relu' }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    model.add(tf.layers.conv2d({ kernelSize: 3, filters: 32, activation: 'relu' }));
    // 扁平化张量
    model.add(tf.layers.flatten({}));
    // 添加层密集加神经网络的容量
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    // 为多分类问题配置归一化指数激活函数
    model.add(tf.layers.dense({ units: WORDS_COUNT, activation: 'softmax' }));
    return model;
}

async function showPredictions(model, data) {
    const testExamples = 40;
    const examples = data.getTestData(testExamples);
    tf.tidy(() => {
        const output = model.predict(examples.images);
        const axis = 1;
        const labels = Array.from(examples.labels.argMax(axis).dataSync());
        const predictions = Array.from(output.argMax(axis).dataSync());
        const res = predictions.filter((it, index) => it === labels[index]);
        console.log('预测结果', res.length, res);
    });
}

async function train({ model, data, onIteration }) {
    model.compile({
        optimizer: 'rmsprop',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy'],
    });

    const batchSize = BATCH_SIZE;

    // 校验集比例
    const validationSplit = 0.15;

    // 训练轮次
    const trainEpochs = 20;

    let trainBatchCount = 0;
    let trainEpochCount = 0;

    const trainData = data.getTrainData();
    const testData = data.getTestData();

    const totalNumBatches = Math.ceil(trainData.images.shape[0] * (1 - validationSplit) / batchSize) * trainEpochs;

    let valAcc;
    await model.fit(trainData.images, trainData.labels, {
        batchSize,
        validationSplit,
        epochs: trainEpochs,
        callbacks: {
            // 每个批次训练结束调用
            onBatchEnd: async (batch, logs) => {
                trainBatchCount++;
                console.log(`训练进度：${(trainBatchCount / totalNumBatches * 100).toFixed(1)}%`);
                console.log(`损失: ${logs.loss}`);
                console.log(`准确率: ${logs.acc}`);
                if (onIteration && batch % 10 === 0) {
                    onIteration('onBatchEnd', batch, logs);
                }
                await tf.nextFrame();
            },
            // 每个轮次训练结束调用
            onEpochEnd: async (epoch, logs) => {
                trainEpochCount++;
                valAcc = logs.val_acc;
                console.log(`训练进度：轮次 ${trainEpochCount}`);
                console.log(`校验集损失: ${logs.val_loss}`);
                console.log(`校验集准确率: ${logs.val_acc}`);
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
    console.log('加载训练数据...');
    await dataset.loadData();
    const model = createModel();
    train({
        model,
        data: dataset,
        onIteration: () => {
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
    console.log('预测结果', res.length, res);
}

window.addEventListener('load', () => {
    document.querySelector('.run').addEventListener('click', run, false);
    document.querySelector('.predict').addEventListener('click', predict, false);
});
