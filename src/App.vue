<template>
    <main class="container">
        <section class="header">
            <div class="header__group">
                <label class="header__item" for="font-color-input">
                    <input
                        class="header__color"
                        type="color"
                        id="font-color-input"
                        v-model="fontColor"
                    />
                </label>

                <label class="header__item" for="background-color-input">
                    <input
                        class="header__color"
                        type="color"
                        id="background-color-input"
                        v-model="backgroundColor"
                    />
                </label>
            </div>

            <div class="header__group">
                <label class="header__item" for="vertical-radio">
                    <span>Vertical：</span>
                    <input type="checkbox" v-model="vertical" />
                </label>

                <label class="header__item" for="font-size-input">
                    <span>Size：</span>
                    <input
                        type="number"
                        id="font-size-input"
                        min="20"
                        max="200"
                        step="2"
                        v-model="size"
                        @blur="resetSize"
                    />
                </label>
            </div>

            <div class="header__group">
                <label class="header__item header__button" for="image-upload">
                    <span>Parse Image</span>
                    <input
                        class="header__upload"
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        @change="uploadImage"
                    />
                </label>
                <span
                    class="header__item header__button"
                    @click="downloadImage"
                >
                    {{ loading ? 'Download...' : 'Download' }}
                </span>
            </div>
        </section>

        <section class="content">
            <div class="words">
                <textarea placeholder="input..." v-model="words" />
            </div>
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
        <Download
            v-if="showDownload"
            :url="downloadUrl"
            @close="showDownload = false"
        />
    </main>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import WordsPanel from './components/WordsPanel.vue';
import ParsePanel from './components/ParsePanel.vue';
import Download from './components/Download.vue';
import './utils/image-ocr';

export default defineComponent({
    name: 'App',

    components: {
        WordsPanel,
        ParsePanel,
        Download,
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
            // 转偶数像素
            value = value % 2 === 0 ? value : value - 1;
            value = Math.max(20, value);
            value = Math.min(200, value);
            return String(value);
        });

        const resetSize = () => {
            size.value = limitSize.value;
        };

        const showDownload = ref(false);
        const downloadUrl = ref('');

        const downloadImage = async () => {
            const panel = wordsPanel.value || { download: () => {} };
            loading.value = true;
            const url = await panel.download();
            if (url) {
                downloadUrl.value = url;
                showDownload.value = true;
            }
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
            resetSize,
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
            showDownload,
            downloadUrl,
        };
    },
});
</script>

<style lang="scss">
* {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
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
    width: 100%;
    height: 60px;
    border-bottom: 1px solid #fff;

    &__group {
        display: flex;
        align-items: center;
        flex: 1;
        height: 100%;
    }

    &__item {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        flex: 1;
        height: 100%;
        color: #fff;
        border-top: 1px solid #fff;
        border-right: 1px solid #fff;
    }

    &__color {
        display: block;
        width: 100%;
        height: 100%;
        border: none;
    }

    &__button {
        cursor: pointer;
    }

    &__upload {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        outline: none;
        cursor: pointer;
        opacity: 0;
    }
}

.content {
    display: flex;
    align-items: center;
    flex: 1;
    overflow: hidden;
    width: 100%;
}

.words {
    flex: 1;
    box-sizing: border-box;
    overflow: hidden;
    height: 100%;

    textarea {
        display: block;
        width: 100%;
        height: 100%;
        padding: 32px;
        color: #fff;
        font-size: 14px;
        line-height: 2;
        background-color: transparent;
        border: none;
        border-right: 1px solid #fff;
        outline: none;
        resize: none;
    }
}

.results {
    display: flex;
    flex: 2;
    overflow-x: auto;
    overflow-y: auto;
    height: 100%;
}

@media (max-width: 768px) {
    .header {
        display: block;
        height: auto;

        &__group {
            display: flex;
            align-items: center;
            height: 60px;
        }

        &__item {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            border-bottom: 1px solid #fff;
        }
    }

    .content {
        flex-direction: column;
        flex: 1;
    }

    .words {
        width: 100%;
        height: 200px;
    }

    .results {
        justify-content: center;
        align-items: center;
        width: 100%;
    }
}
</style>
