export const uploadImageToImgur = async (canvas: HTMLCanvasElement, clientId: string): Promise<string> => {
    const formdata = new FormData();
    formdata.append('image', canvas.toDataURL().split(',')[1]);
    formdata.append('type', 'base64');
    const response = await fetch(`https://api.imgur.com/3/image`, {
        method: 'POST',
        headers: {
            Authorization: 'Client-ID ' + clientId,
        },
        body: formdata
    });
    const json = await response.json();
    if (!response.ok) {
        if (json.data.error) throw json.data.error;
        console.error({ response, json });
        throw new Error('Imgur response: Not OK');
    }
    return json.data.id;
}