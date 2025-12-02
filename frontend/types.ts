export interface DistroDetails {
  uri: string;
  name: string;
  logo?: string;
  description?: string;
  basedOn?: { name: string; uri: string }[];
  packageManager?: string;
  website?: string;
}

export interface GraphNode {
  id: string;
  name: string;
  val: number; // Size of node
  color?: string;
  logo?: string;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface SearchResult {
  uri: string;
  name: string;
  description?: string;
}