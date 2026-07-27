
export enum Verdict {
  LikelyTrue = 'LIKELY TRUE',
  LikelyFalse = 'LIKELY FALSE',
  Inconclusive = 'INCONCLUSIVE',
}

export interface Source {
  uri: string;
  title: string;
}

export interface FactCheckResult {
  verdict: Verdict;
  explanation: string;
  sources: Source[];
}
