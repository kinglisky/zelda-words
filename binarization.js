(async function () {
    // canvas drawImage 有跨域限制，先加载图片转 blob url 使用
    const loadImage = (url) => {
        return fetch(url)
            .then(res => res.blob())
            .then(blob => URL.createObjectURL(blob))
            .then(blobUrl => {

                return new Promise((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve(img);
                    img.onerror = (e) => reject(e);
                    img.src = blobUrl;
                });
            });
    };

    const drawToCanvas = (image) => {
        const { naturalWidth: width, naturalHeight: height } = image;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return canvas;
    }

    const canvasToGray = (canvas) => {
        const ctx = canvas.getContext('2d');
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const calculateGray = (r, g, b) => parseInt(r * 0.299 + g * 0.587 + b * 0.114);
        const grayData = [];
        for (let x = 0; x < data.width; x++) {
            for (let y = 0; y < data.height; y++) {
                const idx = (x + y * data.width) * 4;
                const r = data.data[idx + 0];
                const g = data.data[idx + 1];
                const b = data.data[idx + 2];
                const gray = calculateGray(r, g, b);
                grayData.push(gray);
            }
        }
        return grayData;
    };

    // 像素平均值图片阈值
    const average = (grayData) => {
        let sum = 0;
        for (let i = 0; i < grayData.length; i += 1) {
            sum += data[i];
        }
        return sum / grayData.length;
    };

    const otsu = (grayData) => {
        let ptr = 0;
        // 记录 0-256 每个灰度值的数量，初始值为 0
        let histData = Array(256).fill(0);
        let total = grayData.length;

        while (ptr < total) {
            let h = grayData[ptr++];
            histData[h]++;
        }
        // 总数(灰度值x数量)
        let sum = 0;
        for (let i = 0; i < 256; i++) {
            sum += i * histData[i];
        }
        // 背景（小于阈值）的数量
        let wB = 0;
        // 前景（大于阈值）的数量 
        let wF = 0;
        // 背景图像（灰度x数量）总和
        let sumB = 0;
        // 存储最大类间方差值
        let varMax = 0;
        // 阈值
        let threshold = 0;

        for (let t = 0; t < 256; t++) {
            // 背景（小于阈值）的数量累加
            wB += histData[t];
            if (wB === 0) continue;
            // 前景（大于阈值）的数量累加
            wF = total - wB;
            if (wF === 0) break;
            // 背景（灰度x数量）累加
            sumB += t * histData[t];

            // 背景（小于阈值）的平均灰度
            let mB = sumB / wB;
            // 前景（大于阈值）的平均灰度
            let mF = (sum - sumB) / wF;
            // 类间方差
            let varBetween = wB * wF * (mB - mF) ** 2;

            if (varBetween > varMax) {
                varMax = varBetween;
                threshold = t;
            }
        }

        return threshold;
    };

    const binaryzationOutput = (originCanvas, threshold) => {
        const ctx = originCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, originCanvas.width, originCanvas.height);
        const { width, height, data } = imageData;
        // 第一像素的值即为背景色值
        const head = (data[0] + data[1] + data[2]) / 3;
        // 如果背景颜色大于阈值，则背景与文字的颜色的值则需要调换
        const color = head > threshold
            ? { foreground: 0, background: 255}
            : { foreground: 255, background: 0 };
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const idx = (x + y * width) * 4;
                const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const v = avg > threshold ? color.foreground : color.background;
                data[idx] = v;
                data[idx + 1] = v;
                data[idx + 2] = v;
                data[idx + 3] = 255;
            }
        }
        ctx.putImageData(imageData, 0, 0);
        return originCanvas.toDataURL();
    }

    const binaryzationHash = (originCanvas, threshold) => {
        const ctx = originCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, originCanvas.width, originCanvas.height);
        const { width, height, data } = imageData;
        // 第一像素的值即为背景色值
        const head = (data[0] + data[1] + data[2]) / 3;
        // 如果背景颜色大于阈值，则背景与文字的颜色的值则需要调换
        const color = head > threshold
            ? { foreground: 0, background: 255}
            : { foreground: 255, background: 0 };
        const hash = [];
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const idx = (x + y * width) * 4;
                const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const v = avg > threshold ? color.foreground : color.background;
                hash.push(v ? 1 : 0);
            }
        }
        return hash;
    }

    const url = 'https://markdown-write.oss-cn-hangzhou.aliyuncs.com/ocr-2.jpeg';
    const image = await loadImage(url);
    const canvas = drawToCanvas(image);
    const grayData = canvasToGray(canvas);
    // const threshold = average(grayData);
    const threshold = otsu(grayData);
    const result = binaryzationOutput(canvas, threshold);
    console.log(result);
})();