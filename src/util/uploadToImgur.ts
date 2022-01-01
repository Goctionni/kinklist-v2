const IMGUR_CLIENT_ID = '9db53e5936cd02f';
export const uploadImageToImgur = async (canvas: HTMLCanvasElement): Promise<string> => {
    const formdata = new FormData();
    formdata.append('image', canvas.toDataURL().split(',')[1]);
    formdata.append('type', 'base64');
    const response = await fetch(`https://api.imgur.com/3/image`, {
        method: 'POST',
        headers: {
            Authorization: 'Client-ID ' + IMGUR_CLIENT_ID,
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