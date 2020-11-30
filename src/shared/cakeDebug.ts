import { readCakeConfigFile } from './utils/readConfigFile';
import * as request from 'request';
import * as AdmZip from 'adm-zip';
import { window, workspace } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as utils from './utils';
import {
    DEFAULT_RESPONSE_TIMEOUT,
    CAKE_CORECLR_PACKAGE_URL
} from '../constants';

export class CakeDebug {
    private config: utils.Config;
    constructor() {
        this.config = readCakeConfigFile(workspace.rootPath);
    }

    public getTargetPath(): string {
        if (workspace.rootPath) {
            return path.join(
                workspace.rootPath,
                this.config.Paths.Tools,
                'Cake.CoreCLR/Cake.dll'
            );
        }
        return '';
    }

    public getNupkgDestinationPath(): string {
        if (workspace.rootPath) {
            return path.join(
                workspace.rootPath,
                this.config.Paths.Tools,
                'Cake.CoreCLR'
            );
        }
        return '';
    }

    public getToolFolderPath(): string {
        if (workspace.rootPath) {
            return path.join(workspace.rootPath, this.config.Paths.Tools);
        }
        return '';
    }

    public downloadAndExtract(): Thenable<boolean> {
        return new Promise((resolve, reject) => {
            // Download the NuGet Package

            // TODO: check if the next statement is really needed!
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const vm = this;

            try {
                if (!fs.existsSync(vm.getToolFolderPath())) {
                    fs.mkdirSync(vm.getToolFolderPath());
                }
            } catch (error) {
                window.showErrorMessage('Unable to create directory');
            }

            const data: any[] = [];
            let dataLen = 0;

            request
                .get(CAKE_CORECLR_PACKAGE_URL, {
                    timeout: DEFAULT_RESPONSE_TIMEOUT
                })
                .on('data', function(chunk: any) {
                    data.push(chunk);
                    dataLen += chunk.length;
                })
                .on('end', function() {
                    const buf = new Buffer(dataLen);

                    for (let i = 0, len = data.length, pos = 0; i < len; i++) {
                        data[i].copy(buf, pos);
                        pos += data[i].length;
                    }

                    const zip = new AdmZip(buf);
                    zip.extractAllTo(vm.getNupkgDestinationPath());
                    resolve(true);
                })
                .on('error', function(e: any) {
                    reject(`Failed to download debug dependencies: ${e}`);
                });
        });
    }
}
