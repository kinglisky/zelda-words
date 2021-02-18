export default function registScript(url: string): void {
    const scriptName = 'ICON_FONT_SCRIPT';
    if (document.querySelector(`#${scriptName}`) || !url) return;
    const scriptElement: HTMLScriptElement = document.createElement('script');
    scriptElement.id = scriptName;
    document.body.appendChild(scriptElement);
    scriptElement.src = url;
}
