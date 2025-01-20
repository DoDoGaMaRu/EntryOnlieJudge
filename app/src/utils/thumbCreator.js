import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dirInit = (dir) => fs.mkdirSync(dir, { recursive: true });

export default class ThumbCreator{
    constructor(width, storage) {
        this.width = width;
        this.storage = storage;

        this.create = this.create.bind(this)
        this.createThumb = this.createThumb.bind(this)
    }
    
    create(_req, res, next) {
        const savePromises = []
        if (typeof _req.file !== 'undefined') {
            savePromises.push(this.createThumb(_req.file));
        }
        else if (typeof _req.files !== 'undefined') {
            for (let file of _req.files) {
                savePromises.push(this.createThumb(file));
            }
        }
        Promise.all(savePromises).then(() => {next()});
    }

    createThumb(file) {
        const originalname = file.originalname;
        const filepath = file.path;
        const ext = path.extname(originalname).toLowerCase();
        const dir = (typeof this.storage === 'function') 
            ? this.storage(file) 
            : this.storage;
        dirInit(dir);

        // TODO .svg에만 테스트하였음. 다른 확장은 괜찮은지 확인해야함
        const isVector = ['.svg'].includes(ext);

        const outExt = isVector? '.png':ext;
        const outfilename = path.basename(file.name, ext) + outExt;
        const outPath = path.join(dir, outfilename);

        file.thumbPath = outPath;
        const thumb = isVector? sharp(filepath).toFormat('png'):sharp(filepath);
        return thumb.resize(this.width).toFile(outPath);
    }
}
