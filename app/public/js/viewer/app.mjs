import { installIframeEvent } from './iframeEvent.mjs';


document.addEventListener('DOMContentLoaded', () => {
  if (self !== top) {
    installIframeEvent();
  }
});
