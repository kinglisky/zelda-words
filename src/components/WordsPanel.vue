<template>
    <section
        class="words-panel"
        ref="container"
        :class="{ 'words-panel--vertical': vertical }"
        :style="style"
        @click="download"
    >
        <div
            class="words-panel__groups"
            v-for="(group, index) in groups"
            :key="index"
            :style="group.style"
        >
            <WordIcon
                v-for="(word, idx) in group.value"
                :key="idx"
                :name="word"
                :width="size"
                :height="size"
            />
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
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
            type: Number,
            default: 750,
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
        const style = computed(() => {
            return {
                padding: `${props.size}px`,
                color: props.fontColor,
                backgroundColor: props.backgroundColor,
            };
        });

        const groups = computed(() => {
            return props.words.toLowerCase()
                .split('\n')
                .map(word => {
                    const containerSize = word.length * props.size;
                    const style = props.vertical
                        ? { width: `${props.size}px`, height: `${containerSize}px`}
                        : { width: `${containerSize}px`, height: `${props.size}px` };
                    return {
                        style,
                        value: word.split('').map(v => (ICON_MAP[v] || '')),
                    };
                });
        });

        const download = () => exportImage(container.value);

        onMounted(() => {
            console.log(container);
        });

        return {
            container,
            style,
            groups,
            download,
        };
    },
});
</script>

<style lang="scss">
.words-panel {
    width: 100%;

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
