(function () {
    function paddingLfet(bits) {
        return ('00000000' + bits).slice(-8);
    }

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

    function write(data) {
        const bits = data.reduce((s, it) => s + paddingLfet(it.toString(2)), '');
        const size = 100;
        const width = size * bits.length;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0000000';
        ctx.fillRect(0, 0, width, size);
        for (let i = 0; i < bits.length; i++) {
            if (Number(bits[i])) {
                ctx.fillStyle = '#020202';
                ctx.fillRect(i * size, 0, size, size);
            }
        }
        return canvas.toDataURL();
    }

    async function read(url) {
        const image = await loadImage(url);
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const size = 100;
        const bits = [];
        for (let i = 0; i < 16; i++) {
            const imageData = ctx.getImageData(i * size, 0, size, size);
            const r = imageData.data[0];
            const g = imageData.data[1];
            const b = imageData.data[2];
            bits.push(r + g + b === 0 ? 0 : 1);
        }
        return bits;
    }

    const url = write([100, 200]);
    console.log(url);
    read(url).then(bits => console.log(bits));
})();