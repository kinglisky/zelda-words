<template>
    <section
        ref="container"
        class="download"
    >
        <img :src="url">
    </section>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
    name: 'Download',

    props: {
        url: {
            type: String,
            default: '',
        },
    },

    setup: (_, context) => {
        const container = ref(null);

        const close = (event: Event) => {
            if (!container.value.contains(event.target)) {
                context.emit('close');
            }
        };

        onMounted(() => {
            document.body.addEventListener('click', close, false);
        });

        onBeforeUnmount(() => {
            document.body.removeEventListener('click', close, false);
        });

        return {
            container,
        };
    },
});
</script>

<style lang="scss">
.download {
    position: fixed;
    top: 50%;
    left: 50%;
    overflow: hidden;
    width: 80%;
    max-width: 600px;
    height: 60%;
    background: #fff;
    border-radius: 4px;
    transform: translate(-50%, -50%);

    img {
        display: block;
        width: 100%;
        height: 100%;

        object-fit: contain;
    }
}
</style>
