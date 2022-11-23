import path = require('path');
import * as vscode from 'vscode';
import { IRipgrepSanitizedMatch } from '../../interfaces-and-types.ts/execution-interfaces';
import { RipgrepService } from "../../services/ripgrep-execution-service";
import { ExtensionStateStore, SettingScanMode } from "../../store/extension-state-store";
import { MainTreeviewProvider } from './main-tree-view-provider';
import { DirectoryTreeItem, FileTreeItem, LeafTreeItem, TreeItem } from "./tree-items/tree-item-manager";


export class MainStructureResolver {
    private _determinedRootUris: vscode.Uri[] = [];
    private _treeviewComputed: IRipgrepSanitizedMatch[][] = [[]];

    constructor(
        private extensionStateStore: ExtensionStateStore,
        private ripgrepService: RipgrepService,
        private mainTreeview: vscode.TreeView<TreeItem>,
        private mainTreeviewProvider: MainTreeviewProvider,
    ) {
        this.ripgrepScan();    //trigger scan
        this.buildRenderableItemsBasedOnView();    //trigger render
    }

    /**
     * [[ returns domains or file uris under which the scan will be performed ]]
     **/
    private determineRootUris() {
        switch (this.extensionStateStore.scanMode) {
            case 'Current_File': {
                this._determinedRootUris = vscode.window.visibleTextEditors.map((vte) => vte.document.uri);
                return;
            }
            case 'Workspace_Files': {
                this._determinedRootUris = vscode.workspace.workspaceFolders?.map((wf) => wf.uri) ?? [];
                return;
            }
            case 'Modified_Files': {
                this._determinedRootUris = vscode.workspace.workspaceFolders?.map((wf) => wf.uri) ?? [];
                return;
            }
        }
    }

    /**
    * [[ returns matches in single root file/directory ]]
    **/
    private executeScan(uri: vscode.Uri): IRipgrepSanitizedMatch[] {
        return this.ripgrepService.findMatches(uri.fsPath);
    }

    public ripgrepScan() {
        this.determineRootUris();
        this._treeviewComputed = this._determinedRootUris.map((uri) => this.executeScan(uri));
        this.setBadgeTaskCount();
    }

    private listViewRenderService() {
        this.mainTreeviewProvider.treeviewRenderable = this._treeviewComputed.flat().map((match) => new LeafTreeItem(this.extensionStateStore, match));
    }

    private treeViewRenderService() {
        this.mainTreeviewProvider.treeviewRenderable = [];

        this._treeviewComputed.forEach((distMatches, index) => {
            for (const match of distMatches) {
                const auxPathData = vscode.Uri.file(path.dirname(this._determinedRootUris[index].fsPath));
                const _path = path.relative(auxPathData.fsPath, match.uri).split(path.sep);

                const initial = { subElements: [this.mainTreeviewProvider.treeviewRenderable[index]] };
                const fileElement = _path.reduce((prevElem: any, currDir: any, i) => {
                    let subElem = prevElem?.subElements.find((sub: TreeItem) => (sub.name === currDir));

                    if (!subElem) {
                        const _newUri = vscode.Uri.joinPath(auxPathData, ..._path.slice(0, i + 1));
                        //Add new subElement if it does not exist
                        subElem = (i < _path.length - 1) ? new DirectoryTreeItem(_newUri, prevElem) : new FileTreeItem(_newUri, prevElem);
                        (prevElem) ? prevElem.subElements.push(subElem) : this.mainTreeviewProvider.treeviewRenderable[index] = (subElem);
                    }
                    return subElem;
                }, this.mainTreeviewProvider.treeviewRenderable[index] ? initial : null);
                fileElement.subElements.push(new LeafTreeItem(this.extensionStateStore, match, fileElement));
            }
        });
    }

    public buildRenderableItemsBasedOnView() {
        switch (this.extensionStateStore.viewMode) {
            case 'ListView':
                this.listViewRenderService();
                break;
            case 'TreeView':
                this.treeViewRenderService();
                break;
        }

        this.mainTreeviewProvider._onDidChangeTreeData.fire();
    }

    private setBadgeTaskCount(){
        const scanModeMapper: { [key in SettingScanMode]: string; } = {
            Workspace_Files: 'Scan workspace files',
            Current_File: 'Scan current file',
            Modified_Files: 'Scan modified files'

        }

        this.mainTreeview.badge = { 
            tooltip: scanModeMapper[this.extensionStateStore.scanMode],
            value: this._treeviewComputed.flat().length,
        };
    }
}