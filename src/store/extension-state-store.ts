import * as vscode from 'vscode';
import { MainStructureResolver } from '../providers/main-tree-view-provider/main-structure-resolver';

export type SettingScanMode = 'Current_File' | 'Workspace_Files' | 'Modified_Files';
export type SettingViewMode = 'TreeView' | 'ListView';

export interface IModifySettingPayload {
    setting?: any;
    mainStructureResolver: MainStructureResolver;
}

export class ExtensionStateStore {
    private _settingConfiguration: vscode.WorkspaceConfiguration;

    public todoIdentifiers: string[];
    public warningIdentifiers: string[];
    public descriptionMaxLength: number;
    public gitModifiedIncludeUntracked: boolean;
    private _viewMode: SettingViewMode;
    private _scanMode: SettingScanMode;

    constructor() {
        this._settingConfiguration = vscode.workspace.getConfiguration('minimaltodo');
        if (!this._settingConfiguration) { vscode.window.showWarningMessage(`Unable to access extension settings. Fallback to extension defaults.`); }

        this.todoIdentifiers = this._settingConfiguration.get('general.todoIdentifiers') ?? ["TODO"];
        this.warningIdentifiers = this._settingConfiguration.get('general.warningIdentifiers') ?? [];
        this.descriptionMaxLength = this._settingConfiguration.get('general.descriptionMaxLength') ?? 128;
        this._viewMode = this._settingConfiguration.get('general.ViewMode') ?? 'ListView';
        this._scanMode = this._settingConfiguration.get('general.ScanMode') ?? 'Current_File';
        this.gitModifiedIncludeUntracked = this._settingConfiguration.get('general.gitModifiedIncludeUntracked') ?? false;
    }

    /* View Mode settings */
    public get viewMode(): SettingViewMode {
        return this._viewMode;
    }
    public async toggleViewMode({ mainStructureResolver }: IModifySettingPayload) {
        if (!mainStructureResolver) { return; }
        this._viewMode = (this._viewMode === 'ListView') ? 'TreeView' : 'ListView';
        this.saveCurrentConfiguration();

        mainStructureResolver.buildRenderableItemsBasedOnView(); //trigger render
    }

    /* Scan Mode settings */
    public get scanMode(): SettingScanMode {
        return this._scanMode;
    }
    public async setScanMode({ setting, mainStructureResolver }: Omit<IModifySettingPayload, 'setting'> & { setting: SettingScanMode }) {
        if (!mainStructureResolver || !setting) { return; }
        this._scanMode = setting;
        this.saveCurrentConfiguration();

        mainStructureResolver.ripgrepScan();    //trigger scan
        mainStructureResolver.buildRenderableItemsBasedOnView();    //trigger render
    }

    private async saveCurrentConfiguration() {
        await this._settingConfiguration.update('general.ViewMode', <string>this._viewMode, vscode.ConfigurationTarget.Global);
        await this._settingConfiguration.update('general.ScanMode', <string>this._scanMode, vscode.ConfigurationTarget.Global);
    }
}