import { commands, window, workspace } from 'vscode';
import * as fs from 'fs';
import { CakeBakery } from './cakeBakery';

export async function installCakeBakeryCommand(): Promise<void> {
    // Make sure that we're in the correct place.
    if (workspace.rootPath === undefined) {
        window.showErrorMessage('You have not yet opened a folder.');
        return;
    }

    // Install Cake Bakery
    const result = await installCakeDebug();
    if (result) {
        commands.executeCommand('o.restart');
        window.showInformationMessage(
            'Intellisense support for Cake files was installed.'
        );
    } else {
        window.showErrorMessage(
            'Error downloading intellisense support for Cake files.'
        );
    }
}

export async function installCakeDebug(): Promise<boolean> {
    const bakery = new CakeBakery();

    const targetPath = bakery.getTargetPath();
    if (fs.existsSync(targetPath)) {
        window.showWarningMessage(
            'Intellisense support for Cake files has already been installed.'
        );
        return true;
    }

    return await bakery.downloadAndExtract();
}
