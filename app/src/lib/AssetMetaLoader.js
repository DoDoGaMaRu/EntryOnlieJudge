import fs from 'fs';
import path from 'path';

const __dirname = path.resolve();

export default class AssetMetaLoader {
    constructor() {
        if (AssetMetaLoader.instance) {
            return AssetMetaLoader.instance;
        }
        AssetMetaLoader.instance = this;
        this.assetMetaDir = path.join(__dirname, 'resources/assets_meta');
        this.data = {};
    }

    caching(name) {
        if (name in this.data) {
            throw new Error('Data already loaded');
        }
        const jsonPath = path.join(this.assetMetaDir, `${name}.json`);
        const data = fs.readFileSync(jsonPath);
        this.data[name] = JSON.parse(data);
    }

    get(name) {
        if (name in this.data) {
            return this.data[name];
        }
        else {
            throw new Error('Data not loaded');
        }
        
    }
}