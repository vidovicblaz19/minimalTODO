import os from 'os';
import fs from 'fs';
import path from 'path';
import { VERSION, BIN_RIPGREP_PATH } from "../constants";

function getTarget() {
    const arch = process.env.npm_config_arch || os.arch();

    switch (os.platform()) {
        case 'darwin':
            return arch === 'arm64' ? 'aarch64-apple-darwin' :
                'x86_64-apple-darwin';
        case 'win32':
            return arch === 'x64' ? 'x86_64-pc-windows-msvc' :
                arch === 'arm' ? 'aarch64-pc-windows-msvc' :
                'i686-pc-windows-msvc';
        case 'linux':
            return arch === 'x64' ? 'x86_64-unknown-linux-musl' :
                arch === 'arm' ? 'arm-unknown-linux-gnueabihf' :
                arch === 'armv7l' ? 'arm-unknown-linux-gnueabihf' :
                arch === 'arm64' ? 'aarch64-unknown-linux-musl':
                arch === 'ppc64' ? 'powerpc64le-unknown-linux-gnu' :
                arch === 's390x' ? 's390x-unknown-linux-gnu' :
                    'i686-unknown-linux-musl';
        default: throw new Error('Unknown platform: ' + os.platform());
    }
}

function binaryExecName(){
    return `rg${process.platform === 'win32' ? '.exe' : ''}`;
}

function binaryDir(){
    return `ripgrep-${VERSION}-${getTarget()}`;
}

export function removeUnneededBinaries(){
    const targetBinaryDirFragment = binaryDir();
    const files = fs.readdirSync(BIN_RIPGREP_PATH);
    files.forEach(file => {
        const filePath = path.join(BIN_RIPGREP_PATH,file);
        if(file !== targetBinaryDirFragment){
            fs.rmSync(filePath, {recursive: true});
        }
    });
}

export const rgPath = path.join(BIN_RIPGREP_PATH, binaryDir(),binaryExecName());