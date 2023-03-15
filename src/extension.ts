import * as vscode from 'vscode';
import { switchScanModeCommands, toggleViewModeCommand, treeItemClickedCommand } from './commands';
import { MainStructureResolver } from './providers/main-tree-view-provider/main-structure-resolver';
import { MainTreeviewProvider } from './providers/main-tree-view-provider/main-tree-view-provider';
import { RipgrepService } from './services/ripgrep-execution-service';
import { ExtensionStateStore } from './store/extension-state-store';
import { registerFileSystemWatcher, registerOnDidChangeVisibleTextEditorsWatcher, registerOnDidChangeWorkspaceFoldersWatcher, registerOnDidSaveTextDocumentWatcher } from './watchers/file-system-watcher';
const extensionStateStore = new ExtensionStateStore();
const outputChannel = vscode.window.createOutputChannel("minimalTODO");

export async function activate(context: vscode.ExtensionContext) {
	/**
	 * [[ we initialize and inject dependencies ]]
	 **/ 
	const ripgrepService = new RipgrepService(extensionStateStore, outputChannel);

	const mainTreeviewProvider = new MainTreeviewProvider();

	/**
	 * [[ we register main treeview provider ]]
	 **/ 
	const mainTreeview = vscode.window.createTreeView("minimaltodo-view", { treeDataProvider: mainTreeviewProvider} );

	const mainStructureResolver = new MainStructureResolver(extensionStateStore, ripgrepService, mainTreeview, mainTreeviewProvider);

	/**
	 * [[ we register all commands ]]
	 **/ 
	context.subscriptions.push(
		...[
			mainTreeview,
			//registering of commands
			toggleViewModeCommand(extensionStateStore,{ mainStructureResolver }),
			switchScanModeCommands(extensionStateStore, { mainStructureResolver, setting: 'Current_File' }),
			switchScanModeCommands(extensionStateStore, { mainStructureResolver, setting: 'Modified_Files' }),
			switchScanModeCommands(extensionStateStore, { mainStructureResolver, setting: 'Workspace_Files' }),
			treeItemClickedCommand(),

			//registering of watchers
			registerFileSystemWatcher({ mainStructureResolver }),
			registerOnDidSaveTextDocumentWatcher(extensionStateStore, { mainStructureResolver }),
			registerOnDidChangeVisibleTextEditorsWatcher(extensionStateStore, { mainStructureResolver }),
			registerOnDidChangeWorkspaceFoldersWatcher({ mainStructureResolver }),
		]
	);
}

export function deactivate() {}
