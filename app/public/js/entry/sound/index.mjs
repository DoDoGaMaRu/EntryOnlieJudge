import { closeModalProgress, openModalProgress } from '../modalProgress/index.mjs';
import { fetchUploadWithBaseUrl } from '../util/index.mjs';

let isSavingSoundBuffer;

function setSound({sound, file, isSelect, callback}) {
  Object.assign(sound, {
    id: file.id,
    name: file.name,
    objectId: file.objectId,
  });
  let fileload;
  let setSound = function () {
    callback();
    let _sound = Entry.playground.setSound(sound);
    Entry.soundQueue.off("fileload", fileload);

    isSelect && Entry.playground.selectSound(_sound);
    closeModalProgress();

    _sound.objectId = file.objectId;
    Entry.dispatchEvent("saveCompleteSound", _sound)
  }
  fileload = Entry.soundQueue.on("fileload", setSound);
  Entry.soundQueue.loadFile({
    id: sound.id,
    src: sound.path,
    type: createjs.LoadQueue.SOUND
  });
}

async function saveSoundBuffer(wav, file, isSelect, callback) {
  if (isSavingSoundBuffer) {
      EntryModal.alert('이미 저장 중 입니다.');
      return;
  }
  openModalProgress('저장 중이에요.');
  isSavingSoundBuffer = true;

  try {
    const wavBlob = new Blob([wav], { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', wavBlob, 'modified.wav'); // WAV 파일 추가

    const url = Entry.volatileUpload? `/api/entry/ws/sound/modify` : `/api/entry/sound/modify`;
    const sound = await fetchUploadWithBaseUrl(url, {
        method: 'POST',
        body: formData
    });
    setSound({ sound, file, isSelect, callback });
  } catch (e) {
    console.error('편집한 소리의 저장에 실패했습니다:', e);
  } finally {
    isSavingSoundBuffer = false;
  }
}

export { saveSoundBuffer };