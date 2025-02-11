import fs from 'fs';
import path from 'path';

export function makePath (cwd, paths: string[], fileName: string | undefined) {
    return path.join(cwd, ...paths, fileName || '');
}

export function makeDir (filePath: string) {
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function checkDirectoryEmpty (dirPath, autoCreate = false) {
    try {
        if (autoCreate && !fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const files = fs.readdirSync(dirPath);
        if (files.length === 0) {
            console.log(`${dirPath} is empty`);
        } else {
            console.log(`${dirPath} contains files:`, files);
        }
        return true;
    } catch (err) {
        console.error(`Error reading ${dirPath}:`, err);
        return false;
    }
}

export function checkInitialVersion (dirPath) {
    const files = fs.readdirSync(dirPath);
    if (files.length === 0) {
        return true;
    }
    // console.log(`${dirPath} contains files:`, files);

    return false;
}
