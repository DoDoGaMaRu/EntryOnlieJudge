export const ERROR = {
  403: {view: 'pagesError/forbidden'},
  404: {view: 'pagesError/notFound'},
}

export default function errorHandler(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  
  const { view, prop } = ERROR[err.status] ?? {
    view: 'pagesError/error',
    prop: {message: err.message}
  }

  res.status(err.status || 500);
  res.render(view, prop);
} 