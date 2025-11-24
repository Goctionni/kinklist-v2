export const downloadImage = (canvas: HTMLCanvasElement): void => {
    const url = canvas.toDataURL();
    const linkEl = document.createElement('a');
    linkEl.setAttribute('href', url);
    linkEl.setAttribute('download', 'kinklist.png');
    document.body.appendChild(linkEl);
    linkEl.click();
    requestAnimationFrame(() => {
        document.body.removeChild(linkEl);
    })
}