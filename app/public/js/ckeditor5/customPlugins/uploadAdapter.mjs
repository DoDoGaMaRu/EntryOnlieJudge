class UploadAdapter {
  constructor (loader) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then( file => new Promise(((resolve, reject) => {
      this._initRequest();
      this._initListeners( resolve, reject, file );
      this._sendRequest( file );
    })))
  }
  
  _initRequest() {
    const xhr = this.xhr = new XMLHttpRequest();
    const API_BASE_URL = '/rookie';
    xhr.open('POST', `${API_BASE_URL}/api/ckeditor/upload`, true);
    xhr.responseType = 'json';
  }

  _initListeners(resolve, reject, file) {
      const xhr = this.xhr;
      const loader = this.loader;
      const genericErrorText = '파일을 업로드 할 수 없습니다.'

      xhr.addEventListener('error', () => {reject(genericErrorText)})
      xhr.addEventListener('abort', () => reject())
      xhr.addEventListener('load', () => {
          const response = xhr.response
          if(!response || response.error) {
              return reject( response && response.error ? response.error.message : genericErrorText );
          }
          resolve({
              default: response.url
          })
      })
  }

  _sendRequest(file) {
      const data = new FormData()
      data.append('upload', file)
      this.xhr.send(data)
  }
}

export default function uploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new UploadAdapter(loader)
  }
}
