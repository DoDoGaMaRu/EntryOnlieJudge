import { readFileSync } from 'fs';

// TODO config 검증 여기서 하기
const config = JSON.parse(readFileSync('config.json', 'utf8'));
process.conf = config;