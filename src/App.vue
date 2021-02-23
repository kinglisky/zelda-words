<template>
    <main class="container">
        <section class="header">
            <label class="color-input" for="font-color-input">
                <span>Font Color：</span>
                <input type="color" id="font-color-input" v-model="fontColor" />
            </label>

            <label class="color-input" for="background-color-input">
                <span>Background Color：</span>
                <input
                    type="color"
                    id="background-color-input"
                    v-model="backgroundColor"
                />
            </label>

            <label class="color-input" for="vertical-radio">
                <span>Vertical：</span>
                <input
                    type="checkbox"
                    v-model="vertical"
                />
            </label>

            <label class="color-input" for="font-size-input">
                <span>Font Size：</span>
                <input
                    type="number"
                    id="font-size-input"
                    min="20"
                    max="300"
                    step="2"
                    v-model="size"
                />
            </label>

            <label class="button-input" for="image-upload">
                <span>Parse Image</span>
                <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    @change="uploadImage"
                />
            </label>
            <span
                class="button-input"
                @click="downloadImage"
            >
                {{ loading ? 'Download...' : 'Download Image' }}
            </span>
        </section>

        <section class="content">
            <textarea
                class="words"
                placeholder="input..."
                v-model="words"
            />
            <div class="results">
                <WordsPanel
                    ref="wordsPanel"
                    :words="words"
                    :size="limitSize"
                    :vertical="vertical"
                    :fontColor="fontColor"
                    :backgroundColor="backgroundColor"
                />
            </div>
        </section>

        <ParsePanel
            v-if="showParsePanel"
            :url="parseImageUrl"
            @close="showParsePanel = false"
        />
    </main>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import WordsPanel from './components/WordsPanel.vue';
import ParsePanel from './components/ParsePanel.vue';
import './utils/image-info';

export default defineComponent({
    name: 'App',

    components: {
        WordsPanel,
        ParsePanel,
    },

    setup: () => {
        const size = ref('60');
        const fontColor = ref('#13c2fe');
        const backgroundColor = ref('#12181a');
        const vertical = ref(false);
        const words = ref('hello world');
        const wordsPanel = ref(null);
        const loading = ref(false);
        const limitSize = computed(() => {
            let value = Number(size.value);
            value = Math.max(20, value);
            value = Math.min(200, value);
            return String(value);
        });

        const downloadImage = async () => {
            const panel = wordsPanel.value || { download: () => {} };
            loading.value = true;
            await panel.download();
            loading.value = false;
        };

        const showParsePanel = ref(false);
        const parseImageUrl = ref('');
        const uploadImage = ({ target }: any) => {
            const [file] = target.files;
            parseImageUrl.value = URL.createObjectURL(file);
            showParsePanel.value = true;
            target.value = '';
        };
    
        return {
            size,
            limitSize,
            fontColor,
            backgroundColor,
            vertical,
            words,
            loading,
            wordsPanel,
            downloadImage,
            uploadImage,
            parseImageUrl,
            showParsePanel,
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
    overflow: hidden;
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
}
</style>
