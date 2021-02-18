<template>
    <svg :style="iconStyle" class="word-icon" aria-hidden="true">
        <use :xlink:href="fullName" />
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'WordIcon',

    props: {
        // 图标名称
        name: {
            type: String,
            required: true,
        },

        width: {
            type: [Number, String],
            default: '',
        },

        height: {
            type: [Number, String],
            default: '',
        },

        color: {
            type: String,
            default: '',
        },

        opacity: {
            type: [Number, String],
            default: '',
        },
    },

    computed: {
        fullName(): string {
            return `#icon-${this.name}`;
        },

        iconStyle() {
            const { color, opacity, width: w, height: h } = this;
            const style = {};
            if (color) {
                style.color = color;
            }
            if (w != null) {
                style.width = typeof w === 'number' ? `${w}px` : w;
            }
            if (h != null) {
                style.height = typeof h === 'number' ? `${h}px` : h;
            }
            if (opacity != null) {
                style.opacity = opacity;
            }
            return style;
        },
    },
});
</script>

<style>
.word-icon {
    overflow: hidden;
    width: 1em;
    height: 1em;
    padding: 0;
    margin: 0;
    fill: currentColor;
}
</style>
