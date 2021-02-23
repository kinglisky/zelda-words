import { Encoder, Decoder, ErrorCorrectionLevel } from '@nuintun/qrcode';

interface EncodeOptions {
    message: string,
    msize: number,
    margin: number,
}

function encode(opitons: EncodeOptions) {
    const qrcode = new Encoder();

    qrcode.setEncodingHint(true);
    qrcode.setErrorCorrectionLevel(ErrorCorrectionLevel.H);

    qrcode.write(opitons.message);

    qrcode.make();

    return qrcode.toDataURL(opitons.msize, opitons.margin);
}


function loadImage(url: string): Promise<HTMLImageElement>{
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

interface CreateOptions {
    size: number,
    width: number,
    height: number,
    message: string,
}

async function createQrcodeImage(options: CreateOptions): Promise<any>{
    const size = Math.min(options.size, 16);
    const qrcodeUrl = encode({
        message: options.message,
        msize: size,
        margin: 0,
    });
    const qrcodeImage = await loadImage(qrcodeUrl);
    const { naturalWidth, naturalHeight } = qrcodeImage;
    if (naturalWidth > options.width || naturalHeight > options.height) {
        if (size < 2) {
            console.log('二维码塞不下呀', { naturalWidth, naturalHeight }, qrcodeUrl);
            throw new Error('图片尺寸太小无法写入关联信息，请避免宽或高尺寸过小！');
        }
        return createQrcodeImage({
            ...options,
            size: Math.floor(size / 2),
        });
    }
    return qrcodeImage;
}

async function createHideCavans(options: CreateOptions) {
    const canvas = document.createElement('canvas');
    canvas.width = options.width;
    canvas.height = options.height;
    const qrcodeImage = await createQrcodeImage(options);
    const { naturalWidth, naturalHeight } = qrcodeImage;
    const dx = Math.floor((options.width - naturalWidth) / 2);
    const dy = Math.floor((options.height - naturalHeight) / 2);
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, options.width, options.height);
    ctx.drawImage(qrcodeImage, dx, dy);
    return canvas;
}

export async function writeMetaInfo(pixels: Uint8ClampedArray, options: CreateOptions): Promise<Uint8ClampedArray> {
    const qrcodeCanvas = await createHideCavans(options);
    const qrcodeCtx = <CanvasRenderingContext2D>qrcodeCanvas.getContext('2d');
    const qrcodeImageData = qrcodeCtx.getImageData(0, 0, options.width, options.height);
    const { width, height, data } = qrcodeImageData;
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            // 选用 r 通道来隐藏信息
            const r = (x + y * width) * 4;
            const v = data[r];
            // 二维码白色部分（背景）标识为 1，黑色部分（内容）标识为 0
            const bit = v === 255 ? 1 : 0;
            if (pixels[r] % 2 !== bit) {
                pixels[r] += bit ? 1 : -1;
            }
        }
    }
    return pixels;
}

function decode(url: string) {
    const qrcode = new Decoder();
    return qrcode.scan(url).then(result => result.data);
}

export async function readMetaInfo(url: string) {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    const {
        naturalWidth: width,
        naturalHeight: height,
    } = image;
    canvas.width = width;
    canvas.height = height;
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let x = 0; x < imageData.width; x++) {
        for (let y = 0; y < imageData.height; y++) {
            // 提取 r 通道的隐藏信息
            const r = (x + y * width) * 4;
            const v = imageData.data[r];
            // 二维码白色部分（背景）标识为 1，黑色部分（内容）标识为 0
            const color = v % 2 ? 255 : 0;
            imageData.data[r] = color;
            imageData.data[r + 1] = color;
            imageData.data[r + 2] = color;
            imageData.data[r + 3] = 255;
        }
    }
    ctx.clearRect(0, 0, width, height);
    ctx.putImageData(imageData, 0, 0);
    console.log(canvas.toDataURL());
    return decode(canvas.toDataURL());
}
