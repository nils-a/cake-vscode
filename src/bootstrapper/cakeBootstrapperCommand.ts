import { window, workspace } from 'vscode';
import * as fs from 'fs';
import { CakeBootstrapper } from './cakeBootstrapper';
import { CakeBootstrapperInfo } from './cakeBootstrapperInfo';

export async function installCakeBootstrapperCommand() {
    // Let the user select the bootstrapper.
    const info = await window.showQuickPick(CakeBootstrapper.getBootstrappers(), {
        placeHolder: 'Select the bootstrapper that you want to install',
        matchOnDetail: true,
        matchOnDescription: true
    });

    if (!info) {
        return;
    }

    // Check if there is an open folder in workspace
    if (workspace.rootPath === undefined) {
        window.showErrorMessage('You have not yet opened a folder.');
        return;
    }

    installCakeBootstrapperFile(info);
}

export async function installCakeBootstrapperFile(
    info: CakeBootstrapperInfo,
    notifyOnCompletion = true
) {
    // Create the bootstrapper from the platform.
    const bootstrapper = new CakeBootstrapper(info);

    // Does the bootstrapper already exist?
    const buildFilePath = bootstrapper.getTargetPath();

    if (fs.existsSync(buildFilePath)) {
        const message = `Overwrite the existing '${
            info.fileName
        }' file in this folder?`;
        const option = await window.showWarningMessage(message, 'Overwrite');

        if (option !== 'Overwrite') {
            return;
        }
    }

    // Download the bootstrapper and save it to disk.
    const file = fs.createWriteStream(buildFilePath);
    const result = await bootstrapper.download(file);

    if (result) {
        if (process.platform !== 'win32' && info.posix) {
            fs.chmod(buildFilePath, 0o755, () => {
                window.showErrorMessage('Error changing permissions.');
            });
        }

        if (notifyOnCompletion) {
            window.showInformationMessage(
                'Cake bootstrapper downloaded successfully.'
            );
        }
    } else {
        window.showErrorMessage('Error downloading Cake bootstrapper.');
    }
}
