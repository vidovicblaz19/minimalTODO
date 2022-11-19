import { SettingScanMode, SettingViewMode } from "../store/extension-state-store";

export interface IRipgrepRawMatch {
	type:string;
	data:{
		// eslint-disable-next-line @typescript-eslint/naming-convention
		absolute_offset: number;
		// eslint-disable-next-line @typescript-eslint/naming-convention
		line_number: number;
		lines: {
			text: string;
		}
		path: {
			text: string;
		}
		submatches: {
			match: {
				text: string;
			}
			start: number;
			end: number;
		}[]
	}
}

export interface IRipgrepSanitizedMatch {
	matchKeyword: string;
	uri: string;
	line: number;
	column: number;
	lineText: string;
}

export interface ILeafInfo {
	match: IRipgrepSanitizedMatch;
	viewMode: SettingViewMode;
	scanMode: SettingScanMode;
}