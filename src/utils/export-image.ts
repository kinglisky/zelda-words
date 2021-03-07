import domtoimage from 'dom-to-image';

const IS_MOBILE = /Android|iPhone|webOS|BlackBerry|SymbianOS|Windows Phone|iPad|iPod/i.test(window.navigator.userAgent);

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
interface ExportOptions {
    size: number,
    width: number,
    height: number,
    message: string,
    vertical: boolean,
    fontColor: string,
    backgroundColor: string,
}

export default async function exportImage(node: HTMLBaseElement | null, options: ExportOptions): Promise<any> {
    if (!node) {
        return Promise.resolve('');
    }

    const dataUrl = await domtoimage.toJpeg(node, {
        filter: (n: any) => fixSvgIconNode(n),
        quality: 1
    });

    if (!IS_MOBILE) {
        const link = document.createElement('a');
        link.download = `zelda-words-${Date.now()}.jpeg`;
        link.href = dataUrl;
        link.click();
        return '';
    }
    return dataUrl;
}
