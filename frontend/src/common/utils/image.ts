/**
 * Calculate the aspect ratio of an image file
 * @param file - The image file to analyze
 * @returns Promise that resolves to the aspect ratio (width/height), defaults to 1 on error
 */
export async function getImageAspectRatio(file: File): Promise<number> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.src = objectUrl;

      img.onload = () => {
        try {
          if (img.width > 0 && img.height > 0) {
            resolve(img.width / img.height);
          } else {
            resolve(1);
          }
        } catch (error) {
          console.warn('Failed to calculate aspect ratio:', error);
          resolve(1);
        } finally {
          URL.revokeObjectURL(objectUrl);
        }
      };

      img.onerror = () => {
        console.warn('Failed to load image for aspect ratio calculation');
        resolve(1);
        URL.revokeObjectURL(objectUrl);
      };
    } catch (error) {
      console.warn('Failed to create image for aspect ratio calculation:', error);
      resolve(1);
    }
  });
}
