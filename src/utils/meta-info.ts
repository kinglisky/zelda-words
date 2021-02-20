interface WriteOptions {
    size: number,
    vertical: boolean,
    width: number;
    height: number;
    data: Uint8ClampedArray;
}

export function writeMeta(options: WriteOptions): Uint8ClampedArray {
    const {
        size,
        vertical,
        width,
        height,
        data
    } = options;
    const info = `${vertical ? 1 : 0}${size}<#>`;
    const meta = info.split('').reduce((b, w) => {
        return b + w.charCodeAt(0).toString(2);
    }, '');
    const count = Math.ceil((width * height) / meta.length);
    const bits = Array.from({ length: count }).fill(meta).join('');
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const index = x + y * width;
            const alpha = index * 4 + 3;
            const bit = Number(bits[index]);
            data[alpha] =
                data[alpha] % 2 == bit ? data[alpha] : data[alpha] - 1;
        }
    }
    return data;
}

export function readMeta(imageData: ImageData) {
    const { width, height, data } = imageData;
    const bits = new Uint8ClampedArray(width * height);
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const index = (x + y * width);
            const alpha = index * 4 + 3;
            bits[index] = data[alpha] % 2;
        }
    }
    // 分隔符 <#>
    const s1 = '111100100011111110';
    const groups = bits.join('').split(s1);
    const group = groups[1] || groups[0];
    if (!group) {
        return null;
    }

    const values = [];
    for (let i = 0; i < group.length; i += 6) {
        const item = group.slice(i, i + 6);
        values.push(String.fromCharCode(parseInt(item, 2)));
    }
    const [vertical, ...sizes] = values;
    return {
        vertical: Number(vertical),
        size: Number(sizes.join('')),
    };
}
