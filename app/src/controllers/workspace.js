import fs from 'fs';
import path from 'path';
import {uid} from 'uid';
import Puid from 'puid';
import * as tar from 'tar';
import { Readable } from 'stream';

const puid = new Puid();
const BASE_PATH = 'TEMP';

// util function
const dirInit = (dir) => fs.mkdirSync(dir, { recursive: true });
const createName = () => uid(8) + puid.generate();

const extractTarFromBuffer = async (path, buffer) => {
    return new Promise((resolve, reject) => {
        const fileStream = new Readable();
        fileStream.push(buffer);
        fileStream.push(null);

        dirInit(path);
        console.log(path)
        fileStream.pipe(tar.extract({cwd: path}))
            .on('finish', resolve)
            .on('error', reject);
    });
}

async function entUpload(req, res) {
    const { buffer } = req.file;
    const dir = path.join(BASE_PATH, createName());
    
    await extractTarFromBuffer(dir, buffer);

    let projectStr = fs.readFileSync(path.join(dir, 'temp', 'project.json'), 'utf-8');
    projectStr = projectStr.replaceAll('./bower_components/entry-js', '/@entrylabs/entry');
    projectStr = projectStr.replaceAll('/lib/entry-js', '/@entrylabs/entry');
    const project = JSON.parse(projectStr);
    
    for (let obj of project.objects) {
        const {pictures, sounds} = obj.sprite;
        for (let pic of pictures) {
            if (pic['filename']) {
                const srcExt = pic['fileurl'].split('.').at(-1);

                const srcName = pic['filename'];
                const srcFilename = `${srcName}.${srcExt}`
                const d1 = srcName.slice(0,2);
                const d2 = srcName.slice(2,4);
                const srcPath = path.join(dir, 'temp', d1, d2);

                const newName = createName();
                const newFilename = `${newName}.${srcExt}`;                
                const nd1 = newName.slice(0,2);
                const nd2 = newName.slice(2,4);
                const destPath = path.join('uploads', nd1, nd2);

                const srcImagePath = path.join(srcPath, 'image', srcFilename);
                const srcThumbPath = path.join(srcPath, 'thumb', srcFilename);
                const destImagePath = path.join(destPath, 'image', newFilename);
                const destThumbPath = path.join(destPath, 'thumb', newFilename);

                dirInit(path.join(destPath, 'image'));
                dirInit(path.join(destPath, 'thumb'));

                fs.renameSync(srcImagePath, destImagePath);
                fs.renameSync(srcThumbPath, destThumbPath);

                pic['filename'] = newFilename;
                pic['fileurl'] = `/${destImagePath}`;
                pic['thumburl'] = `/${destThumbPath}`;
            }
        }
        for (let snd of sounds) {
            if (snd['filename']) {
                const srcName = snd['filename'];

                const srcFilename = `${srcName}.mp3`
                const d1 = srcName.slice(0,2);
                const d2 = srcName.slice(2,4);
                const srcPath = path.join(dir, 'temp', d1, d2);

                const newName = createName();
                const newFilename = `${newName}.mp3`;                
                const nd1 = newName.slice(0,2);
                const nd2 = newName.slice(2,4);
                const destPath = path.join('uploads', nd1, nd2);

                const srcSoundPath = path.join(srcPath, 'sound', srcFilename);
                const destSoundPath = path.join(destPath, 'sound', newFilename);

                dirInit(path.join(destPath, 'sound'));
                fs.renameSync(srcSoundPath, destSoundPath);
                
                snd['filename'] = newFilename;
                snd['fileurl'] = `/${destSoundPath}`;
            }
        }
    }
    
    fs.rmSync(dir, { recursive: true, force: true });
    res.send({project});
}

export { entUpload };