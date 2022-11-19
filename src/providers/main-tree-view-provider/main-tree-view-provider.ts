import * as vscode from 'vscode';
import { TreeItem } from './tree-items/tree-item-manager';
import { treeItemSorter } from './tree-items/utils';

export class MainTreeviewProvider implements vscode.TreeDataProvider<TreeItem>  {
    private _treeviewRenderable: TreeItem[] = [];

    
    public set treeviewRenderable(v : TreeItem[]) {
        this._treeviewRenderable = v;
    }    
    public get treeviewRenderable() : TreeItem[] {
        return this._treeviewRenderable;
    }

    public _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor() {}

    getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<(TreeItem)[]> {
        if(!element){
			if(vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0){
				return Promise.resolve(this._treeviewRenderable);
			}
			return Promise.resolve(this._treeviewRenderable.sort((a,b) => treeItemSorter(a,b)));
		}
		return Promise.resolve(element.subElements.sort((a,b) => treeItemSorter(a,b)));
    }
}