const toGray = (data: ImageData) => {
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
};

// 大津法取图片阈值
const otsu = (data: Uint8ClampedArray) => {
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

// 二值化输出 hash
const binaryzationOutput = (imageData: ImageData, threshold: number) => {
    const { width, height, data } = imageData;
    const hash = [];
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const idx = (x + y * width) * 4;
            const v = data[idx + 0] > threshold ? 1 : 0;
            hash.push(v);
        }
    }
    return hash;
};

export function createFingerprint(data: ImageData) {
    const grayData = toGray(data);
    // 二值化阈值
    const threshold = otsu(grayData.data);
    // 获取图片指纹
    const hash = binaryzationOutput(grayData, threshold);
    console.log(threshold, hash);
    return hash;
}
const loadImage = (url: string) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

const drawToCanvas = (image: HTMLImageElement) => {
    const { naturalWidth: width, naturalHeight: height } = image;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return canvas;
};

const putToCanvas = (imageData: ImageData, size: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = size;
    resizeCanvas.height = size;
    const resizeCtx = <CanvasRenderingContext2D>resizeCanvas.getContext('2d');
    resizeCtx.drawImage(canvas, 0, 0, imageData.width, imageData.height, 0, 0, size, size);
    return resizeCanvas;
}

export async function createImageGridsData(url: string, options: { size: number, fingerprintSize: number }) {
    const { size, fingerprintSize } = options;
    const image = await loadImage(url);
    const canvas = drawToCanvas(image as HTMLImageElement);
    const { width, height } = canvas;
    if (width % size || height % size) {
        throw new Error('图片尺寸异常');
    }

    const w = width / size;
    const h = height / size;
    const grids: Array<any> = Array.from({ length: height }).fill([]);
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const chunkImageData = ctx.getImageData(x * size, y * size, size, size);
            const resizeCanvas = putToCanvas(chunkImageData, fingerprintSize);
            const resizeCtx = <CanvasRenderingContext2D> resizeCanvas.getContext('2d');
            const resizeImageData = resizeCtx.getImageData(0, 0, fingerprintSize, fingerprintSize);
            grids[y][x] = createFingerprint(resizeImageData);
        }
    }
    return grids;
}
