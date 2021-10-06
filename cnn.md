起因是之前无聊搞了个《塞尔达》游戏的希卡文生成/翻译器，文字翻译的实现是通过**相似图片**识别实现的，比较简单暴力，通用性也不是很高。最近正在摸一些机器学习的东西，正好看到一个卷积神经的经典示例：[手写数字分类 MNIST](https://github.com/tensorflow/tfjs-examples/tree/master/mnist)，于是依葫芦画瓢重新实现了希卡文翻译器。

工具地址：[https://kinglisky.github.io/zelda-words/index.html](https://kinglisky.github.io/zelda-words/index.html)

仓库地址：[https://github.com/kinglisky/zelda-words](https://github.com/kinglisky/zelda-words)

前文：[从希卡文翻译谈谈 OCR 的简单实现](https://juejin.cn/post/6941003131891220517)

工具的功能很简单，可以实现《塞尔达》游戏中英文到希卡族文字的转换并下载成图片，也可将生成的席卡文图片翻译出来。

![output.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/37470daa9c6041ea8f8e7e3be0dadfb1~tplv-k3u1fbpfcp-watermark.image?)


对于图片的处理与文字切割这里就不不做赘述了，有兴趣的同学可以看看前文的处理，我们重点来看看如果依葫芦画瓢实现一个希卡文识别的卷积神经网络模型。

## 如何画一只马

还是那个经典的问题，咱们先来看看如何画一只马：
- 生成训练与测试数据
- 训练与评估模型
- 使用训练模型进行文字预测识别

很简单嘛，就三步，咱们一步步来~

## 生成训练数据

要说前端机器学习，自然而然会想到 [# TensorFlow.js](https://www.tensorflow.org/js?hl=zh-cn)，我们下面的对于希卡文识别模型的实现是基于官方提供的一个[手写数字分类 MNIST ](https://github.com/tensorflow/tfjs-examples/tree/master/mnist)的例子实现的，有兴趣的同学可以跑跑这个例子。

> MNIST 数据集表示经过改进的 NIST 数据集。其中，NIST 是美国国家标准与技术研究所（National Institute of Standards and Technology）的简称，这是因为 NIST 数据集是由该研究所收集并整理完成的。M 表示“经过改进”的（modified），体现了MNIST数据集是在原 NIST 数据集基础之上所做的改进。MNIST 数据集主要改进了两个方面：第一，将图像标准化为统一的 **28 像素 × 28 像素**，并进行抗锯齿处理，这让训练集和测试集更加一致；第二，确保训练集和测试集的手写数字来自没有重合的两组参与者。这些改进让数据集变得更易用，并且能够更加客观地计算模型的准确率。

官方例子处理的是 0~9 十个手写数字分类的问题，而我们需要实现 40 希卡字符分类问题，大差不差。

![1.jpeg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/54d0e5294a594172a42b68a57339f0a6~tplv-k3u1fbpfcp-watermark.image?)

### 张量与图片的 NHWC 编码
在 TensorFlow 中就如同它的名字一样，一切皆为张量（Tensor），我们所有需要处理的数据都得转换成张量的形式，张量是什么呢？一维的数组人们管它叫矢量，二维的数组叫做矩阵，那么三维、四维、N 维数组呢？起个名字就叫张量吧。这里简单的理解张量就是一个多维数组。


```javascript
// 一维张量
[1, 0, 0]

// 二维张量
[
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
]

// 三维张量
[
    [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ],
    [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ],
    [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ]
]
// ... N 维张量
```

那我们应该如何用张量来表示一张图片呢？先来看一张只有四像素（2 x 2）的图片，图片只有第一个像素有值（白色），我们可以用一个三维张量来表示，这里不考虑图片的 alpha 通道，表示如下：

![0.jpeg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/26d9ce6ca5f04b8494cfa65096c0c80e~tplv-k3u1fbpfcp-watermark.image?)

```javascript
[
    // 第一行像素
    [
        [255, 255, 255], // rgb 通道值
        [0, 0, 0],
    ],
    // 第二行像素
    [
        [0, 0, 0],
        [0, 0, 0],
    ],
]
```

如果是一张灰度图片（只有一个颜色通道）我们可以这样表示：

```javascript
[
    // 第一行像素
    [
        [255], // 只有一个灰度通道
        [0],
    ],
    // 第二行像素
    [
        [0],
        [0],
    ],
]
```

TensorFlow 有个张量**形状**的概念，简单来说就是用一个数组来描述张量每一维度的长度，有兴趣的同学可以看看[张量的形状](
https://www.tensorflow.org/guide/tensor?hl=zh-cn#%E5%BD%A2%E7%8A%B6%E7%AE%80%E4%BB%8B)的定义。

上面的 RGB 图片与灰度图片的张量形状分别是：`[2, 2, 3]` 和 `[2, 2, 1]`，一般情况我们都可以将图片以如下形状张量来表示：

```javasscript
[height, width, colorChannel]
```

机器学习往往会涉及大量训练数据，有时考虑到数据储存大小，会对数据进行编码压缩操作，例如上面灰度图片的三维张量我们可以**展平成一维数组**来表示：


```javascript
[
    // 第一行像素
    [
        [255], // 只有一个灰度通道
        [0],
    ],
    // 第二行像素
    [
        [0],
        [0],
    ],
]

// 转换成一维数组

[255, 0, 0, 0]
```

> 这种图像编码格式叫作 **HWC** 格式，即 “高度–宽度–颜色通道”（height-width-channel）格式。在对图像进行深度学习时，通常会将多张图片数据组合成一个批次，这样可以更高效地进行并行计算。在将图像打包成批次时，表示各个图像的维度总是第 1 个维度，因此，图像批次是一个四维张量，这四个维度分别是图像编号（N）、高度（H）、宽度（W）和颜色通道（C），这种编码格式叫作 **NHWC** 格式。

假设我们有两张 HWC 编码格式的灰度图片（2x2 大小），转成 NHWC 的格式存储如下：

```javascript
[255, 0, 0, 0] // 图片 1（HWC）
[0, 255, 0, 0] // 图片 2（HWC）

[255, 0, 0, 0, 0, 255, 0, 0] // 组合成批次（NHWC）
```

我们将使用 NHWC 格式作为图像编码格式，这也是 TensorFlow 默认支持的格式。

监督学习中对于每一个样本我们都需要提供一个输入与输出项（目标）。在手写数字分类中是输入图片与图片内容对应的数字，而在希卡文分类中是输入的图片与对应的字符的索引。

### 确认样本特征

因为希卡文翻译问题本质就是**字符图片的分类**问题，我们会提取出图片中每个希卡文字符与对应的 40 个英文字符进行分类，字符映射规则如下：

![ocr-map.jpeg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/569151f8df03479fbccd008ac8610a3c~tplv-k3u1fbpfcp-watermark.image?)

再来看一眼生成的希卡文图片特征再来决定我们应该生成怎样的训练图片：

![3.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1c947e96146941c2a5f9c79a021dc405~tplv-k3u1fbpfcp-watermark.image?)

![4.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/acb401e9d1194cc0994cf9071984fd0f~tplv-k3u1fbpfcp-watermark.image?)

![2.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9c60d9bbb0eb43ec92e8f8134244b06a~tplv-k3u1fbpfcp-watermark.image?)

希卡字符图片的尺寸、文字颜色与文字背景都不尽相同，我们可以根据这些特征，生成训练图片：

- 图片文字不同
- 图片大小不同
- 图片的文字颜色不同
- 图片的背景颜色不同

![5.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/d3f2d4b5d4c84ad7b803977147e4b76e~tplv-k3u1fbpfcp-watermark.image?)

按照上述的特征，我们可以随机生成不同训练图片。但这里有个疑问，它们是合适的训练集吗？

会问出这个问题答案显然不是，最早模拟训练集图片时我想着丰富样本的特性，还为生成的训练图片新增旋转与拉伸一类特性，想着训练出模型可以适应更多的场景，结果不言而喻。实际训练出的模型并不能达到使用的水准，原因出在哪呢？

![6.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3df231c07e47482491ce9c4734b7498b~tplv-k3u1fbpfcp-watermark.image?)

答案是**样本的特征定义并不准确**，实际应用中我们应该**精简样本特征**，尽量选择具有代表性特征，弱化或剔除不相关的特征。希卡文的识别其实最为重要就是**图片内容**（文字的形状），文字颜色和背景颜色无论如何变化都不会影响希卡文最终识别，所以这两特征是多余特征可以剔除掉。那为什么图片的大小需要考虑进来呢？

因为我们本身生成希卡文图片的文字大小并不相同，在最终生成训练数据图片需要统一转成 28 x 28 的尺寸，和 MNIST 数据集保持一致，不同尺寸大图片缩放到 28 x 28 尺寸时图片都会有不同程度的噪化，想想原本 200 x 200 字符图片缩小到 28 像素时文字会出现模糊情况，这会影响文字的形状，所以需要把大小这一特征考虑进来。所以我们的训练图片特征应该是两点：
- 图片的文字不同
- 图片的大小不同

![7.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/392423eafe364676ba019202ebff0424~tplv-k3u1fbpfcp-watermark.image?)

生成的训练图片如上图所示，实际我们在解析图片拆分希卡字符图片是也会做一层处理，也会将所有字符的文字颜色统一白色（255）背景统一成黑色（0），这样就能与训练的数据保持一致了。

### 生成训练图片

![9.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2d2ed8fcd3f342b2a3c0232f946d9bca~tplv-k3u1fbpfcp-watermark.image?)

希卡文字符的原始图片是 40 字符对应的 svg 图片，[希卡文字符文件集合](https://github.com/kinglisky/zelda-words/tree/master/src/assets/sheikah-icon)如上，我们可以生成一份字符图片路径的配置文件：

```json
// words.json
[
    {
        "symbol": "a",
        "path": "sheikah-icon/a.svg"
    },
    {
        "symbol": "b",
        "path": "sheikah-icon/b.svg"
    },
    {
        "symbol": "c",
        "path": "sheikah-icon/c.svg"
    },
    ......
]
```

文字内容由 path 构成（默认是黑色），而我们想要的**白色的文字**与**黑色的背景**，所以需要稍稍改造下 svg 图片的内容使它可以支持颜色的填充：

![10.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0815ef4e6cfc4e7b89dbbf332b900fd8~tplv-k3u1fbpfcp-watermark.image?)

```JavaScript
function fillSvg(svg, color) {
    const $ = cheerio.load(svg, { xmlMode: true });
    const fill = Color(color).hex();
    $('svg').attr('fill', fill);
    return $.xml();
}

async function loadSvg(word) {
    const svgPath = path.join(__dirname, '../src/assets', word.path);
    const data = await readFile(svgPath, 'utf8');
    // 文字填充为白色
    const svgContent = fillSvg(data, {
        r: 255,
        g: 255,
        b: 255,
    });
    return Buffer.from(svgContent);
}
```

将 svg 填充色指定为白色后，需要做一个随机的大小缩放然后与黑色背景做融合；这里我们使用了 [sharp](https://github.com/lovell/sharp) 库来处完成我们的操作，sharp 是个非常好用的 node 图片处理库，实现上述的操作也十分简单，直接上代码了：

```JavaScript
const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;

function randomValue(value, base = 0) {
    return Math.floor(Math.random() * value + base);
}

async function createWordImage(word) {
    const size = randomValue(200, 24);
    const svg = await loadSvg(word);
    // 生成大小不同的图片
    const resizeImageBuffer = await sharp(svg)
        .resize(size, size)
        .trim()
        .png().toBuffer();
    // 统一缩放成 28 x 28 大小
    const wordImageBuffer = await sharp(resizeImageBuffer)
        .resize(IMAGE_WIDTH, IMAGE_HEIGHT)
        .png().toBuffer();
    // 字符背景图片
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
    // 将文字图片绘制到背景图片上，做锐化并且以 raw 格式输出
    const image = await sharp(baseImageBuffer).composite([{
        input: wordImageBuffer,
        top: 0,
        left: 0,
    }]).sharpen().raw().toBuffer();
    return image;
}
```
sharp 中我们可以将图片导出成 buffer 来使用，最后一步我们将文字与背景图片融合后导出，导出前加了两个操作：

- sharpen 图片锐化抗锯齿处理
- raw 格式导出 buffer

锐化是为了突出图片文字的形状特征，raw 格式的 buffer 数据格式与 [ImageData.data](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData/data) 一致，每个像素点由 rgba 通道值组成。

我们完成了单张图片的生成，接下来就是批量随机生成图片集合了，操作也很简单：

```JavaScript
const tf = require('@tensorflow/tfjs');
const WORDS = require('../src/data/words.json');
const WORDS_INDEXS = Array.from({ length: WORDS.length }).map((_, i) => i);
const IMAGE_WIDTH = 28;
const IMAGE_HEIGHT = 28;
const COUNT = 100;
const NAME = 'train';

(async function main() {
    let data = null;
    const indexs = [];
    for (let i = 0; i < COUNT; i++) {
        // 打乱字符 40 字符索引顺序
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
            // rgb 转灰度
            for (let i = 0; i < buffer.length; i += 4) {
                const a = buffer[i + 3] / 255;
                const r = buffer[i] * a;
                const g = buffer[i + 1] * a;
                const b = buffer[i + 2] * a;
                pixs.push(Math.floor(r * 0.299 + g * 0.587 + b * 0.114));
            }
            indexs.push(index);
            const pixsBuffer = Buffer.from(pixs);
            //  buffer 拼接图片
            data = data ? Buffer.concat([data, pixsBuffer]) : pixsBuffer;
        });
        const meta = {
            indexs,
            count: (i + 1) * WORDS_INDEXS.length,
            width: IMAGE_WIDTH,
            height: IMAGE_HEIGHT,
            buffer: `${NAME}.buffer`,
        };
        // 保存训练数据
        await writeFile(path.join(__dirname, `../src/data/${NAME}.buffer`), data);
        await writeFile(path.join(__dirname, `../src/data/${NAME}.json`), JSON.stringify(meta));
    }
    console.log('done!');
})();
```

这里需要注意一点，在 `createWordImage` 导出的是包含 RGBA 通道的 buffer 数据（形状为`[28, 28, 4]`），而最终我们使用的图片数据形状应该是 `[28, 28, 1]` ，所以需要生成 buffer 需要将图片转成灰度图片，只保留一个颜色通道。另一个就是需要将每张图片对应的席卡文符号**索引**需要记录下来作为每个样本的输出项。

接下来就是泡一杯茶，耐心的等待训练数据的生成的。实际操作中我生成训练集包含了 8000 希卡字符样例，测试集 1600 样例。

这里稍微提一下**测试集**数据，我们使用训练集的数据训练完模型后，需要对模型的**准确率**做一个验证，测试集就是做校验用的样本集合，一般要求测试集的数据不能在**训练集**中出现过。

具体的训练与测试集数据可以戳这儿：https://github.com/kinglisky/zelda-words/tree/master/src/data

## 训练与评估模型

### 加载数据与 oneHot 编码
捣腾完训练数据后，训练的第一步就是将训练数据加载进来，训练数据是以 buffer 的二进制文件存储的，所以我们先提供个加载 buffer 文件的方法：

```JavaScript
const loadBuffer = async (data) => {
    const {
        count,
        width,
        height,
        url,
        indexs,
    } = data;
    const buffers = await fetch(url).then(res => res.arrayBuffer());
    const images = new Float32Array(new Uint8ClampedArray(buffers));
    for (let i = 0; i < images.length; i++) {
        // 将像素值统一成 0 ~ 1 Float32 值
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
```

这里有个特殊处理，我们将像素值除以 255 将其值变成变成了 0~1 区间的值，这其实是机器学习中处理数据的一种常规操作，为的是将输入的**特征数值尽量统一在数量级**上；举个例子，假设我们需要做一个黑洞的预测模型，有两个输入特征：

- 黑洞体积（1 ~ 1000）
- 黑洞质量（100000000 ~ 100000000000）

这两个黑洞模型的特征值，存在 N 个数量集的差距，这在训练时会十分影响训练模型特征的权重，所以一般需要将差别较大的特征值统一在一个数量级内，常用的是换算成一个特征值区间内的比例系数。

- 黑洞体积（0 ~ 1）
- 黑洞质量（0 ~ 1）

这样可以排除一些极端特征值的影响，另一方面也大大减小了数值计算的成本。接下来我们需要将加载 buffer 数据封装成 TensorFlow 需要的张量：

```JavaScript
// data.js
import * as tf from '@tensorflow/tfjs';
import TRAIN from '../data/train.json';
import TEST from '../data/test.json';
import trainBufferURL from '../data/train.buffer?url';
import testBufferURL from '../data/test.buffer?url';

TRAIN.url = trainBufferURL;
TEST.url = testBufferURL;

export const WORDS_COUNT = 40;
export const IMAGE_H = 28;
export const IMAGE_W = 28;

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
            // 转成 [8000, 28, 28, 1] 的张量
            images: tf.tensor4d(target.images, imagesShape),
            // 输出目标这里使用 oneHot 编码
            labels: tf.oneHot(tf.tensor1d(target.labels, 'int32'), WORDS_COUNT).toFloat(),
        };
    }
    
    // 获取训练数据
    getTrainData() {
        return this.getData('train');
    }
    
    // 获取测试数据
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
```

转换直接使用 `tf.tensor4d` 即可将 NHWC 的数据转成 [N, H, W, C] 形状的 4 维张量，需要特殊处理的是输出目标（labels），这里使用 [oneHot 编码](https://zh.wikipedia.org/wiki/One-hot)将原本形状为 [N] 的目标数据变成 [N, 40] 的形状。oneHot 编码简单理解就是对于分类目标进行二进制编码，举个例子：

假设我们只有三个字符 ABC 需要识别，因为是分类问题， ABC 对应的索引是 012，索引看起来是连续的而实际对应是个分类问题，使用数据索引容易引起混淆，何不为 ABC 设置一个编码用来区分彼此：

```JavaScript
const labels = tf.oneHot(tf.tensor1d([0, 1, 2], 'int32'), 3);
console.log(labels, labels.dataSync());
```

![11.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/bd00916818ba40269f7f0dec7c4d72fe~tplv-k3u1fbpfcp-watermark.image?)

```JavaScript
[0, 1, 2]
// 原本的 [N] 形状的数据变成了 [N, 3] 形状
[
    [1, 0, 0],
    [0, 1, 0],
    [0 0, 1],
]
```

- A 索引为 0 对应编码 [1, 0, 0]
- B 索引为 1 对应编码 [0, 1, 0]
- C 索引为 2 对应编码 [0, 0, 1]

一个分类对应一个唯一编码值，而且 oneHot 编码还与最终模型的预测结果相关，使用 tensorflow 训练模型做预测时，模型的输出结果并不会输出字符对应的索引值，而是各个分类的概率。假设我们模型预测输出为：

```json
[
    // 001 -> C
    [
        0.022, // 0
        0.024, // 0
        0.026, // 1
    ],
    // 010 -> B
    [
        0.021, // 0
        0.028, // 1
        0.026, // 0
    ],
    // 100 -> A
    [
        0.027, // 1
        0.024, // 0
        0.025, // 0
    ],
]
```
我们将预测输出数组中概率（数值）最大的设为 1 其他置为 0 即可得到一个 oneHot 编码，这个 oneHot 编码对应的分类就是我们预测结果。

### 训练模型

这里的模型我们直接使用 MNIST 示例的模型，先来看一下模型的定义：

```JavaScript
import * as tf from '@tensorflow/tfjs';
import { IMAGE_H, IMAGE_W, WORDS_COUNT } from './data';

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
    // 添加层密集增加神经网络的容量
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    // 为多分类问题配置归一化指数激活函数
    model.add(tf.layers.dense({ units: WORDS_COUNT, activation: 'softmax' }));
    return model;
}
```

这里不对模型做过多解释（我不会而已），拿来用就行。模型定义了一个 7 层网络结构，主要由卷积、池化与密集组成。卷积层与池化层用做图片的特征提取，密集层用于增加神经网络的容量，需要关注下最后一层的归一化 softmax 输出：

```JavaScript
tf.layers.dense({ units: WORDS_COUNT, activation: 'softmax' });
```
还记得上文我们所说的最后预测结果是一个与 oneHot 对应的概率数组吗？这里定义了最终模型针对**每个样本**的预测输出是一个 WORDS_COUNT（40）长度的数组，数组的值经过 [softmax 激活函数](https://zh.wikipedia.org/wiki/Softmax%E5%87%BD%E6%95%B0)归一化处理后是一个处于 0~1 概率值。

接下来就是训练模型了：

```JavaScript
import * as tf from '@tensorflow/tfjs';
import { dataset, IMAGE_H, IMAGE_W, WORDS_COUNT } from './data';

async function train({ model, data }) {
    model.compile({
        // RMSprop 优化器
        optimizer: 'rmsprop',
        // 交叉熵损失函数
        loss: 'categoricalCrossentropy',
        // 度量依据精度
        metrics: ['accuracy'],
    });
    // 每个批次选多少个样本
    const batchSize = 400;
    // 校验集比例
    const validationSplit = 0.15;
    // 训练轮次
    const trainEpochs = 20;

    let trainBatchCount = 0;
    let trainEpochCount = 0;

    const trainData = data.getTrainData();
    const testData = data.getTestData();
    // 剔除掉校验集合后的总训练样本数量
    const totalNumBatches = Math.ceil(trainData.images.shape[0] * (1 - validationSplit) / batchSize) * trainEpochs;

    let valAcc;
    // 执行模型训练
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
                await tf.nextFrame();
            },
            // 每个轮次训练结束调用
            onEpochEnd: async (epoch, logs) => {
                trainEpochCount++;
                valAcc = logs.val_acc;
                console.log(`训练进度：轮次 ${trainEpochCount}`);
                console.log(`校验集损失: ${logs.val_loss}`);
                console.log(`校验集准确率: ${logs.val_acc}`);
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
    });
};
```

模型的训练流程也和 MNIST 流程一致，我们主要关注几个训练参数：

- `batchSize` 每个训练批次样本数量
- `validationSplit` 训练时校验集比例
- `trainEpochs` 训练次数（轮次）


训练时我们不是一股脑将一堆数据全丢进去，需要拆分成多个批次，batchSize 用于设置每个批次样本数量，数量不宜太大也不宜太小，一般有训练集合数据量决定，我们这里设置是 400。

`validationSplit` 表示需要从训练集合取多大比例的样本数据用做校验，我们训练集有 8000 个样本，validationSplit 为 0.15，`8000 * 0.15 = 1200` 则每次训练我们从训练集中单独调出 1200 个样本用做校验，校验集的数据不会出现在训练中，每个轮次训练结束我们可以使用校验集数据对模型做一个评估，判断模式的可用性。

`trainEpochs` 训练的次数（轮数）会显著影响模型最终准确性，这也是最简单好用的提升模型质量的方法了，我们这里尝试了训练 1 次、5 次、10 次与 18 次的效果：

![12-1.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/edc73f2a01b5437597e95029d6a2e87f~tplv-k3u1fbpfcp-watermark.image?)

![12-2.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0105abac62624ef5b211dfc631955cdc~tplv-k3u1fbpfcp-watermark.image?)

![12-3.jpg](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/94eb30040fe648f1addc79648fa3d0aa~tplv-k3u1fbpfcp-watermark.image?)

![12-4.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/712be46f6dee4173abe0c5fe6fcd142e~tplv-k3u1fbpfcp-watermark.image?)

训练 1 次与 10 次能看到模型有质的飞越，这里我们的模型比较简单，大约 18 次左右以后就能达到很高准确率。
但暴力加次数也是有极限的，之前制作的样本加了文字颜色与旋转后，样本大概训练了 100 次左右后准确率就一直稳定在 80% 不再增加了，后续将训练次数提到 200 ~ 300 次（心疼我的电脑呀），也没丝毫的提升，这时候就需要对模型或者数据动刀子了，模型我这块我不会只好拿训练数据开刀了。

## 模型的导出使用

模型训练完成后需要将其导出，用于后续的使用：

```javascript
await model.save('downloads://zelda-words-model');
```

模型导出时会包含两个文件 `model.json` 与 `model.weights.bin`：

>-   model.json 是一个 JSON 文件，它包含了保存的模型拓扑结构。此处的“拓扑结构”包括：组成模型的层的类型、各层对应的配置参数，以及层之间的连接方式。

> -  除了模型的拓扑结构，model.json 还包含模型的权重清单。权重清单部分包含模型所有权重的名字、形状、数据类型，以及权重值存储的位置。weights.bin是一个二进制文件，它存储了模型的所有权重值。

使用时需要确保这里两个文件位于**同一目录下**，当然也可以将导出模型数据放在服务器上，但需要保证这两文件需要在**同一资源路径**下。使用时载入 model.json 即可：

```javascript
import * as tf from '@tensorflow/tfjs';
import { dataset } from './data';
import modelURL from '../data/model.json?url';

async function predict() {
    // 载入训练完成的模型
    const model = await tf.loadLayersModel(modelURL);
    await dataset.loadData();
    const examples = dataset.getTestData(40);
    // 使用模型进行预测
    const output = model.predict(examples.images);
    const axis = 1;
    // 输出测试集目标索引
    const labels = Array.from(examples.labels.argMax(axis).dataSync());
    // 预测结果的索引
    const predictions = Array.from(output.argMax(axis).dataSync());
    const res = predictions.filter((it, index) => it === labels[index]);
    console.log('预测结果', res.length, res);
}
```

最终的预测输出的结果是个是 `[N, 40]` 形状的二维张量，而我们想要的最终的字符的索引序号，这里可以通 `argMax` 取到对应维度上数值最大索引，由于我们是取第二维数据最大索引所以 axis 为 1（数值从 0 开始）。

```javascript
[
    [0.01, 0.02, 0.03],
    [0.03, 0.02, 0.01],
    [0.01, 0.03, 0.03],
];

// -- argMax(1) -->

[
    2,
    0,
    1,
];
```

最后只需要在原本的席卡文翻译流程使用训练好的模型进行识别即可：

```javascript
function convertToPredictData(images: Chunk[], imageSize: number) {
    images.forEach(it => {
        const imageData = resizeCanvas(it.canvas, imageSize);
        const pixs = new Float32Array(imageData.data.length / 4);
        let index = 0;
        // rgb 转灰度
        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            pixs[index] = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
            index += 1;
        }
        it.data = pixs;
    });
    const shape: [number, number, number, number] = [images.length, imageSize, imageSize, 1];
    const shapeSize = tf.util.sizeFromShape(shape);
    const concatData = new Float32Array(shapeSize);
    images.forEach((image, index) => {
        concatData.set(image.data as Float32Array, index * imageSize * imageSize);
    });
    // 将图片转换成张量
    return tf.tensor4d(concatData, shape);
}

export async function readMetaInfoByCnn(imageUrl: string) {
    const modelURL = 'https://xxx-server.com/model.json';
    const imageSize = 28;
    const readImage = await loadImage(imageUrl);
    // 将希卡文的图片拆分出来
    const images = splitImage(readImage, false);
    // 转换成模型需要的张量格式
    const predictData = convertToPredictData(images, imageSize);
    // 加载训练号的模型
    const model = await tf.loadLayersModel(modelURL);
    const output = model.predict(predictData) as tf.Tensor;
    const axis = 1;
    // 获取预测结果的索引
    const predictIndexs = Array.from(output.argMax(axis).dataSync());
    // 通过索引找到目标字符
    const results = predictIndexs.map((predictIndex, index) => {
        const target = words[predictIndex];
        return {
            ...images[index],
            word: target.symbol,
        };

    });
    console.log('results', results);
    if (results.length) {
        return printfSymbols(
            results,
            readImage.naturalWidth,
            readImage.naturalHeight
        );
    }
    window.alert('无法解析');
    throw new Error('PARSE ERROR');
}
```

希卡文字符拆分提取之前已经实现了，只需要将拆分图片转成 `[N, H, W, C]` 形状的张量即可；通过模型预测我们可以到最终的预测字符索引，自此希卡文翻译模型接入完成。

目前本菜对于机器学习的了解还只限于刷过几节吴恩达老师的课，粗粗翻了下[《JavaScript深度学习》](https://www.ituring.com.cn/book/2813)的程度，本文主要是梳理下功能实现流程，有纰漏的地方还多请赐教，溜~

## 最后

今年 E3 展会上，老任公布了最新的《旷野之息》续作，很是值得期待，英雄的征途还在，请不要随便死在路上。

![IMG_9599.JPG](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1647217de62b4104ba5e1931dc97a2eb~tplv-k3u1fbpfcp-watermark.image?)

![IMG_9600.JPG](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4b161be8b17f4ae7adbce5b04921d0eb~tplv-k3u1fbpfcp-watermark.image?)

