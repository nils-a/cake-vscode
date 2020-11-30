import * as fs from 'fs';
import { window } from 'vscode';

export default async function checkForExisting(path: string): Promise<boolean> {
    if (fs.existsSync(path)) {
        const message = `Overwrite the existing '${path}' file in this folder?`;
        const option = await window.showWarningMessage(message, 'Overwrite');
        return option === 'Overwrite';
    }

    return true;
}
