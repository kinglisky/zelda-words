var e=Object.prototype.hasOwnProperty,t=Object.getOwnPropertySymbols,o=Object.prototype.propertyIsEnumerable,n=Object.assign,r=(n,r)=>{var a={};for(var l in n)e.call(n,l)&&r.indexOf(l)<0&&(a[l]=n[l]);if(null!=n&&t)for(var l of t(n))r.indexOf(l)<0&&o.call(n,l)&&(a[l]=n[l]);return a};import{d as a,a as l,c as s,b as i,e as c,o as u,r as d,f as p,g as h,F as f,h as m,i as g,j as w,w as v,v as y,k as b,t as _,l as k}from"./vendor.d2c3908a.js";!function(e=".",t="__import__"){try{self[t]=new Function("u","return import(u)")}catch(o){const n=new URL(e,location),r=e=>{URL.revokeObjectURL(e.src),e.remove()};self[t]=e=>new Promise(((o,a)=>{const l=new URL(e,n);if(self[t].moduleMap[l])return o(self[t].moduleMap[l]);const s=new Blob([`import * as m from '${l}';`,`${t}.moduleMap['${l}']=m;`],{type:"text/javascript"}),i=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(s),onerror(){a(new Error(`Failed to import: ${e}`)),r(i)},onload(){o(self[t].moduleMap[l]),r(i)}});document.head.appendChild(i)})),self[t].moduleMap={}}}("/zelda-words/assets/");const x=/Android|iPhone|webOS|BlackBerry|SymbianOS|Windows Phone|iPad|iPod/i.test(window.navigator.userAgent);async function S(e,t){if(!e)return Promise.resolve("");const o=await a.toJpeg(e,{filter:e=>function(e){e instanceof SVGElement&&Array.from(e.querySelectorAll("use")||[]).forEach((t=>{const o=t.getAttribute("xlink:href");if(o&&!e.querySelector(o)){const t=document.querySelector(o);t&&e.insertBefore(t.cloneNode(!0),e.children[0])}}));return!0}(e),quality:1});if(!x){const e=document.createElement("a");return e.download=`zelda-words-${Date.now()}.jpeg`,e.href=o,e.click(),""}return o}var C=l({name:"WordIcon",props:{name:{type:String,required:!0},width:{type:[Number,String],default:""},height:{type:[Number,String],default:""},color:{type:String,default:""},opacity:{type:String,default:""}},setup:e=>({fullName:s((()=>`#icon-${e.name}`)),iconStyle:s((()=>{const t={};return e.color&&(t.color=e.color),null!=e.width&&(t.width="number"==typeof e.width?`${e.width}px`:e.width),null!=e.height&&(t.height="number"==typeof e.height?`${e.height}px`:e.height),null!=e.opacity&&(t.opacity=e.opacity),t}))})});C.render=function(e,t,o,n,r,a){return u(),i("svg",{class:"word-icon","aria-hidden":"true",style:e.iconStyle},[e.name?(u(),i("use",{key:0,"xlink:href":e.fullName},null,8,["xlink:href"])):c("",!0)],4)};var z={0:"0",1:"1",2:"2",3:"3",4:"4",5:"5",6:"6",7:"7",8:"8",9:"9",a:"a",b:"b",c:"c",d:"d",e:"e",f:"f",g:"g",h:"h",i:"i",j:"j",k:"k",l:"l",m:"m",n:"n",o:"o",p:"p",q:"q",r:"r",s:"s",t:"t",u:"u",v:"v",w:"w",x:"x",y:"y",z:"z",".":"period","!":"exclam","?":"question","-":"hyphen"},I=l({name:"WordsPanel",components:{WordIcon:C},props:{words:{type:String,required:!0},size:{type:String,default:"60"},fontColor:{type:String,required:!0},backgroundColor:{type:String,required:!0},vertical:{type:Boolean,default:!1}},setup:e=>{const t=d(null),o=s((()=>{let t=0,o=0;const n=Number(e.size),r=e.words.toLowerCase().split("\n").map((r=>{const a=r.length*n;t=Math.max(a,t),o+=Number(n);return{style:e.vertical?{width:`${n}px`,height:`${a}px`}:{width:`${a}px`,height:`${n}px`},items:r.split("").map((e=>z[e]||""))}}));t+=2*n,o+=2*n;const a=e.vertical?o:t,l=e.vertical?t:o;return{items:r,containerWidth:a,containerHeight:l,style:{width:`${a}px`,height:`${l}px`,padding:`${n}px`,color:e.fontColor,backgroundColor:e.backgroundColor}}})),n=s((()=>{if(window.innerWidth<768){const{innerWidth:e,innerHeight:t}=window,n=e,r=t-380,{containerWidth:a,containerHeight:l}=o.value;return{transform:`scale(${Math.min(n/a,r/l)})`}}return{}}));return{container:t,wrapStyle:n,groups:o,download:()=>S(t.value,(Number(e.size),e.words,e.vertical,e.fontColor,e.backgroundColor,o.value.containerWidth,o.value.containerHeight)).catch((e=>{window.alert(e.message||"图片导出出错！"),console.log(e)}))}}});function P(e){const t=function(e){const t=(e,t,o)=>Math.floor(.299*e+.587*t+.114*o),o=[];for(let n=0;n<e.width;n++)for(let r=0;r<e.height;r++){const a=4*(n+r*e.width),l=t(e.data[a+0],e.data[a+1],e.data[a+2]);o.push(l)}return o}(e);let o=0,n=Array(256).fill(0),r=t.length;for(;o<r;){n[255&t[o++]]++}let a=0;for(let d=0;d<256;d++)a+=d*n[d];let l=0,s=0,i=0,c=0,u=0;for(let d=0;d<256;d++){if(l+=n[d],0===l)continue;if(s=r-l,0===s)break;i+=d*n[d];let e=l*s*(i/l-(a-i)/s)**2;e>c&&(c=e,u=d)}return u}function E(e){return new Promise(((t,o)=>{const n=new Image;n.onload=()=>t(n),n.onerror=e=>o(e),n.src=e}))}function U(e,t){const o=document.createElement("canvas");return o.width=e,o.height=t,o}function $(e,t=!1){const{width:o,height:n,data:r}=e,a=[0,1,2],l=a.map((e=>r[e])),s=[];if(t)for(let i=0;i<n;i++){let e=0;for(let t=0;t<o;t++){const n=4*(i*o+t);e+=a.every((e=>l[e]===r[n+e]))?0:1}s.push(e)}else for(let i=0;i<o;i++){let e=0;for(let t=0;t<n;t++){const n=4*(t*o+i);e+=a.every((e=>l[e]===r[n+e]))?0:1}s.push(e)}return s}function D(e){const t=[];let o=0,n=0;return e.forEach((e=>{e?(o+=1,n&&(t.push({background:!0,value:n}),n=0)):(n+=1,o&&(t.push({foreground:!0,value:o}),o=0))})),o&&t.push({foreground:!0,value:o}),n&&t.push({background:!0,value:n}),t}function M(e){return e.reduce(((e,t)=>t.foreground?Math.max(e,t.value):e),0)}function j(e,t){const o=[];let n=[];return e.forEach((e=>{if(n.length){n.push(e);const r=n.reduce(((e,t)=>e+t.value),0);(r>=t||Math.pow(r-t,2)<4)&&(o.push({foreground:!0,value:r}),n=[])}else e.foreground&&e.value<t?n=[e]:o.push(e)})),o}function O(e){const t=[];let o=0;return e.forEach((e=>{e.foreground&&t.push({offset:o,size:e.value}),o+=e.value})),t}function L(e,t){const{naturalWidth:o,naturalHeight:n}=e,r=U(o,n).getContext("2d");r.drawImage(e,0,0);const a=function(e){const{width:t,height:o,data:n}=e,r=P(e),a=n[0]>r?[0,255]:[255,0];for(let l=0;l<t;l++)for(let e=0;e<o;e++){const o=4*(e*t+l),s=(n[o]+n[o+1]+n[o+2])/3>r?a[0]:a[1];n[o]=s,n[o+1]=s,n[o+2]=s,n[o+3]=255}return e}(r.getImageData(0,0,o,n)),l=U(o,n),s=l.getContext("2d");s.putImageData(a,0,0),t&&console.log(l.toDataURL());const i=D($(a,!0)),c=D($(a,!1)),u=Math.max(M(i),M(c)),d=O(j(i,u)),p=[];return d.forEach((e=>{O(j(D($(s.getImageData(0,e.offset,o,e.size),!1)),u)).forEach((t=>{const o=U(t.size,e.size),n=o.getContext("2d"),r=s.getImageData(t.offset,e.offset,t.size,e.size);n.putImageData(r,0,0),p.push({x:t.offset,y:e.offset,width:t.size,height:t.size,canvas:o})}))})),p}async function q(e,t){return L(e,t).map((e=>{var{canvas:t}=e,o=r(e,["canvas"]);const a=function(e){const{width:t,height:o,data:n}=e,r=P(e),a=n[0]>r?[0,1]:[1,0],l=new Uint8Array(t*o);for(let s=0;s<t;s++)for(let e=0;e<o;e++){const o=e*t+s,i=n[4*o]>r?a[0]:a[1];l.set([i],o)}return l}(function(e,t){const o=U(t,t).getContext("2d");return o.drawImage(e,0,0,e.width,e.height,0,0,t,t),o.getImageData(0,0,t,t)}(t,16));return n(n({},o),{hash:a})}))}async function W(e,t){const o=await E(t),a=await q(o,!1),l=a.map(((e,t)=>({name:"abcdefghijklmnopqrstuvwxyz0123456789.-!?"[t],value:e.hash})));const s=await E(e),i=function(e,t){return e.map((e=>{var{hash:o}=e,a=r(e,["hash"]);if(o.every((e=>e===o[0])))return" ";let l=Number.MAX_SAFE_INTEGER,s="*";return t.forEach((e=>{const t=function(e,t){let o=0;return e.forEach(((e,n)=>{o+=e^t[n]})),o}(o,e.value);t<l&&(l=t,s=e.name)})),n(n({},a),{word:s,diff:l})}))}(await q(s,!1),l);return console.log(i),function(e,t,o){const n=U(t,o),r=n.getContext("2d"),a=e[0];return r.fillStyle="#000",r.strokeStyle="#000",r.font=`${Math.floor(a.width)}px -apple-system, Arial, sans-serif`,r.textAlign="center",r.textBaseline="middle",e.forEach((e=>{r.fillText(e.word,e.x+Math.round(e.width/2),e.y+Math.round(e.height/2),e.width)})),n.toDataURL()}(i,s.naturalWidth,s.naturalHeight)}I.render=function(e,t,o,n,r,a){const l=p("WordIcon");return u(),i("section",{style:e.wrapStyle},[h("div",{class:["words-panel",{"words-panel--vertical":e.vertical}],ref:"container",style:e.groups.style},[(u(!0),i(f,null,m(e.groups.items,((t,o)=>(u(),i("div",{class:"words-panel__groups",key:o,style:t.style},[(u(!0),i(f,null,m(t.items,((t,o)=>(u(),i(l,{key:o,name:t,width:e.size,height:e.size},null,8,["name","width","height"])))),128))],4)))),128))],6)],4)};var N=l({name:"ParsePanel",props:{url:{type:String,default:""}},setup:(e,t)=>{const o=d(null),n=d(""),r=()=>t.emit("close"),a=e=>{o.value.contains(e.target)||r()};return g((()=>{document.body.addEventListener("click",a,!1),(async()=>{try{n.value=await W(e.url,"/zelda-words/assets/map.efa40bbb.png")}catch(t){console.log(t),n.value=""}})()})),w((()=>{document.body.removeEventListener("click",a,!1)})),{container:o,resultImage:n,close:r}}});const A={ref:"container",class:"parse-panel"},R={key:1,class:"parse-panel__message"};N.render=function(e,t,o,n,r,a){return u(),i("section",A,[h("span",{class:"parse-panel__close",onClick:t[1]||(t[1]=(...t)=>e.close&&e.close(...t))},"×"),e.resultImage?(u(),i("img",{key:0,class:"parse-panel__result",src:e.resultImage},null,8,["src"])):(u(),i("span",R," 图片解析中...... "))],512)};var B=l({name:"Download",props:{url:{type:String,default:""}},setup:(e,t)=>{const o=d(null),n=e=>{o.value.contains(e.target)||t.emit("close")};return g((()=>{document.body.addEventListener("click",n,!1)})),w((()=>{document.body.removeEventListener("click",n,!1)})),{container:o}}});const V={ref:"container",class:"download"};B.render=function(e,t,o,n,r,a){return u(),i("section",V,[h("img",{src:e.url},null,8,["src"])],512)};var H=l({name:"App",components:{WordsPanel:I,ParsePanel:N,Download:B},setup:()=>{const e=d("60"),t=d("#13c2fe"),o=d("#12181a"),n=d(!1),r=d("hello world"),a=d(null),l=d(!1),i=s((()=>{let t=Number(e.value);return t=t%2==0?t:t-1,t=Math.max(20,t),t=Math.min(200,t),String(t)})),c=d(!1),u=d(""),p=d(!1),h=d("");return{size:e,limitSize:i,resetSize:()=>{e.value=i.value},fontColor:t,backgroundColor:o,vertical:n,words:r,loading:l,wordsPanel:a,downloadImage:async()=>{const e=a.value||{download:()=>{}};l.value=!0;const t=await e.download();t&&(u.value=t,c.value=!0),l.value=!1},uploadImage:({target:e})=>{const[t]=e.files;h.value=URL.createObjectURL(t),p.value=!0,e.value=""},parseImageUrl:h,showParsePanel:p,showDownload:c,downloadUrl:u}}});const F={class:"container"},T={class:"header"},G={class:"header__group"},J={class:"header__item",for:"font-color-input"},X={class:"header__item",for:"background-color-input"},K={class:"header__group"},Q={class:"header__item",for:"vertical-radio"},Y=h("span",null,"Vertical：",-1),Z={class:"header__item",for:"font-size-input"},ee=h("span",null,"Size：",-1),te={class:"header__group"},oe={class:"header__item header__button",for:"image-upload"},ne=h("span",null,"Parse Image",-1),re={class:"content"},ae={class:"words"},le={class:"results"};H.render=function(e,t,o,n,r,a){const l=p("WordsPanel"),s=p("ParsePanel"),d=p("Download");return u(),i("main",F,[h("section",T,[h("div",G,[h("label",J,[v(h("input",{class:"header__color",type:"color",id:"font-color-input","onUpdate:modelValue":t[1]||(t[1]=t=>e.fontColor=t)},null,512),[[y,e.fontColor]])]),h("label",X,[v(h("input",{class:"header__color",type:"color",id:"background-color-input","onUpdate:modelValue":t[2]||(t[2]=t=>e.backgroundColor=t)},null,512),[[y,e.backgroundColor]])])]),h("div",K,[h("label",Q,[Y,v(h("input",{type:"checkbox","onUpdate:modelValue":t[3]||(t[3]=t=>e.vertical=t)},null,512),[[b,e.vertical]])]),h("label",Z,[ee,v(h("input",{type:"number",id:"font-size-input",min:"20",max:"200",step:"2","onUpdate:modelValue":t[4]||(t[4]=t=>e.size=t),onBlur:t[5]||(t[5]=(...t)=>e.resetSize&&e.resetSize(...t))},null,544),[[y,e.size]])])]),h("div",te,[h("label",oe,[ne,h("input",{class:"header__upload",type:"file",id:"image-upload",accept:"image/*",onChange:t[6]||(t[6]=(...t)=>e.uploadImage&&e.uploadImage(...t))},null,32)]),h("span",{class:"header__item header__button",onClick:t[7]||(t[7]=(...t)=>e.downloadImage&&e.downloadImage(...t))},_(e.loading?"Download...":"Download"),1)])]),h("section",re,[h("div",ae,[v(h("textarea",{placeholder:"input...","onUpdate:modelValue":t[8]||(t[8]=t=>e.words=t)},null,512),[[y,e.words]])]),h("div",le,[h(l,{ref:"wordsPanel",words:e.words,size:e.limitSize,vertical:e.vertical,fontColor:e.fontColor,backgroundColor:e.backgroundColor},null,8,["words","size","vertical","fontColor","backgroundColor"])])]),e.showParsePanel?(u(),i(s,{key:0,url:e.parseImageUrl,onClose:t[9]||(t[9]=t=>e.showParsePanel=!1)},null,8,["url"])):c("",!0),e.showDownload?(u(),i(d,{key:1,url:e.downloadUrl,onClose:t[10]||(t[10]=t=>e.showDownload=!1)},null,8,["url"])):c("",!0)])},function(e){const t="ICON_FONT_SCRIPT";if(document.querySelector(`#${t}`)||!e)return;const o=document.createElement("script");o.id=t,document.body.appendChild(o),o.src=e}("//at.alicdn.com/t/font_2375469_s4wmtifuqro.js"),k(H).mount("#app");