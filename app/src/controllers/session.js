import _ from 'lodash';

export function sessionSync(req, res) {
  const { sessionKey } = req.body;
  const userInfo = {};
  let reload = false;

  // TODO 삭제
  if (sessionKey === 'dev') {
    return res.status(200).send({ reload: false });
  }


  // TODO 이미 동기화 되어있고, 정보가 바뀌지 않았다면
  // 동기화 되어있지 않았거나 정보가 바뀌었다면 page reload

  // php 서버로 세션 정보 요청
  if (sessionKey === '정보 있음') {
    userInfo.userId = '가져온 정보';
    userInfo.role = '가져온 정보 - 없다면 나중에 컨픽으로 설정';
  }
  else {
    userInfo.userId = 'guest';
    userInfo.role = 'guest';
  }

  if (!_.isEqual(req.session.user, userInfo)) {
    req.session.user = userInfo;
    reload = true;
  }

  return res.status(200).send({ reload });
}