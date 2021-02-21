import domtoimage from 'dom-to-image';
import { writeMetaInfo } from './image-meta';

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
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    ctx.putImageData(pixels, 0, 0);
    return canvas;
}
interface ExportOptions {
    size: number,
    width: number,
    height: number,
    message: string,
}

export default async function exportImage(node: HTMLBaseElement | null, options: ExportOptions): Promise<any> {
    if (!node) {
        return Promise.resolve();
    }

    const pixels: any = await domtoimage.toPixelData(node, {
        filter: (n: any) => fixSvgIconNode(n),
    });

    const mergePixels = await writeMetaInfo(pixels, options);
    const canvas = putToCanvas(new ImageData(mergePixels, options.width, options.height));
    return new Promise(resolve => {
        canvas.toBlob((blob) => {
            const objectURL = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `zelda-words-${Date.now()}.png`;
            link.href = objectURL;
            link.click();
            resolve(objectURL);
        });
    });
}
