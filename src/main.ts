import { createApp } from 'vue';
import App from './App.vue';
import registScript from './components/WordIcon/regist-script';

registScript('//at.alicdn.com/t/font_2375469_s4wmtifuqro.js');

createApp(App).mount('#app');
