import * as vscode from 'vscode';
import { ExtensionStateStore, IModifySettingPayload } from '../store/extension-state-store';

export function registerFileSystemWatcher({ mainStructureResolver }: Omit<IModifySettingPayload, 'setting'>): vscode.FileSystemWatcher {
    const watcher = vscode.workspace.createFileSystemWatcher("**");

    watcher.onDidDelete((uri) => {
        mainStructureResolver.ripgrepScan(); // trigger scan
        mainStructureResolver.buildRenderableItemsBasedOnView(); //trigger render
    });
    watcher.onDidCreate((uri) => {
        mainStructureResolver.ripgrepScan(); // trigger scan
        mainStructureResolver.buildRenderableItemsBasedOnView(); //trigger render
    });
    return watcher;
}

export function registerOnDidSaveTextDocumentWatcher(extensionStateStore: ExtensionStateStore, { mainStructureResolver }: Omit<IModifySettingPayload, 'setting'>): vscode.Disposable {
    return vscode.workspace.onDidSaveTextDocument((_) => {
        mainStructureResolver.ripgrepScan(); // trigger scan
        mainStructureResolver.buildRenderableItemsBasedOnView(); //trigger render
    });
}

export function registerOnDidChangeVisibleTextEditorsWatcher(extensionStateStore: ExtensionStateStore, { mainStructureResolver }: Omit<IModifySettingPayload, 'setting'>): vscode.Disposable {
    return vscode.window.onDidChangeVisibleTextEditors((_) => {
        if (extensionStateStore.scanMode === 'Current_File') {
            mainStructureResolver.ripgrepScan(); // trigger scan
            mainStructureResolver.buildRenderableItemsBasedOnView(); //trigger render
        }
    });
}

export function registerOnDidChangeWorkspaceFoldersWatcher({ mainStructureResolver }: Omit<IModifySettingPayload, 'setting'>): vscode.Disposable {
    return vscode.workspace.onDidChangeWorkspaceFolders((_) => {
        mainStructureResolver.ripgrepScan(); // trigger scan
        mainStructureResolver.buildRenderableItemsBasedOnView(); //trigger render
    });
}
