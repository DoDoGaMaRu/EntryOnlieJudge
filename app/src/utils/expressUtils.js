import fs from 'fs';
import path from 'path';

export async function loadRoutes(rootRouter, urlPath, middlewares, dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.promises.stat(filePath);
      const curUrlPath = path.join(urlPath, path.parse(file).name);

      if (stats.isFile()) {
        const { default: route } = await import(filePath);
        rootRouter.use(file==='index.js'? urlPath:curUrlPath, ...middlewares, route);
      }
      else if (stats.isDirectory) {
        await loadRoutes(rootRouter, curUrlPath, middlewares, filePath);
      }
    }
  } catch (err) {
    console.error('Error loading routes:', err);
  }
}