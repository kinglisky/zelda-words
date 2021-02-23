interface Meta {
    vertical: boolean;
    size: number;
    width: number;
    height: number;
}

function createCavans(width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function paddingLfet(bits: string) {
    return ('00000000' + bits).slice(-8);
}

function getGcd(a: number, b: number): number {
    let max = Math.max(a, b);
    let min = Math.min(a, b);
    if (max % min === 0) {
        return min;
    } else {
        return getGcd(max % min, min);
    }
}

function getLcm(a: number, b: number) {
    return (a * b) / getGcd(a, b);
}

function createHeadMeta(options: Meta) {
    const verticalBit = paddingLfet(Number(options.vertical).toString(2));
    const sizeBit = paddingLfet(options.size.toString(2));
    const sizeCount = Math.floor(options.width / options.size);
    if (sizeCount > 255) {
        throw new Error('图片尺寸过大！');
    }
    const widthBit = paddingLfet(sizeCount.toString(2));
    const bits = verticalBit + sizeBit + widthBit;
    // 取最小公倍数
    const bitLength = bits.length;
    const canvasWidth = getLcm(options.width, bitLength);
    const canvasHeight = Math.floor(canvasWidth / options.width * options.size);
    const canvas = createCavans(canvasWidth, canvasHeight);
    const ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
    const chunkWidth = canvasWidth / bitLength;
    for (let i =0; i< bitLength; i++) {
        ctx.fillStyle = Number(bits[i]) ? 'rgb(19, 25, 27)' : 'rgb(18, 24, 26)';
        ctx.fillRect(i * chunkWidth, 0, chunkWidth, canvasHeight);
    }
    console.log(canvas.toDataURL('image/jpeg', 1));
    console.log(ctx.getImageData(0, 0, canvasWidth, canvasHeight));

}
// 19, 25, 27 | 18, 24, 26
// 20, 24, 27 | 19, 23, 26

createHeadMeta({
    vertical: true,
    size: 20,
    width: 300,
    height: 60,
});


function loadImage(url: string): Promise<HTMLImageElement>{
    return fetch(url)
        .then(res => res.blob())
        .then(blob => URL.createObjectURL(blob))
        .then(objUrl => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = (e) => reject(e);
                img.src = objUrl;
            });
        })
};

async function parse(url: string) {
    const image = await loadImage(url);
    const canvas = createCavans(image.naturalWidth, image.naturalHeight);
    const ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, image.naturalWidth, image.naturalHeight);
    console.log(imageData);
}

parse('https://erii.oss-cn-beijing.aliyuncs.com/code-wechat.jpeg');
