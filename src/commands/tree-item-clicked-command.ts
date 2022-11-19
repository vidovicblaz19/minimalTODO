import * as vscode from 'vscode';
import { on_tree_item_clicked } from '../providers/main-tree-view-provider/tree-items/utils';

export function treeItemClickedCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('minimaltodo.on_main_Treeview_item_clicked', item => on_tree_item_clicked(item));
};