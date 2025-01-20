import fs from 'fs';
import path from 'path';
import {uid} from 'uid';
import Puid from 'puid';
import * as tar from 'tar';
import { Readable } from 'stream';


const puid = new Puid();
const TEMP_PATH = 'TEMP';

const dirInit = (dir) => fs.mkdirSync(dir, { recursive: true });
const createName = () => uid(8) + puid.generate();
const extractTarFromBuffer = async (path, buffer) => {
  return new Promise((resolve, reject) => {
    const fileStream = new Readable();
    fileStream.push(buffer);
    fileStream.push(null);

    dirInit(path);
    fileStream.pipe(tar.extract({cwd: path}))
      .on('finish', resolve)
      .on('error', reject);
  });
}

async function loadEntFromBuffer(buffer, basePath) {
  const dir = path.join(TEMP_PATH, createName());
  
  await extractTarFromBuffer(dir, buffer);

  let projectStr = fs.readFileSync(path.join(dir, 'temp', 'project.json'), 'utf-8');
  projectStr = projectStr.replaceAll('./bower_components/entry-js', '/rookie/@entrylabs/entry');
  projectStr = projectStr.replaceAll('./bower_components/entryjs', '/rookie/@entrylabs/entry');
  projectStr = projectStr.replaceAll('/lib/entry-js', '/rookie/@entrylabs/entry');
  const project = JSON.parse(projectStr);
  const existFile = {};
  
  for (let obj of project.objects) {
    const {pictures, sounds} = obj.sprite;
    for (let pic of pictures) {
      if (pic['filename']) {
        const srcExt = pic['fileurl'].split('.').at(-1);
        const srcName = pic['filename'];

        if (existFile.hasOwnProperty(srcName)) {
          Object.assign(pic, existFile[srcName]);
        }
        else {
          const d1 = srcName.slice(0,2);
          const d2 = srcName.slice(2,4);
          const srcPath = path.join(dir, 'temp', d1, d2);
  
          const newName = createName();
          const nd1 = newName.slice(0,2);
          const nd2 = newName.slice(2,4);
          const destPath = path.join(basePath, nd1, nd2);
  
          const srcImagePath = path.join(srcPath, 'image', `${srcName}.${srcExt}`); 
          const srcThumbPath = path.join(srcPath, 'thumb', `${srcName}.${srcExt==='svg'? 'png': srcExt}`);
          const destImagePath = path.join(destPath, 'image', `${newName}.${srcExt}`);
          const destThumbPath = path.join(destPath, 'thumb', `${newName}.${srcExt==='svg'? 'png': srcExt}`);
  
          dirInit(path.join(destPath, 'image'));
          dirInit(path.join(destPath, 'thumb'));
  
          if (fs.existsSync(srcImagePath) && fs.existsSync(srcThumbPath)) {
            fs.renameSync(srcImagePath, destImagePath);
            fs.renameSync(srcThumbPath, destThumbPath);
          }
  
          pic['filename'] = `${newName}.${srcExt}`;
          pic['fileurl'] = `/rookie/${destImagePath}`;
          pic['thumburl'] = `/rookie/${destThumbPath}`;

          existFile[srcName] = {
            filename: `${newName}.${srcExt}`,
            fileurl: `/rookie/${destImagePath}`,
            thumburl: `/rookie/${destThumbPath}`,
          };
        }
      }
    }
    for (let snd of sounds) {
      if (snd['filename']) {
        const srcName = snd['filename'];

        if (existFile.hasOwnProperty(srcName)) {
          Object.assign(snd, existFile[srcName]);
        }
        else {
          const srcFilename = `${srcName}.mp3`;
          const d1 = srcName.slice(0,2);
          const d2 = srcName.slice(2,4);
          const srcPath = path.join(dir, 'temp', d1, d2);
  
          const newName = createName();
          const newFilename = `${newName}.mp3`;                
          const nd1 = newName.slice(0,2);
          const nd2 = newName.slice(2,4);
          const destPath = path.join(basePath, nd1, nd2);
  
          const srcSoundPath = path.join(srcPath, 'sound', srcFilename);
          const destSoundPath = path.join(destPath, 'sound', newFilename);
  
          dirInit(path.join(destPath, 'sound'));
          if (fs.existsSync(srcSoundPath)) {
            fs.renameSync(srcSoundPath, destSoundPath);
          }
          
          snd['filename'] = newFilename;
          snd['fileurl'] = `/rookie/${destSoundPath}`;

          existFile[srcName] = {
            filename: newFilename,
            fileurl: `/rookie/${destSoundPath}`,
          };
        }
      }
    }
  }
  fs.rmSync(dir, { recursive: true, force: true });

  return project;
}

export async function entUnpack(_req, res) {
  try {
    const { buffer } = _req.files[0];

    const project = await loadEntFromBuffer(buffer, 'uploads');
    res.send({ project });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}

export async function entUnpackWs(_req, res) {
  try {
    const { buffer } = _req.files[0];

    const project = await loadEntFromBuffer(buffer, 'uploadsWs');
    res.send({ project });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
}