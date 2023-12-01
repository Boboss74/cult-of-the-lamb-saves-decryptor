# Cult of the Lamb save files Encryptor/Decryptor

This project serves as an encryptor/decryptor for the save files of [Cult of the Lamb](https://massivemonster.co/games/cult-of-the-lamb).
Access the tool [here](https://boboss74.github.io/cult-of-the-lamb-saves-decryptor).

## Important Note
Before using this web app, make sure to create a backup of your save files. On Windows, these files are located under `%UserProfile%\AppData\LocalLow\Massive Monster\Cult Of The Lamb\saves`.

The save files consist of the following:

- `slot_<number>.json`
- `meta_<number>.json`

`<number>` corresponds to the save slot, with the first slot labeled as 0, and subsequent slots incrementing accordingly.

## Usage Instructions
1. **Upload Files:** Begin by uploading the files you wish to encrypt or decrypt.
2. **Decryption Process:** The tool will generate decrypted files for you to work with. It is essential not to rename these decrypted files.
3. **Edit Decrypted Files:** Once you have finished editing your decrypted files, you can proceed to reencrypt them.
4. **Reencryption:** Simply upload the edited files on the provided page to reencrypt them.
5. **Insert the reencrypted files in your save folder.** You can change the `<number>`.

## Project Reference

Special thanks to [CoTLMindReader](https://github.com/Moonkis/CoTLMindReader) by Moonkis. I transposed to native javascript the decryption/encryption algorithm he wrote in C#.
