import * as vscode from 'vscode';
import { DirectoryTreeItem, FileTreeItem, LeafTreeItem, TreeItem } from './tree-item-manager';

// eslint-disable-next-line @typescript-eslint/naming-convention
export function on_tree_item_clicked(item: LeafTreeItem) {
	if(!item) {return;}
	vscode.workspace.openTextDocument(item.resuri!).then( td => {
		vscode.window.showTextDocument(td).then(e => {
			let pos = new vscode.Position(item.match.line - 1, item.match.column);
			e.selection = new vscode.Selection(pos,pos);
			e.revealRange(new vscode.Range(pos,pos));
		});
	});
}

export function treeItemSorter(a:TreeItem, b:TreeItem) {
    if(a instanceof DirectoryTreeItem && b instanceof FileTreeItem) {return -1;}
    if(a instanceof FileTreeItem && b instanceof DirectoryTreeItem) {return 1;}
	if(a instanceof LeafTreeItem || b instanceof LeafTreeItem) {return 0;}
    return a.name.localeCompare(b.name);
}

/**
 * Used for selecively rerendering tree view from certain node on
 */
function searchTreeItemsRecursively(searchedUri: string, treeitemStructure: TreeItem[]): TreeItem | null {
	return treeitemStructure.reduce((a: TreeItem | null , treeItem: TreeItem) => {
		if (a) {return a;}
		if (treeItem.resourceUri?.fsPath === searchedUri) {return treeItem;}
		return searchTreeItemsRecursively(searchedUri, treeItem.subElements);
	},null);
}