import * as vscode from 'vscode';
import { ExtensionStateStore, IModifySettingPayload } from '../store/extension-state-store';

export function toggleViewModeCommand(extensionStateStore: ExtensionStateStore,{ mainStructureResolver }: IModifySettingPayload): vscode.Disposable {
    return vscode.commands.registerCommand('minimaltodo.toggleViewMode', () => {
        extensionStateStore.toggleViewMode({ mainStructureResolver });
    });
};