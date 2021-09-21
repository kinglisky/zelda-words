const data = require('./data');
const model = require('./model');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv)).argv;

async function run(epochs, batchSize, modelSavePath) {
    await data.loadData();

    model.summary();

    const {
        images: trainImages,
        labels: trainLabels,
    } = data.getTrainData();
    // console.log({ trainImages, trainLabels });
    const validationSplit = 0.15;
    await model.fit(trainImages, trainLabels, {
        verbose: 1,
        epochs,
        batchSize,
        validationSplit,
        callbacks: {
            onBatchEnd: async (batch, logs) => {
                console.log(`onBatchEnd: batch ${batch} ---> loss: ${logs.loss} acc: ${logs.acc}`);
            },
            onEpochEnd: async (epoch, logs) => {
                console.log(`onEpochEnd: epoch ${epoch} ---> val_loss: ${logs.val_loss} val_acc: ${logs.val_acc}`);
            }
        }
    });

    const {
        images: testImages,
        labels: testLabels,
    } = data.getTestData();

    const evalOutput = model.evaluate(testImages, testLabels);

    console.log(
        `\nEvaluation result:\n` +
        `  Loss = ${evalOutput[0].dataSync()[0].toFixed(3)}; ` +
        `Accuracy = ${evalOutput[1].dataSync()[0].toFixed(3)}`);

    if (modelSavePath) {
        await model.save(`file://${modelSavePath}`);
        console.log(`Saved model to path: ${modelSavePath}`);
    }
}

const epochs = Number(argv.epochs || 1);
const batchSize = Number(argv.batch_size || 10);
const modelSavePath = argv.model_save_path || '';
console.log({
    epochs,
    batchSize,
    modelSavePath,
});
run(epochs, batchSize, modelSavePath);
