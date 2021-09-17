//引入TensorFlow
const tf = require('@tensorflow/tfjs');


// 定义线性衰退模型
const model = tf.sequential()
// add方法添加一个图层实例
// tf.layers.dense 创建一个输入输出维度为1的层
model.add(tf.layers.dense({ units: 1, inputShape: [1] }))

// 指定损失函数和优化器
model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' })

// 模拟一些数据用以训练
// xs代表投骰子的第几次
// tensor2d方法定义一个4行1列的二维张量
// xs代表投骰子的第几次
const xs = tf.tensor2d([1, 2, 3, 4], [4, 1])
// ys代表每一次骰子的结果
const ys = tf.tensor2d([1, 3, 5, 7], [4, 1])

// 训练模型
async function train() {
    // for循环增加训练次数，训练的越多，预测的越准
    for (let index = 0; index < 30; index++) {
        // fit方法训练模型，epochs表示迭代训练数组的次数
        await model.fit(xs, ys, { epochs: 10 })
    }
    // 训练完成，现在我们要预测第5次是几点
    // predict方法用以预测，相当于调用机器推导出的公式，传入一个b表示第5次的1行1列张量
    // print方法打印结果到控制台
    model.predict(tf.tensor2d([5], [1, 1])).print()
}

train()