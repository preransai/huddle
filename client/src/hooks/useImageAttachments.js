import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const MAX_IMAGES = 4;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Checked here for quick feedback; the server enforces the same limits.
export function validateImage(file) {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name} is not a JPG, PNG, WebP or GIF image`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name} is larger than 5 MB`;
  return null;
}

export function useImageAttachments() {
  const [images, setImages] = useState([]);
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  // Object URLs keep the file in memory until revoked.
  useEffect(() => () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview)), []);

  const add = useCallback((fileList) => {
    const files = Array.from(fileList);
    const room = MAX_IMAGES - imagesRef.current.length;
    if (files.length > room) {
      toast.error(`You can attach up to ${MAX_IMAGES} images`);
    }

    const accepted = [];
    for (const file of files.slice(0, Math.max(room, 0))) {
      const problem = validateImage(file);
      if (problem) toast.error(problem);
      else accepted.push({ file, preview: URL.createObjectURL(file) });
    }
    if (accepted.length) setImages((current) => [...current, ...accepted]);
  }, []);

  const remove = useCallback((index) => {
    setImages((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, i) => i !== index);
    });
  }, []);

  const clear = useCallback(() => {
    setImages((current) => {
      current.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
  }, []);

  return { images, add, remove, clear, isFull: images.length >= MAX_IMAGES };
}
