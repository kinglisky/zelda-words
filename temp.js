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

    const getImageData = (image) => {
        const { naturalWidth: width, naturalHeight: height } = image;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, width, height);
    };

    function readMeta(imageData) {
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

    const image = await loadImage('https://erii.oss-cn-beijing.aliyuncs.com/zelda-words-1613805878005.png');
    const imageData = getImageData(image);
    const meta = readMeta(imageData);
    console.log(meta);
})();
