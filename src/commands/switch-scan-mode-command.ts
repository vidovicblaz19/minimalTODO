import * as vscode from 'vscode';
import { ExtensionStateStore, IModifySettingPayload, SettingScanMode } from "../store/extension-state-store";

export function switchScanModeCommands(extensionStateStore: ExtensionStateStore, { setting, mainStructureResolver }: Omit<IModifySettingPayload,'setting'> & {setting: SettingScanMode}): vscode.Disposable {
    return vscode.commands.registerCommand(`minimaltodo.scanmode.${setting}`, () => {
        extensionStateStore.setScanMode({ mainStructureResolver, setting });
    });
}
