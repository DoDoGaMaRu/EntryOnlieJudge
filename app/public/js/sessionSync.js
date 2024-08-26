import { postResponsiveMessage } from "./util.js";



$(window).ready(async () => {
  // 부모 요소에게 세션 키 받기 (postResponsiveMessage)
  // express 세션에 php 세션 동기화 요청

  // const res = await postResponsiveMessage(window.parent, 'getSessionKey', {}, '*');
  // const { parentSessionKey } = res;

  const parentSessionKey = 'dev';

  $.ajax({
    url: '/api/session/sync',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({sessionKey: parentSessionKey}),
    success: (res) => {
      const { reload } = res;
      if (reload) {
        window.location.reload(true);
      }
    },
    error: (xhs, status, err) => { }
  })
});