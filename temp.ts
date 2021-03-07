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
    const rows = countRows(imageData);
    let offsetY = 0;
    rows.forEach(row => {
        if (row.foreground && row.value > 3) {
            const rowImageData = ctx.getImageData(0, offsetY, width, row.value);
            const cols = countCols(rowImageData);
            let offsetX = 0;
            let i = 0;
            cols.forEach(col => {
                if (col.foreground && col.value > 20) {
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