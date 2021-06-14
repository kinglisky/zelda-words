const binaryzationOutput = (originCanvas, threshold) => {
    const ctx = originCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, originCanvas.width, originCanvas.height);
    const { width, height, data } = imageData;
    // 第一像素的值即为背景色值
    const head = (data[0] + data[1] + data[2]) / 3 | 0;
    // 如果背景颜色大于阈值，则背景与文字的颜色的值则需要调换
    const color = head > threshold
        ? { foreground: 0, background: 255 }
        : { foreground: 255, background: 0 };
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            const idx = (x + y * width) * 4;
            const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3 | 0;
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