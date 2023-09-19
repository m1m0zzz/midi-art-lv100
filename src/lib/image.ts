export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export const toImage = async (imageData: ImageData): Promise<HTMLImageElement> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx?.putImageData(imageData, 0, 0);

  const img = await loadImage(canvas.toDataURL());
  return img;
}

export const pickColor = (imageData: ImageData, x: number, y: number) => {
  if (imageData.width <= x || imageData.height <= y) {
    throw RangeError();
  }
  return [
    imageData.data[(y * imageData.width + x) * 4],
    imageData.data[(y * imageData.width + x) * 4 + 1],
    imageData.data[(y * imageData.width + x) * 4 + 2],
    imageData.data[(y * imageData.width + x) * 4 + 3],
  ]
}

export const grayScaleImageData = (ctx: CanvasRenderingContext2D, imageData: ImageData) => {
  const newData = ctx.createImageData(imageData.width, imageData.height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    let y = 0.2126 * imageData.data[i] +
            0.7152 * imageData.data[i + 1] +
            0.0722 * imageData.data[i + 2];
    y = parseInt(String(y), 10);
    newData.data[i] = y;
    newData.data[i + 1] = y;
    newData.data[i + 2] = y;
    newData.data[i + 3] = imageData.data[i + 3];
  }

  return newData;
}