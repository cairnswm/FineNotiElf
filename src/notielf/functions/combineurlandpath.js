export const combineUrlAndPath = (url, path) => {
  if (!url || !path) {
    console.error("URL and path are required", url, path);
    return "";
  }

  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  if (path.startsWith("/")) {
    path = path.slice(1);
  }

  return `${url}/${path}`;
};
