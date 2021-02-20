import domtoimage from 'dom-to-image';
import { writeMeta } from './meta-info';

// fix 节点中 svg 图标依赖
function fixSvgIconNode(node: HTMLBaseElement): boolean {
    if (node instanceof SVGElement) {
        const useNodes = Array.from(node.querySelectorAll('use') || []);
        useNodes.forEach((use: SVGUseElement) => {
            const id = use.getAttribute('xlink:href');
            // 将 svg 图片中依赖的 <symbol> 节点塞到当前 svg 节点下
            if (id && !node.querySelector(id)) {
                const symbolNode = document.querySelector(id);
                if (symbolNode) {
                    node.insertBefore(
                        symbolNode.cloneNode(true),
                        node.children[0]
                    );
                }
            }
        });
    }
    return true;
}

function putToCanvas(pixels: ImageData) {
    const canvas = document.createElement('canvas');
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    const ctx = <CanvasRenderingContext2D> canvas.getContext('2d');
    ctx.putImageData(pixels, 0, 0);
    return canvas;
}
interface ExportOptions {
    size: number,
    vertical: boolean,
    width: number,
    height: number,
}

export default function exportImage(node: HTMLBaseElement | null, options: ExportOptions): Promise<any>{
    if (!node) {
        return Promise.resolve();
    }
    return domtoimage
        .toPixelData(node, { filter: (n: HTMLBaseElement) => fixSvgIconNode(n) })
        .then((pixels: Uint8ClampedArray) => {
            const pixs = writeMeta({
                data: pixels,
                vertical: options.vertical,
                size: Number(options.size),
                width: options.width,
                height: options.height,
            });
            return putToCanvas(new ImageData(pixs, options.width, options.height));
        })
        .then((canvas: HTMLCanvasElement) => {
            return new Promise(resolve => {
                canvas.toBlob((blob) => {
                    resolve(URL.createObjectURL(blob));
                });
            });
        })
        .then((objectURL: string) => {
            const link = document.createElement('a');
            link.download = `zelda-words-${Date.now()}.png`;
            link.href = objectURL;
            link.click();
        });
}
