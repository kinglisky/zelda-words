<template>
    <section
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
    </section>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import exportImage from './export-image';
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
        const containerStyle = computed(() => {
            return {
                padding: `${props.size}px`,
                color: props.fontColor,
                backgroundColor: props.backgroundColor,
            };
        });

        const groups = computed(() => {
            let width = 0;
            let height = 0;
            const size = Number(props.size);
            const items = props.words.toLowerCase()
                .split('\n')
                .map(word => {
                    const containerSize = word.length * size;
                    width = Math.max(containerSize, width);
                    height += Number(size);
                    const style = props.vertical
                        ? { width: `${size}px`, height: `${containerSize}px`}
                        : { width: `${containerSize}px`, height: `${size}px` };
                    return {
                        style,
                        items: word.split('').map(v => ICON_MAP[v] || ''),
                    };
                });
            width += size * 2;
            height += size * 2;
            return {
                items,
                style: {
                    width: props.vertical ? `${height}px` : `${width}px`,
                    height: props.vertical ? `${width}px` : `${height}px`,
                    padding: `${size}px`,
                    color: props.fontColor,
                    backgroundColor: props.backgroundColor,
                },
            };
        });

        const download = () => exportImage(container.value);

        return {
            container,
            containerStyle,
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
