import MAP_URL from '../assets/map.jpeg';

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

function splitRows(imageData: ImageData) {
    const { width, height, data } = imageData;
    const offsets = [0, 1, 2];
    const head = offsets.map(i => data[i]);
    const rows = [];

    let background = 0;
    let foreground = 0;
    for (let i = 0; i < height; i++) {
        let count = 0;
        for (let j = 0; j < width; j++) {
            const index = (i * width + j) * 4;
            const isSame = offsets.every(offset => head[offset] === data[index + offset]);
            count += (isSame ? 0 : 1);
        }
        if (count) {
            foreground += 1;
            if (background) {
                rows.push({
                    background: true,
                    value: background
                });
                background = 0;
            }
        } else {
            background += 1;
            if (foreground) {
                rows.push({
                    foreground: true,
                    value: foreground
                });
                foreground = 0;
            }
        }
    }
    if (foreground) {
        rows.push({
            foreground: true,
            value: foreground
        });
    }
    if (background) {
        rows.push({
            background: true,
            value: background
        });
    }
    return rows;
}

function splitCols(imageData: ImageData) {
    const { width, height, data } = imageData;
    const offsets = [0, 1, 2];
    const head = offsets.map(i => data[i]);
    const cols = [];

    let background = 0;
    let foreground = 0;
    for (let i = 0; i < width; i++) {
        let count = 0;
        for (let j =0; j < height; j++) {
            const index = (j * width + i) * 4;
            const isSame = offsets.every(offset => head[offset] === data[index + offset]);
            count += isSame ? 0 : 1;
        }
        if (count) {
            foreground += 1;
            if (background) {
                cols.push({
                    background: true,
                    value: background
                });
                background = 0;
            }
        } else {
            background += 1;
            if (foreground) {
                cols.push({
                    foreground: true,
                    value: foreground
                });
                foreground = 0;
            }
        }
    }
    if (foreground) {
        cols.push({
            foreground: true,
            value: foreground
        });
    }
    if (background) {
        cols.push({
            background: true,
            value: background
        });
    }
    return cols;
}

function splitImage(image: HTMLImageElement) {
    const {
        naturalWidth,
        naturalHeight,
    } = image;
    const canvas = createCavans(naturalWidth, naturalHeight);
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, naturalWidth, naturalHeight);
    const { width } = imageData;
    const rows = splitRows(imageData);
    let offsetY = 0;
    rows.forEach(row => {
        if (row.foreground && row.value > 3) {
            const rowImageData = ctx.getImageData(0, offsetY, width, row.value);
            const cols = splitCols(rowImageData);
            let offsetX = 0;
            let i = 0;
            cols.forEach(col => {
                if (col.foreground && col.value > (row.value / 4)) {
                    const colImageData = ctx.getImageData(offsetX, offsetY, col.value, row.value);
                    const colCanvas = createCavans(col.value, row.value);
                    const colCtx = <CanvasRenderingContext2D>colCanvas.getContext('2d');
                    colCtx.putImageData(colImageData, 0, 0);
                    i += 1;
                    console.log(i, ':', colCanvas.toDataURL());
                }
                offsetX += col.value;
            });
            console.log(row.value, cols);
        }
        offsetY += row.value;
    });
}

(async function () {
    console.log(MAP_URL);
    const image = await loadImage(MAP_URL);
    splitImage(image);
})();