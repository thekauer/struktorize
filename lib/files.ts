export const path = (...segments: string[]) => {
  return ['', ...segments].join('/').replace(/\/+/g, '/');
};

export const name = (path: string) => {
  return path.split('/').pop() || '';
};

export const relative = (path: string, base: string) => {
  return path.replace(base, '');
};

export const parent = (path: string) => {
  return path.split('/').slice(0, -1).join('/');
};
