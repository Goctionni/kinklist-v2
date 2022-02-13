import { InKinkCategory, ExKinkCategory, InKink } from "@/types/kinks";
import { Rating } from "@/types/ratings";
import { generateId } from './idGenerator';

interface DataFromImgur {
  username: string;
  ratings: Rating[];
  categories: ExKinkCategory[];
}

interface ParsedDataFromImgur extends DataFromImgur {
  categories: InKinkCategory[];
}

export const importDataFromImgur = async (id: string): Promise<ParsedDataFromImgur> => {
  const response = await fetch(`https://i.imgur.com/${id}.png`);
  const imageBlob = await response.blob();
  const imageElement = await blobToImage(imageBlob);
  const { canvas, context } = imageToCanvas(imageElement);

  // Read data from image
  const imageJson = tryReadImageData(canvas, context);
  const { categories, ratings, username } = JSON.parse(imageJson) as DataFromImgur;
  const inCategories: InKinkCategory[] = categories.map((exCat): InKinkCategory => {
    const inCat: InKinkCategory = {
      ...exCat,
      id: generateId(),
      kinks: exCat.kinks.map((exKink): InKink => {
        return {
          ...exKink,
          id: generateId(),
        }
      }),
    };
    return inCat;
  });
  return { username, ratings, categories: inCategories }
}

const blobToImage = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onerror = () => reject();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.src = url;
  });
}

const imageToCanvas = (image: HTMLImageElement): { canvas: HTMLCanvasElement, context: CanvasRenderingContext2D } => {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.drawImage(image, 0, 0, image.naturalWidth, canvas.height);
  return { canvas, context };
}

const  tryReadImageData = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): string => {
  let json = "";
  for (let y = canvas.height - 1; y >= 0; y--) {
    for (let x = 0; x < canvas.width; x++) {
      const pixelData = context.getImageData(x, y, 1, 1).data;
      if (
        pixelData[0] === 255 &&
        pixelData[1] === 255 &&
        pixelData[2] === 255
      ) {
        return json;
      }
      const r = 254 - pixelData[0];
      const g = 254 - pixelData[1];
      const b = 254 - pixelData[2];
      const byteValue = r + (g << 3) + (b << 6);
      const char = String.fromCharCode(byteValue);
      json += char;
    }
  }
  return "";
}