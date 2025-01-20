import path from 'path';
import ThumbCreator from "#utils/thumbCreator.js";


const thumbCreator96 = new ThumbCreator(96, (file) => {
  const firstDir = file.name.slice(0,2);
  const secondDir = file.name.slice(2,4);
  return path.join('uploads', firstDir, secondDir, 'thumb');
});

const thumbCreator48 = new ThumbCreator(48, (file) => {
  const firstDir = file.name.slice(0,2);
  const secondDir = file.name.slice(2,4);
  return path.join('uploads', firstDir, secondDir, 'thumb');
});

export function thumbMiddleware96(req, res, next) {
  thumbCreator96.create(req, res, next);
}

export function thumbMiddleware48(req, res, next) {
  thumbCreator48.create(req, res, next);
}


const thumbCreator96Ws = new ThumbCreator(96, (file) => {
  const firstDir = file.name.slice(0,2);
  const secondDir = file.name.slice(2,4);
  return path.join('uploadsWs', firstDir, secondDir, 'thumb');
});

export function thumbMiddleware96Ws(req, res, next) {
  thumbCreator96Ws.create(req, res, next);
}