<template>
    <svg
        class="word-icon"
        aria-hidden="true"
        :style="iconStyle"
    >
        <use v-if="name" :xlink:href="fullName" />
    </svg>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';

type IconStyle = {
    color?: string;
    width?: string;
    height?: string;
    opacity?: string;
};

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
            type: String,
            default: '',
        },
    },

    setup: (props) => {
        const fullName = computed(() => `#icon-${props.name}`);
        const iconStyle = computed(() => {
            const style: IconStyle = {};
            if (props.color) {
                style.color = props.color;
            }
            if (props.width != null) {
                style.width =
                    typeof props.width === 'number'
                        ? `${props.width}px`
                        : props.width;
            }
            if (props.height != null) {
                style.height =
                    typeof props.height === 'number'
                        ? `${props.height}px`
                        : props.height;
            }
            if (props.opacity != null) {
                style.opacity = props.opacity;
            }
            return style;
        });
        return {
            fullName,
            iconStyle,
        };
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
