import MAP_URL from '../assets/map3.jpeg';

function toGray(data: ImageData) {
    const calculateGray = (r: number, g: number, b: number) =>
        Math.floor(r * 0.299 + g * 0.587 + b * 0.114);
    for (let x = 0; x < data.width; x++) {
        for (let y = 0; y < data.height; y++) {
            const idx = (x + y * data.width) * 4;
            const r = data.data[idx + 0];
            const g = data.data[idx + 1];
            const b = data.data[idx + 2];
            const gray = calculateGray(r, g, b);
            data.data[idx + 0] = gray;
            data.data[idx + 1] = gray;
            data.data[idx + 2] = gray;
            data.data[idx + 3] = 255;
        }
    }
    return data;
}

function average(data: Uint8ClampedArray) {
    let sum = 0;
    // 因为是灰度图片，取第一通道的值就好
    for (let i = 0; i < data.length - 1; i += 4) {
        sum += data[i];
    }
    return Math.round(sum / (data.length / 4));
}

// 大津法取图片阈值
function otsu(data: Uint8ClampedArray) {
    let ptr = 0;
    let histData = Array(256).fill(0); // 记录0-256每个灰度值的数量，初始值为0
    let total = data.length;

    while (ptr < total) {
        let h = data[ptr++];
        histData[h]++;
    }

    let sum = 0; // 总数(灰度值x数量)
    for (let i = 0; i < 256; i++) {
        sum += i * histData[i];
    }

    let wB = 0; // 背景（小于阈值）的数量
    let wF = 0; // 前景（大于阈值）的数量
    let sumB = 0; // 背景图像（灰度x数量）总和
    let varMax = 0; // 存储最大类间方差值
    let threshold = 0; // 阈值

    for (let t = 0; t < 256; t++) {
        wB += histData[t]; // 背景（小于阈值）的数量累加
        if (wB === 0) continue;
        wF = total - wB; // 前景（大于阈值）的数量累加
        if (wF === 0) break;

        sumB += t * histData[t]; // 背景（灰度x数量）累加

        let mB = sumB / wB; // 背景（小于阈值）的平均灰度
        let mF = (sum - sumB) / wF; // 前景（大于阈值）的平均灰度

        let varBetween = wB * wF * (mB - mF) ** 2; // 类间方差

        if (varBetween > varMax) {
            varMax = varBetween;
            threshold = t;
        }
    }

    return threshold;
};

// 统一转成黑底白色的图片
function unitizeImageData(imageData: ImageData) {
    const grayImageData = toGray(imageData)
    const { width, height, data } = grayImageData;
    const threshold = otsu(data);
    const colors = data[0] > threshold ? [0, 255] : [255, 0];
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const index = (j * width + i) * 4;
            const v = data[index] > threshold ? colors[0] : colors[1]
            data[index] = v;
            data[index + 1] = v;
            data[index + 2] = v;
            data[index + 3] = 255;
        }
    }
    return imageData;
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

function createCavans(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function countRows(imageData: ImageData) {
    const { width, height, data } = imageData;
    const offsets = [0, 1, 2];
    const head = offsets.map(i => data[i]);
    const rows = [];
    for (let i = 0; i < height; i++) {
        let count = 0;
        for (let j = 0; j < width; j++) {
            const index = (i * width + j) * 4;
            const isEqual = offsets.every(offset => head[offset] === data[index + offset]);
            count += isEqual ? 0 : 1;
        }
        rows.push(count);
    }
    return rows;
}

function countCols(imageData: ImageData) {
    const { width, height, data } = imageData;
    const offsets = [0, 1, 2];
    const head = offsets.map(i => data[i]);
    const cols = [];
    for (let i = 0; i < width; i++) {
        let count = 0;
        for (let j =0; j < height; j++) {
            const index = (j * width + i) * 4;
            const isEqual = offsets.every(offset => head[offset] === data[index + offset]);
            count += isEqual ? 0 : 1;
        }
        cols.push(count);
    }
    return cols;
}

function splitGroups(counts: Array<number>) {
    let foregroundCount = 0;
    const foregroundSum = counts.reduce((sum, count) => {
        if (count) {
            foregroundCount += 1;
        }
        return sum + count;
    }, 0);
    console.log(JSON.stringify(counts));
    console.log(foregroundSum / foregroundCount);
}

function splitImage(image: HTMLImageElement) {
    const {
        naturalWidth,
        naturalHeight,
    } = image;
    const canvas = createCavans(naturalWidth, naturalHeight);
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = unitizeImageData(ctx.getImageData(0, 0, naturalWidth, naturalHeight));
    const unitizeCanvas = createCavans(naturalWidth, naturalHeight);
    const unitizeCtx = <CanvasRenderingContext2D>unitizeCanvas.getContext('2d');
    unitizeCtx.putImageData(imageData, 0, 0);
    console.log(unitizeCanvas.toDataURL());
    const rows = countRows(imageData);
    console.log(splitGroups(rows));
}

(async function () {
    const image = await loadImage(MAP_URL);
    splitImage(image);
})();