(async function () {
    function loadImage (url) {
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

    function createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    function getImageData(image) {
        const { naturalWidth, naturalHeight } = image;
        const canvas = createCanvas(naturalWidth, naturalHeight);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, naturalWidth, naturalHeight);
    }

    function putImageData(imageData) {
        const { width, height } = imageData;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    function writeMetaInfo(baseImageData, qrcodeImageData) {
        const { width, height, data } = qrcodeImageData;
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                // 选用 r 通道来隐藏信息
                const r = (x + y * width) * 4;
                const v = data[r];
                // 二维码白色部分（背景）标识为 1，黑色部分（内容）标识为 0
                const bit = v === 255 ? 1 : 0;
                // 如果当前 R 通道色值奇偶性和二维码对应像素不一致则进行加减一使其奇偶性一致
                if (baseImageData.data[r] % 2 !== bit) {
                    baseImageData.data[r] += bit ? 1 : -1;
                }
            }
        }
        return baseImageData;
    }

    function readMetaInfo(imageData) {
        const { width, height, data } = imageData;
        const qrcodeImageData = new ImageData(width, height);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                // 读取 r 通道息
                const r = (x + y * width) * 4;
                const v = data[r] % 2 === 0 ? 0 : 255;
                qrcodeImageData.data[r] = v;
                qrcodeImageData.data[r + 1] = v;
                qrcodeImageData.data[r + 2] = v;
                qrcodeImageData.data[r + 3] = 255;
            }
        }
        return qrcodeImageData;
    }

    const baseImage = await loadImage('https://gd-filems.dancf.com/mcm79j/mcm79j/05654/cd68f955-0f4d-4e42-af93-fe8ae82599e3555415.png');
    const qrcodeImage = await loadImage('https://gd-filems.dancf.com/mcm79j/mcm79j/05654/f3ffa72f-2377-4c8c-b30f-6d261f5b6905555476.jpg');
    const resultImageData = writeMetaInfo(getImageData(baseImage), getImageData(qrcodeImage));
    const resultCanvas = putImageData(resultImageData);

    // const resultDataUrl = resultCanvas.toDataURL('image/png');
    const resultDataUrl = resultCanvas.toDataURL('image/jpeg', 1);
    console.log(resultDataUrl);
    const hideMetaImage = await loadImage(resultDataUrl);
    const readData = readMetaInfo(getImageData(hideMetaImage));
    const readCanvas = putImageData(readData);
    console.log(readCanvas.toDataURL());
})();