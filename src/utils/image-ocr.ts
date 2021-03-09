import MAP_URL from '../assets/map.jpeg';

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
}

// 统一转成黑底白色的图片
function unitizeImageData(imageData: ImageData) {
    const grayImageData = toGray(imageData);
    const { width, height, data } = grayImageData;
    let threshold = otsu(data);
    // 大津处理背景与前景颜色相近的图片时，效果不好，这里回退到均值哈希来求阈值
    if (Math.pow(threshold - data[0], 2) < 4) {
        threshold = average(data);
    }
    const colors = data[0] > threshold ? [0, 255] : [255, 0];
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            const index = (j * width + i) * 4;
            const v = data[index] > threshold ? colors[0] : colors[1];
            data[index] = v;
            data[index + 1] = v;
            data[index + 2] = v;
            data[index + 3] = 255;
        }
    }
    return grayImageData;
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
}

function createCavans(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function countPixel(imageData: ImageData, isRow: boolean = false) {
    const { width, height, data } = imageData;
    const offsets = [0, 1, 2];
    const head = offsets.map((i) => data[i]);
    const pixel = [];
    if (isRow) {
        for (let i = 0; i < height; i++) {
            let count = 0;
            for (let j = 0; j < width; j++) {
                const index = (i * width + j) * 4;
                const isEqual = offsets.every(
                    (offset) => head[offset] === data[index + offset]
                );
                count += isEqual ? 0 : 1;
            }
            pixel.push(count);
        }
    } else {
        for (let i = 0; i < width; i++) {
            let count = 0;
            for (let j = 0; j < height; j++) {
                const index = (j * width + i) * 4;
                const isEqual = offsets.every(
                    (offset) => head[offset] === data[index + offset]
                );
                count += isEqual ? 0 : 1;
            }
            pixel.push(count);
        }
    }
    return pixel;
}

type Rang = {
    foreground?: boolean;
    background?: boolean;
    value: number;
};

function countRanges(counts: Array<number>): Array<Rang> {
    const groups = [];
    let foreground = 0;
    let background = 0;
    counts.forEach((count) => {
        if (count) {
            foreground += 1;
            if (background) {
                groups.push({ background: true, value: background });
                background = 0;
            }
        } else {
            background += 1;
            if (foreground) {
                groups.push({ foreground: true, value: foreground });
                foreground = 0;
            }
        }
    });
    if (foreground) {
        groups.push({ foreground: true, value: foreground });
    }
    if (background) {
        groups.push({ background: true, value: background });
    }
    return groups;
}

function getMaxRange(data: Array<Rang>) {
    return data.reduce((max, it) => {
        if (it.foreground) {
            return Math.max(max, it.value);
        }
        return max;
    }, 0);
}

function mergeRanges(data: Array<Rang>, size: number): Array<Rang> {
    const merge: any[] = [];
    let chunks: any[] = [];
    data.forEach((item) => {
        if (chunks.length) {
            chunks.push(item);
            const value = chunks.reduce((sum, chunk) => sum + chunk.value, 0);
            if (value >= size || Math.pow(value - size, 2) < 4) {
                merge.push({
                    foreground: true,
                    value,
                });
                chunks = [];
            }
            return;
        }
        if (item.foreground && item.value < size) {
            chunks = [item];
            return;
        }
        merge.push(item);
    });
    return merge;
}

function createChunks(data: Array<Rang>): Array<any> {
    const chunks: any[] = [];
    let offset = 0;
    data.forEach((item) => {
        if (item.foreground) {
            chunks.push({
                offset,
                size: item.value,
            });
        }
        offset += item.value;
    });
    return chunks;
}

function splitImage(image: HTMLImageElement) {
    const {
        naturalWidth: width,
        naturalHeight: height,
    } = image;
    const canvas = createCavans(width, height);
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = unitizeImageData(
        ctx.getImageData(0, 0, width, height)
    );
    const unitizeCanvas = createCavans(width, height);
    const unitizeCtx = <CanvasRenderingContext2D>unitizeCanvas.getContext('2d');
    unitizeCtx.putImageData(imageData, 0, 0);

    console.log(unitizeCanvas.toDataURL());

    // 逐行扫描
    const rowsRanges = countRanges(countPixel(imageData, true));
    // 逐列扫描
    const colsRanges = countRanges(countPixel(imageData, false));

    // 计算横纵像素分布得出字体内容的大小（字体正方形区域）
    const fontRange = Math.max(
        getMaxRange(rowsRanges),
        getMaxRange(colsRanges)
    );

    const rowsChunks = createChunks(mergeRanges(rowsRanges, fontRange));
    rowsChunks.forEach((chunk) => {
        const chunkCanvas = createCavans(width, chunk.size);
        const chunkCtx = <CanvasRenderingContext2D>chunkCanvas.getContext('2d');
        const chunkImageData = unitizeCtx.getImageData(0, chunk.offset, width, chunk.size);
        chunkCtx.putImageData(chunkImageData, 0, 0);
        console.log(chunkCanvas.toDataURL());
    });
}

(async function () {
    const image = await loadImage(MAP_URL);
    splitImage(image);
})();
