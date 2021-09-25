<template>
    <section
        ref="container"
        class="parse-panel"
    >
        <span class="parse-panel__close" @click="close">×</span>
        <img
            class="parse-panel__result"
            v-if="resultImage"
            :src="resultImage"
        >
        <span
            v-else
            class="parse-panel__message"
        >
            图片解析中......
        </span>
    </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';
import { readMetaInfo, readMetaInfoByCnn } from '../utils/image-ocr';
import wordMapImageUrl from '../assets/map.png';

export default defineComponent({
    name: 'ParsePanel',

    props: {
        url: {
            type: String,
            default: '',
        },

        useConvnet: {
            type: Boolean,
            default: false,
        },
    },

    setup: (props, context) => {
        const container = ref(null);
        const resultImage = ref('');

        const close = () => context.emit('close');

        const parseImage = async () => {
            try {
                resultImage.value = props.useConvnet
                    ? await readMetaInfoByCnn(props.url)
                    : await readMetaInfo(props.url, wordMapImageUrl);
            } catch (error) {
                console.log(error);
                resultImage.value = '';
            }
        }

        const closePanel = (event: Event) => {
            if (!container.value.contains(event.target)) {
                close();
            }
        };

        onMounted(() => {
            document.body.addEventListener('click', closePanel, false);
            console.log('使用卷积神经网络进行识别：', props.useConvnet);
            parseImage();
        });

        onBeforeUnmount(() => {
            document.body.removeEventListener('click', closePanel, false);
        });

        return {
            container,
            resultImage,
            close,
        };
    },
});
</script>

<style lang="scss">
.parse-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    overflow: hidden;
    width: 80%;
    max-width: 600px;
    height: 50%;
    background: #fff;
    border-radius: 4px;
    transform: translate(-50%, -50%);

    &__close {
        position: absolute;
        top: 0;
        right: 0;
        display: block;
        width: 36px;
        height: 36px;
        color: #000;
        font-size: 36px;
        line-height: 36px;
        text-align: center;
        cursor: pointer;
    }

    &__result {
        display: block;
        width: 100%;
        height: 100%;

        object-fit: contain;
    }

    &__message {
        display: flex;
        width: 100%;
        height: 100%;
        align-items: center;
        justify-content: center;
    }
}
</style>
