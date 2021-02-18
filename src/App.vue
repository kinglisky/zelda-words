<template>
    <main class="container">
        <section class="header">
            <label class="color-input" for="font-color-input">
                <span>font color：</span>
                <input type="color" id="font-color-input" v-model="fontColor" />
            </label>

            <label class="color-input" for="background-color-input">
                <span>background color：</span>
                <input
                    type="color"
                    id="background-color-input"
                    v-model="backgroundColor"
                />
            </label>

            <label class="color-input" for="vertical-radio">
                <span>vertical：</span>
                <input
                    type="checkbox"
                    v-model="vertical"
                />
            </label>

            <label class="color-input" for="font-size-input">
                <span>font size：</span>
                <input
                    type="range"
                    id="font-size-input"
                    min="30"
                    max="200"
                    step="2"
                    v-model="size"
                />
                <span>{{ size }}px</span>
            </label>

            <label class="button-input" for="image-upload">
                <span>parse image</span>
                <input type="file" id="image-upload" />
            </label>
            <span class="button-input">download image</span>
        </section>

        <section class="content">
            <textarea
                class="words"
                placeholder="input..."
                v-model.trim="words"
            />
            <div class="results">
                <WordsPanel
                  :words="words"
                  :size="size"
                  :vertical="vertical"
                  :fontColor="fontColor"
                  :backgroundColor="backgroundColor"
                />
            </div>
        </section>
    </main>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import WordsPanel from './components/WordsPanel.vue';

const useConfig = () => {
    const size = ref(60);
    const backgroundColor = ref('#000000');
    const fontColor = ref('#97f7ff');
    const vertical = ref(false);
    return {
        size,
        backgroundColor,
        fontColor,
        vertical,
    };
};

const useWords = () => {
    const words = ref('hello world');
    return {
        words,
    };
};

export default defineComponent({
    name: 'App',

    components: {
        WordsPanel,
    },

    setup: () => {
        return {
            ...useConfig(),
            ...useWords(),
        };
    },
});
</script>

<style lang="scss">
* {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}
body {
    width: 100vw;
    background: #000200;
}

#app {
    display: flex;
    justify-content: center;
    overflow: hidden;
    width: 100vw;
    height: 100vh;
    font-family: Avenir, Helvetica, Arial, sans-serif;

    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

.container {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1920px;
    height: 100%;
}

.header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 80px;
    border-bottom: 1px solid #fff;
}

.button-input {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50%;
    padding: 0 16px;
    color: #fff;
    font-size: 14px;
    border: 1px solid #fff;
    border-radius: 20px;
    cursor: pointer;

    input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        outline: none;
        cursor: pointer;
        opacity: 0;
    }

    & + .button-input {
        margin-left: 32px;
    }
}

.color-input {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0 32px;
    color: #fff;

    span {
        margin-right: 8px;
    }
}

.content {
    display: flex;
    align-items: center;
    flex: 1;
    width: 100%;
}

.words {
    display: block;
    width: 400px;
    height: 100%;
    padding: 32px;
    color: #fff;
    font-size: 14px;
    background-color: transparent;
    border: none;
    border-right: 1px solid #fff;
    outline: none;
    resize: none;
    line-height: 2;
}

.results {
    flex: 1;
    height: 100%;
    overflow-x: auto;
    overflow-y: auto;
    padding: 32px;
}
</style>
