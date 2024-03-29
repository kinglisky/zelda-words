<template>
    <section :style="wrapStyle">
        <div
            class="words-panel"
            ref="container"
            :class="{ 'words-panel--vertical': vertical }"
            :style="groups.style"
        >
            <div
                class="words-panel__groups"
                v-for="(group, index) in groups.items"
                :key="index"
                :style="group.style"
            >
                <WordIcon
                    v-for="(word, idx) in group.items"
                    :key="idx"
                    :name="word"
                    :width="size"
                    :height="size"
                />
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import exportImage from '../utils/export-image';
import WordIcon from './WordIcon/Main.vue';
import ICON_MAP from './WordIcon/icon-map';

export default defineComponent({
    name: 'WordsPanel',

    components: {
        WordIcon,
    },

    props: {
        words: {
            type: String,
            required: true,
        },

        size: {
            type: String,
            default: '60',
        },

        fontColor: {
            type: String,
            required: true,
        },

        backgroundColor: {
            type: String,
            required: true,
        },

        vertical: {
            type: Boolean,
            default: false,
        },
    },

    setup: (props) => {
        const container = ref(null);

        const groups = computed(() => {
            let width = 0;
            let height = 0;
            const size = Number(props.size);
            const items = props.words
                .toLowerCase()
                .split('\n')
                .map((word) => {
                    const containerSize = word.length * size;
                    width = Math.max(containerSize, width);
                    height += Number(size);
                    const style = props.vertical
                        ? { width: `${size}px`, height: `${containerSize}px` }
                        : { width: `${containerSize}px`, height: `${size}px` };
                    return {
                        style,
                        items: word.split('').map((v) => ICON_MAP[v] || ''),
                    };
                });
            width += size * 2;
            height += size * 2;
            const containerWidth = props.vertical ? height : width;
            const containerHeight = props.vertical ? width : height;
            return {
                items,
                containerWidth,
                containerHeight,
                style: {
                    width: `${containerWidth}px`,
                    height: `${containerHeight}px`,
                    padding: `${size}px`,
                    color: props.fontColor,
                    backgroundColor: props.backgroundColor,
                },
            };
        });

        const wrapStyle = computed(() => {
            if (window.innerWidth < 768) {
                const { innerWidth, innerHeight } = window;
                const width = innerWidth;
                const height = innerHeight - 380;
                const { containerWidth, containerHeight } = groups.value;
                const ratio = Math.min(
                    width / containerWidth,
                    height / containerHeight
                );
                return { transform: `scale(${ratio})` };
            }
            return {};
        });
        const download = () =>
            exportImage(container.value, {
                size: Number(props.size),
                message: props.words,
                vertical: props.vertical,
                fontColor: props.fontColor,
                backgroundColor: props.backgroundColor,
                width: groups.value.containerWidth,
                height: groups.value.containerHeight,
            }).catch((error) => {
                window.alert(error.message || '图片导出出错！');
                console.log(error);
            });

        return {
            container,
            wrapStyle,
            groups,
            download,
        };
    },
});
</script>

<style lang="scss">
.words-panel {
    &__groups {
        display: flex;
    }

    &--vertical {
        display: flex;

        .words-panel__groups {
            flex-direction: column;
        }
    }
}
</style>
