import path from 'path';
import cors from 'cors';
import logger from 'morgan';
import express from 'express';
import session from 'express-session';
import createError from 'http-errors';
import cookieParser from 'cookie-parser';
import memoryStoreFactory from 'memorystore';

import { loadRoutes } from '#utils/expressUtils.js';
import { sessionSync } from '#middlewares/session.middleware.js';
import { setDefaultData, handleNewUser } from '#middlewares/web.middleware.js';
import errorHandler from '#middlewares/errorHander.js';

const __dirname = path.resolve();

const app = express();
const root = express.Router();
const contextPath = '/rookie';

// session setting
const MemoryStore = memoryStoreFactory(session);
const maxAge = 1000 * 60 * 60;
const sessionObj = {
  secret: process.conf.SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({ checkPeriod: maxAge }),
  cookie: {
    maxAge: maxAge,
  },
};


// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');

app.use(session(sessionObj));
app.use(cors());
app.use(logger('dev'));
app.use(express.json({ limit : "10mb" }));
app.use(express.urlencoded({ extended: false,  limit: "10mb" }));
app.use(cookieParser());
app.use(contextPath, root);

// static modules
root.use(express.static(path.join(__dirname, 'public'), {maxAge: '15m'})); // , {maxAge: '15m'} 개발 종료후 캐싱
root.use('/uploads', express.static(path.join(__dirname, 'uploads'), {maxAge: '30d'})); // , {maxAge: '30d'}
root.use('/uploadsCk', express.static(path.join(__dirname, 'uploadsCk'), {maxAge: '30d'})); // , {maxAge: '30d'}
root.use('/uploadsWs', express.static(path.join(__dirname, 'uploadsWs'), {maxAge: '30d'})); // , {maxAge: '30d'}
root.use('/entry/assets', express.static(path.join(__dirname, 'resources/assets'), {maxAge: '30d'}));
root.use('/@entrylabs', express.static(path.join(__dirname, 'node_modules', '@entrylabs'), {maxAge: '1y', immutable: true}));
root.use('/ckeditor5', express.static(path.join(__dirname, 'node_modules', 'ckeditor5', 'dist'), {maxAge: '1y', immutable: true}));

// autoload routers
const webRoutesPath = path.join(__dirname, 'src', 'routes', 'web');
const apiRoutesPath = path.join(__dirname, 'src', 'routes', 'api');
await loadRoutes(root, '/', [sessionSync, handleNewUser, setDefaultData], webRoutesPath);
await loadRoutes(root, '/api', [], apiRoutesPath);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(errorHandler);


export default app;