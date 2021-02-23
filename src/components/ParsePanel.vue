<template>
    <section
        ref="container"
        class="parse-panel"
    >
        <span class="parse-panel__close" @click="close">×</span>
        <textarea class="parse-panel__message" v-model="message"></textarea>
    </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { readMetaInfo } from '../utils/image-info';
import wordMapImageUrl from '../assets/map.jpeg';

export default defineComponent({
    name: 'ParsePanel',

    props: {
        url: {
            type: String,
            default: '',
        },
    },

    setup: (props, context) => {
        const container = ref(null);
        const loading = ref(false);
        const metaInfo = ref('');
        const message = computed(() => {
            return loading.value ? '图片解析中......' : metaInfo.value;
        });

        const close = () => context.emit('close');

        const parseImage = async () => {
            loading.value = true;
            try {
                metaInfo.value = await readMetaInfo(props.url, wordMapImageUrl);
            } catch (error) {
                console.log(error);
                metaInfo.value = error.message || '图片信息解析出错！';
            }
            loading.value = false;
        }

        const closePanel = (event: Event) => {
            if (!container.value.contains(event.target)) {
                close();
            }
        };

        onMounted(() => {
            document.body.addEventListener('click', closePanel, false);
            parseImage();
        });

        onBeforeUnmount(() => {
            document.body.removeEventListener('click', closePanel, false);
        });

        return {
            container,
            message,
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
    width: 600px;
    height: 50%;
    background: #fff;
    border-radius: 4px;
    transform: translate(-50%, -50%);
    overflow: hidden;

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

    &__message {
        display: block;
        width: 100%;
        height: 100%;
        padding: 32px;
        color: #000;
        font-size: 18px;
        font-weight: bold;
        line-height: 2;
        border: none;
        outline: none;
        resize: none;
    }
}
</style>
