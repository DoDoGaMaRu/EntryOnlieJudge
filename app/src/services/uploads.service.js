import path from 'path';
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import util from 'util';

import wRepo from '#repositories/workspace.repository.js';

const execPromise = util.promisify(exec);

class UploadsService {
  /**
   * 업로드 된지 1일 이상 지난 데이터 중, 참조되지 않는 데이터를 삭제합니다.
   */
  async deleteDereferenced() {
    // 1. reference 리스트 뽑기. uploadsWs 폴더 내의 파일 중 파일이름이 references에 추가되지 않는 파일은 삭제됩니다.
    const references = [];
    const pushReference = (filename) => {
      const basename = getBasename(filename);
      if (basename) {references.push(basename)}
    }

    const workspaces = await wRepo.find({}, {projectJson: 1, thumbnail: 1});

    const sprites = [];
    const pushSprites = (pJson) => {
      sprites.push(...pJson.get('objects').map(e=>e.sprite));
    }
    workspaces.forEach((e)=>{pushSprites(e.projectJson);});

    for (const sprite of sprites) {
      const { pictures, sounds } = sprite;
      pictures.forEach(e=>{pushReference(e.fileurl)});
      sounds.forEach(e=>{pushReference(e.fileurl)});
    }
    workspaces.forEach(({ thumbnail }) => {
      pushReference(thumbnail);
    });

    // 2. 생성된지 1일이 지난 uploadsWs폴더의 모든 파일을 targetFiles = {이름: [파일경로]}로 가져오기
    const allFiles = await getAllFilesOlderThanOneDay('./uploadsWs');
    const targetFiles = {};
    for (const filePath of allFiles) {
      const basename = getBasename(filePath);
      (targetFiles[basename] ||= []).push(filePath)
    }

    // 3. references 리스트에 이름이 있는 경우, targetFiles 에서 삭제
    for (const ref of references) {
      if (targetFiles.hasOwnProperty(ref)) {
        delete targetFiles[ref];
      }
    }

    // 4. 남아있는 targetFiles 를 모두 파일시스템에서 제거 
    const deleted = []
    for (const derefers of Object.values(targetFiles)) {
      for (const filePath of derefers) {
        try {
          await fs.unlink(filePath);
          deleted.push(filePath);
        } catch (err) {
          deleted.push(`Error deleting file: ${err}`);
        }
      }
    }
    await deleteEmptyDir('./uploadsWs');

    return deleted;
  }

  /**
   * uploadsWs폴더의 크기를 조회합니다
   * @returns {string} uploadsWs폴더의 사이즈 
   */
  async getSize() {
    const uploadsSize = await getDirSize('./uploadsWs');
    return uploadsSize;
  }
}


async function getDirSize(directory) {
  const { stdout } = await execPromise(`du -sh "${directory}"`);
  const size = stdout.split(/\s+/)[0];
  return size;
}

async function getAllFilesOlderThanOneDay(directory) {
  const { stdout } = await execPromise(`find ${directory} -type f -ctime +0`); // -ctime +0
  const files = stdout.split('\n').filter(file => file);
  return files;
}

async function deleteEmptyDir(directory) {
  await execPromise(`find ${directory} -type d -empty -delete`)
}

function getBasename(filepath) {
  if (filepath) {
    return path.basename(filepath, path.extname(filepath));
  }
}


export default new UploadsService();