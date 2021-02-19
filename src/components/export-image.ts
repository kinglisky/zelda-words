import domtoimage from 'dom-to-image';

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

export default function exportImage(node: HTMLBaseElement | null): Promise<any>{
    if (!node) {
        return Promise.resolve();
    }

    return domtoimage
        .toPng(node, {
            filter: (n) => fixSvgIconNode(n as HTMLBaseElement),
        })
        .then(function (dataUrl: string) {
            const link = document.createElement('a');
            link.download = 'sheikah-words.png';
            link.href = dataUrl;
            link.click();
        });
}
