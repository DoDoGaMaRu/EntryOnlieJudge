import createError from 'http-errors';
import cors from 'cors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fs from 'fs';
import AssetMetaLoader from './lib/AssetMetaLoader.js'


const __dirname = path.resolve();

const app = express();
const aml = new AssetMetaLoader();

aml.caching('picture_category');
aml.caching('picture');
aml.caching('sound_category');
aml.caching('sound');
aml.caching('sprite_category');
aml.caching('sprite');
aml.caching('table');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static modules
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/entry/assets', express.static(path.join(__dirname, 'resources/assets')));
app.use('/@entrylabs', express.static(path.join(__dirname, 'node_modules', '@entrylabs')));
app.use('/ckeditor5', express.static(path.join(__dirname, 'node_modules', 'ckeditor5', 'dist')));
app.use('/@ckeditor', express.static(path.join(__dirname, 'node_modules', '@ckeditor')));

// TODO load all routes 개발 중에만 사용하고, 나중에는 하드 코딩
const routesPath = path.join(__dirname, 'src', 'routes');
async function loadRoutes(urlPath, dirPath) {
  try {
    const files = await fs.promises.readdir(dirPath);
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.promises.stat(filePath);
      const curUrlPath = path.join(urlPath, path.parse(file).name);

      if (stats.isFile()) {
        const { default: route } = await import(filePath);
        app.use(file==='index.js' ? urlPath:curUrlPath, route);
      }
      else if (stats.isDirectory) {
        await loadRoutes(curUrlPath, filePath);
      }
    }
  } catch (err) {
    console.error('Error loading routes:', err);
  }
}
await loadRoutes('/', routesPath);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('pages/error', {message: err.message});
});


export default app;