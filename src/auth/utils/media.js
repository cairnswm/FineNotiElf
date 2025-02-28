// Media type validation
export const videoMimeTypes = [
  'video/mp4',
  'video/webm',
  'video/ogg'
];

export const imageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const validateExtension = (file, allowedTypes) => {
  return allowedTypes.includes(file.type);
};
