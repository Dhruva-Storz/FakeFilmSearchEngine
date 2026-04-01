export interface Sitelink {
  text: string;
  url?: string;
}

export interface SearchResult {
  title: string;
  displayUrl: string;
  url?: string;
  description: string;
  sitelinks?: Sitelink[];
}

export interface SearchEngineConfig {
  engineName: string;
  tagline: string;
  logoDataUrl?: string;
  results: SearchResult[];
}
