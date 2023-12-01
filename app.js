"use strict";
class CotLSaveFile {
    /**
     * First part of the file. Example: `slot_0`
     */
    fileName;
    fileBin;
    encryptionKey;
    iv;
    constructor(file, fileBin) {
        this.fileName = file.name.split('.').at(0);
        this.fileBin = fileBin;
        if (this.isCrypted()) {
            this.encryptionKey = fileBin.subarray(1, 17);
            this.iv = fileBin.subarray(17, 33);
        }
        else {
            if (file.name.split('.').at(-4) !== 'decrypted') {
                throw new Error('Unexpected decrypted file name');
            }
            this.encryptionKey = CryptoHelper.hexStringToBin(file.name.split('.').at(-3));
            this.iv = CryptoHelper.hexStringToBin(file.name.split('.').at(-2));
        }
    }
    static async create(file) {
        const fileBin = await FileHelper.fileToBin(file);
        return new CotLSaveFile(file, fileBin);
    }
    isCrypted() {
        return this.fileBin[0] === 'E'.charCodeAt(0);
    }
    getNewName() {
        if (this.isCrypted()) {
            return `${this.fileName}.decrypted.${CryptoHelper.binToHexString(this.encryptionKey)}.${CryptoHelper.binToHexString(this.iv)}.json`;
        }
        else {
            return `${this.fileName}.json`;
        }
    }
    async getNewContent() {
        if (this.isCrypted()) {
            return CryptoHelper.decrypt(this.fileBin.subarray(33), this.encryptionKey, this.iv);
        }
        else {
            return CryptoHelper.encrypt(this.fileBin, this.encryptionKey, this.iv);
        }
    }
}
class CryptoHelper {
    /**
     * Decrypts data using AES-CBC encryption.
     * @param data - The data to be decrypted.
     * @param encryptionKey - The encryption key.
     * @param iv - The initialization vector.
     */
    static async decrypt(data, encryptionKey, iv) {
        // Import the encryption key
        const key = await crypto.subtle.importKey('raw', encryptionKey, { name: 'AES-CBC', length: 128 }, false, ['decrypt']);
        // Decrypt the buffer
        const decryptedData = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, data);
        return new Uint8Array(decryptedData);
    }
    /**
     * Encrypts data using AES-CBC encryption.
     * @param data - The data to be encrypted.
     * @param encryptionKey - The encryption key.
     * @param iv - The initialization vector.
     */
    static async encrypt(data, encryptionKey, iv) {
        // Import the encryption key
        const key = await crypto.subtle.importKey('raw', encryptionKey, { name: 'AES-CBC', length: 128 }, false, ['encrypt']);
        // Encrypt the buffer
        const encryptedData = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, data);
        // Create a buffer that consists of an 'E', followed by the encryption key, followed by the IV, followed by the encrypted data.
        const outputBuffer = new Uint8Array(1 + 16 + 16 + encryptedData.byteLength);
        outputBuffer[0] = 'E'.charCodeAt(0);
        outputBuffer.set(encryptionKey, 1);
        outputBuffer.set(iv, 17);
        outputBuffer.set(new Uint8Array(encryptedData), 33);
        return outputBuffer;
    }
    /**
     * Converts a Uint8Array buffer to a hexadecimal string.
     */
    static binToHexString(buffer) {
        return Array.from(buffer)
            .map((byte) => byte.toString(16).padStart(2, '0'))
            .join('');
    }
    /**
     * Converts a hexadecimal string to a Uint8Array buffer.
     */
    static hexStringToBin(hexString) {
        if (hexString.length % 2 !== 0) {
            throw new Error('Invalid hex string.');
        }
        const byteArray = Array.from({ length: hexString.length / 2 }, (_, idx) => parseInt(hexString.substr(idx * 2, 2), 16));
        return new Uint8Array(byteArray);
    }
}
class FileHelper {
    static async fileToBin(file) {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = (event) => {
                resolve(new Uint8Array(event.target?.result)); // TODO
            };
            fileReader.onerror = (event) => {
                reject(event.target?.error);
            };
            fileReader.readAsArrayBuffer(file);
        });
    }
    /**
     * Triggers a file download in the browser.
     */
    static async triggerFileDownload(content, fileName) {
        const url = URL.createObjectURL(new Blob([content]));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url); // Free up the used memory
    }
}
/**
 * Processes an array of uploaded files.
 */
function processUploadedFiles(files) {
    for (const file of files) {
        processUploadedFile(file);
    }
}
/**
 * Processes an individual uploaded file.
 */
async function processUploadedFile(file) {
    try {
        const cotLSaveFile = await CotLSaveFile.create(file);
        await FileHelper.triggerFileDownload(await cotLSaveFile.getNewContent(), cotLSaveFile.getNewName());
    }
    catch (error) {
        console.error(error);
        alert(error.message);
    }
}
