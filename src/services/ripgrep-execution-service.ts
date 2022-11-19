import path = require("path");
import { rgPath } from "@vscode/ripgrep";
import { spawnSync, SpawnSyncOptionsWithStringEncoding } from "child_process";
import { IRipgrepRawMatch, IRipgrepSanitizedMatch } from "../interfaces-and-types.ts/execution-interfaces";
import { ExtensionStateStore } from "../store/extension-state-store";
const getLines = (_str: string): string[] => (_str.trim().split('\n'));

export class RipgrepService {
    private readonly _options: string[];
    private readonly _regexPattern: string;

    constructor(private extensionStateStore: ExtensionStateStore) {
        this._options = ["--json"];
        this._regexPattern = [...this.extensionStateStore.todoIdentifiers, ...this.extensionStateStore.warningIdentifiers].join('|');
    }

    private findGitModifiedFiles(cwd:string): string[] {
        const includeUntracked = (this.extensionStateStore.gitModifiedIncludeUntracked) ? '-o' : '';
        const git = spawnSync('git',['ls-files', '-m', includeUntracked],{cwd, encoding:'utf-8'});
        if(git.status !== 0) { return ['-g']; }
        return getLines(git.stdout).flatMap((line) => (['-g',`${line}`]));
    }

    public findMatches(dir: string): IRipgrepSanitizedMatch[] {
        const cwd = path.normalize(dir);
        const specificFileSearch = (this.extensionStateStore.scanMode === 'Modified_Files') ? this.findGitModifiedFiles(cwd) : [];
        const rgSettings:SpawnSyncOptionsWithStringEncoding = { encoding: 'utf-8'};
        rgSettings.cwd = (this.extensionStateStore.scanMode !== 'Current_File') ? cwd : undefined;

        const ripgrep = spawnSync(rgPath, [...this._options, ...specificFileSearch, '--', this._regexPattern, cwd ], rgSettings);
        if (ripgrep.status == null || ripgrep.status! > 1) {
            throw new Error("Ripgrep crashed due to unexpected error.");
        }
        const _rawMatches = getLines(ripgrep.stdout)
            .map((line) => (JSON.parse(line)))
            .filter((obj) => (obj.type === 'match'));
        
        return this.sanitizeMatches(_rawMatches);
    }

    private sanitizeMatches(_rawMatches: IRipgrepRawMatch[]): IRipgrepSanitizedMatch[] {
        return _rawMatches.flatMap((match) => {
            return match.data.submatches.map((submatch): IRipgrepSanitizedMatch => {
                const dots = (match.data.lines.text.length > this.extensionStateStore.descriptionMaxLength + submatch.start) ? '...' : '';
                return {
                    matchKeyword: submatch.match.text,
                    uri: match.data.path.text,
                    line: match.data.line_number,
                    column: submatch.start,
                    lineText: `${match.data.lines.text.substring(submatch.start, submatch.start + this.extensionStateStore.descriptionMaxLength).trim()}${dots}`,
                };
            });
        });
    }
}