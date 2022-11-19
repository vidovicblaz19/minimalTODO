import * as vscode from 'vscode';
import path = require('path');
import { IRipgrepSanitizedMatch } from '../../../interfaces-and-types.ts/execution-interfaces';
import { ExtensionStateStore } from '../../../store/extension-state-store';

export type StructuralTreeItem = DirectoryTreeItem | FileTreeItem;
export type TreeItem = DirectoryTreeItem | FileTreeItem | LeafTreeItem;

export class DirectoryTreeItem extends vscode.TreeItem {
	public readonly name: string;
	public readonly description: string;
	public subElements: TreeItem[] = [];

	constructor(
		public resourceUri: vscode.Uri,
		public parent: StructuralTreeItem | null = null,
	) {
		super('', vscode.TreeItemCollapsibleState.Collapsed);
		this.name = path.basename(resourceUri.fsPath);
		this.description = this.name;
	}
	contextValue = 'Folder';
}

export class FileTreeItem extends vscode.TreeItem {
	public readonly name: string;
	public readonly description: string;
	public subElements: LeafTreeItem[] = [];

	constructor(
		public resourceUri: vscode.Uri,
		public parent: StructuralTreeItem | null = null,
	) {
		super('', vscode.TreeItemCollapsibleState.Collapsed);
		this.name = path.basename(resourceUri.fsPath);
		this.description = this.name;
		this.iconPath = vscode.ThemeIcon.File;
	}
	contextValue = 'File';
}

export class LeafTreeItem extends vscode.TreeItem {
	public readonly iconPath: vscode.ThemeIcon;
	public readonly command: vscode.Command;
	public readonly name: string;
	public subElements: never[] = [];
	public resuri: vscode.Uri;

	constructor(
		private extensionStateStore: ExtensionStateStore,
		public match: IRipgrepSanitizedMatch,
		public parent: StructuralTreeItem | null = null,
	) {
		const lab = (extensionStateStore.todoIdentifiers.includes(match.matchKeyword))
			? `《TODO》(${match.line}, ${match.column})${match.lineText.substring(match.matchKeyword.length)}`
			: `《warning》(${match.line}, ${match.column}) ${match.lineText}`;
		super(lab, vscode.TreeItemCollapsibleState.None);
		this.resuri = vscode.Uri.file(match.uri);
		this.name = path.basename(this.resuri.fsPath);
		this.description = (extensionStateStore.viewMode === 'ListView') ? path.basename(this.resuri.fsPath) : '';
		this.command = { command: 'minimaltodo.on_main_Treeview_item_clicked', title: '', arguments: [this] };
		this.iconPath = this.extensionStateStore.todoIdentifiers.includes(match.matchKeyword) ? new vscode.ThemeIcon('gripper') : new vscode.ThemeIcon('warning');

		/* bracket options
			〈warning〉
			《warning》
			【warning】
			〔warning〕
			﹛warning﹜
			｛warning｝
			{warning}
		*/
	}
}