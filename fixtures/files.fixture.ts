import fs from 'fs';
import path from 'path';
import { test as base } from '@playwright/test';


type FilesFixture = {
    invalidFile: string[];
    validFile: string[];
    largeFile: string[];
};


const filesImagePath = path.join(process.cwd(), 'datas/images');

if (!fs.existsSync(filesImagePath)) {
    throw new Error('Image directory not found');
}

const imageInvalidPath = path.join(filesImagePath, 'invalid');
if (!fs.existsSync(imageInvalidPath)) {
    throw new Error('Invalid image directory not found');
}

const imageValidPath = path.join(filesImagePath, 'valid');
if (!fs.existsSync(imageValidPath)) {
    throw new Error('Valid image directory not found');
}

const imageLargePath = path.join(filesImagePath, 'large');
if (!fs.existsSync(imageLargePath)) {
    throw new Error('Large image directory not found');
}


const allowedExtensions = [
    '.tif','.xbm','.jfif','.pjp','.apng','.heif','.ico',
    '.tiff','.webp','.svgz','.heic','.svg','.gif','.bmp',
    '.pjpeg','.avif','.png','.jpg','.jpeg', '.ai', '.psd',
    '.xcf', '.psp', '.pct', '.drw', '.jpe'
];

const allowedSize = 20 * 1024 * 1024; // 20MB



export const test = base.extend<FilesFixture>({
    invalidFile: async ({}, use) => {
        const invalidFiles = fs.readdirSync(imageInvalidPath)
            .filter((file) => !allowedExtensions.some((ext) => file.endsWith(ext)));

        if (invalidFiles.length === 0) {
            throw new Error('No invalid files found in the directory');
        }

        const fullPathInvalidFiles = invalidFiles.map(file => path.join(imageInvalidPath, file));
        await use(fullPathInvalidFiles);
    },
    validFile: async ({}, use) => {
        const validFiles = fs.readdirSync(imageValidPath)
            .filter((file) => allowedExtensions.some((ext) => file.endsWith(ext)));
        
        if (validFiles.length === 0) {
            throw new Error('No valid files found in the directory');
        }

        const fullPathValidFiles = validFiles.map(file => path.join(imageValidPath, file)); 
        await use(fullPathValidFiles);
    },
    largeFile: async ({}, use) => {
        const largeFiles = fs.readdirSync(imageLargePath)
            .filter((file) => {
                const filePath = path.join(imageLargePath, file);
                const stats = fs.statSync(filePath);
                return stats.size > allowedSize;
            });

        if (largeFiles.length === 0) {
            throw new Error('No large files found in the directory');
        }
        const fullPathLargeFiles = largeFiles.map(file => path.join(imageLargePath, file));
        await use(fullPathLargeFiles);
    }

    
});

export const expect = test.expect;
