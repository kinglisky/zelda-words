<template>
    <section class="parse-panel">
        <span class="parse-panel__close" @click="close"> X </span>
    </section>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import { readMeta } from '../utils/meta-info';
import { createImageGridsData } from '../utils/image-parser';
import allWordsImage from '../assets/all-words.png';


const loadImage = (url: string) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

const getImageData = (image: HTMLImageElement) => {
    const { naturalWidth: width, naturalHeight: height } = image;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, width, height);
};

// 获取图片中文字排列与文字块大小
const getImageMetaInfo = async (url: string) => {
    const image = await loadImage(url);
    const imageData = getImageData(image as HTMLImageElement);
    return readMeta(imageData);
}

const initFontsFingerprint = async () => {
    const data = await createImageGridsData(allWordsImage, {
        size: 100,
        fingerprintSize: 8,
    });
    console.log(data);
}

export default defineComponent({
    name: 'ParsePanel',

    props: {
        url: {
            type: String,
            default: '',
        },
    },

    setup: (props, context) => {
        const close = () => context.emit('close');

        onMounted(() => {
            initFontsFingerprint(allWordsImage);
        });
        return {
            close,
        };
    },
});
</script>

<style lang="scss">
.parse-panel {
    position: fixed;
    width: 600px;
    height: 400px;
    background: #fff;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 4px;

    &__close {
        position: absolute;
        display: block;
        right: 0;
        top: 0;
        width: 32px;
        height: 32px;
        color: #000;
        line-height: 32px;
        text-align: center;
        cursor: pointer;
        font-size: 18px;
    }
}
</style>
