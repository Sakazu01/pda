// Shared types for the diagram model and the registries every module reads.
// Index signatures keep room for the many optional, per-family fields.

export type Dict<T> = Record<string, T>;

export interface Point {
  x: number;
  y: number;
}

export interface DiagramNode {
  id: string;
  t: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  sub?: string;
  body?: string;
  icon?: string;
  fill?: string;
  stroke?: string;
  textColor?: string;
  tone?: string;
  [key: string]: any;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  type: string;
  label?: string;
  route?: string;
  dir?: string;
  wp?: Point[];
  fromAnchor?: Point;
  toAnchor?: Point;
  mx?: number | null;
  my?: number | null;
  lt?: number;
  [key: string]: any;
}

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  seq: number;
  dt?: string;
  style?: string;
  [key: string]: any;
}

export interface DocMeta {
  id: string | null;
  title: string;
  updatedAt: number;
  example: boolean;
}

/** A shape kind in the palette: family, display name, icon and category. */
export interface ShapeType {
  f: string;
  n: string;
  icon?: string;
  cat?: string;
  tech?: number;
  kw?: string;
  [key: string]: any;
}

/** A diagram type (one project page). */
export interface DiagramType {
  ws: string;
  n: string;
  pal?: string[];
  hint?: string;
  [key: string]: any;
}

/** A line type: name, arrow ends, dash and group. */
export interface EdgeType {
  n: string;
  end?: string;
  start?: string;
  dash?: string;
  g?: string;
  [key: string]: any;
}

export interface Category {
  n: string;
  light: string;
  dark: string;
}

export interface PaletteSection {
  n: string;
  keys: string[];
  cat?: string;
  lazy?: number;
}

export interface Project {
  pages: Dict<any>;
  prd: string;
  dict: any[];
  plan?: string[];
  deck?: any;
  [key: string]: any;
}

export interface LlmProvider {
  n: string;
  builtin?: number;
  base?: string;
  model?: string;
  kind?: 'oai' | 'anthropic' | 'gemini';
  key?: number;
}

export interface LlmConfig {
  prov: string;
  base: string;
  model: string;
  keep: boolean;
  key?: string;
}

export interface TechLogo {
  s: string;
  k?: string;
  id?: string;
}

declare global {
  interface Window {
    /** Host runtime when PDA runs inside Claude. */
    claude?: any;
    /** File System Access API (Chromium). */
    showDirectoryPicker?: (opts?: { id?: string; mode?: 'read' | 'readwrite' }) => Promise<any>;
    /** PowerPoint export library, loaded on demand. */
    PptxGenJS?: any;
    /** Test hook (tests/hook.ts). */
    __RS?: any;
  }
}
