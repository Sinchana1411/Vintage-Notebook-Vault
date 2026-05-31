export interface Folder {
  id: string;
  name: string;
  section: 'documents' | 'text' | 'handwriting';
  createdAt: number;
}

export interface Notebook {
  id: string;
  folderId: string | null; // Can be in a folder or root of the section
  name: string;
  section: 'text' | 'handwriting';
  createdAt: number;
  coverColor?: string; // hex or tailwind shade name
  coverStyle?: 'leather' | 'linen' | 'parchment' | 'marbled' | 'velvet';
  coverLabel?: 'classic' | 'vintage' | 'minimal' | 'brass_plate';
}

export interface Chapter {
  id: string;
  notebookId: string;
  name: string;
  createdAt: number;
  order: number;
}

export interface CustomMargin {
  id: string;
  type: 'vertical-left' | 'vertical-right' | 'horizontal-top' | 'horizontal-bottom';
  position: number;
}

// Layout definitions for pages
export type PageSize = 'Portrait' | 'Landscape';
export type PaperStyle = 'ruled' | 'unruled' | 'grid';

export interface TableCellFormat {
  bg?: string;
  textColor?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  underline?: boolean;
  fontSize?: 'xs' | 'sm' | 'base';
}

export interface TableRowStyle {
  bg?: string;
  textColor?: string;
  bold?: boolean;
  italic?: boolean;
}

export interface TableColStyle {
  bg?: string;
  textColor?: string;
  align?: 'left' | 'center' | 'right';
  bold?: boolean;
  italic?: boolean;
  width?: string; // e.g. "120px", "20%" etc
}

export interface TableStyleConfig {
  headerBg?: string;
  headerTextColor?: string;
  headerBold?: boolean;
  headerItalic?: boolean;
  zebraBanded?: boolean;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderColor?: string;
}

export interface TableData {
  rows: string[][];
  headers: string[];
  styleConfig?: TableStyleConfig;
  rowStyles?: Record<number, TableRowStyle>;
  colStyles?: Record<number, TableColStyle>;
  cellStyles?: Record<string, TableCellFormat>; // key example: "rIdx-cIdx" i.e. "2-1"
}

export interface ChartData {
  title: string;
  type: 'bar' | 'line' | 'pie';
  labels: string[];
  values: number[];
}

export interface ShapeElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  fill?: string;
}

// Text Formatted Element
export interface FormattedText {
  html: string;
}

export interface StickyNote {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string; // background Tailwind class or hex color
  shape: 'square' | 'rectangle' | 'circle';
  createdAt: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  fontFamily?: 'cursive' | 'serif' | 'sans' | 'mono';
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export interface Notepaper {
  id: string;
  chapterId: string; // Belongs to a chapter
  title: string;
  createdAt: number;
  paperStyle: PaperStyle;
  pageSize: PageSize;
  hasMargin: boolean;
  marginColor?: string;
  marginPosition?: number;
  marginPositionLeft?: number;
  marginPositionRight?: number;
  marginPositionTop?: number;
  marginPositionBottom?: number;
  marginStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  marginSide?: 'left' | 'right' | 'both';
  hasHorizontalMargin?: boolean;
  customMargins?: CustomMargin[];
  
  // Text notes fields
  rawText?: string;
  formattedHtml?: string;
  leftMarginHtml?: string;
  rightMarginHtml?: string;
  topMarginHtml?: string;
  bottomMarginHtml?: string;
  tables?: TableData[];
  charts?: ChartData[];
  shapes?: ShapeElement[];
  customWidth?: number;
  customHeight?: number;
  
  // Handwriting/Drawing fields (stored as dataURL or stroke paths for SVG/Canvas rendering)
  drawingsData?: string; // canvas drawings serialized as dataURL (or high quality SVG data)
  strokeData?: string; // fallback SVG stroke path data
  stickyNotes?: StickyNote[];
}

export interface ImportedDocument {
  id: string;
  folderId: string | null; // Can be in a folder
  title: string;
  createdAt: number;
  fileType: string; // 'txt' | 'pdf' | 'image'
  fileUrl: string; // Content of text file, base64 image or mock file data
  annotations: string; // saved canvas drawing overlay dataURL
  pageSize: PageSize;
  paperStyle: PaperStyle;
  hasMargin: boolean;
  marginColor?: string;
  marginPosition?: number;
  marginPositionLeft?: number;
  marginPositionRight?: number;
  marginPositionTop?: number;
  marginPositionBottom?: number;
  marginStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  marginSide?: 'left' | 'right' | 'both';
  hasHorizontalMargin?: boolean;
  customMargins?: CustomMargin[];
  stickyNotes?: StickyNote[];
  customWidth?: number;
  customHeight?: number;
}

// Top level workspace format
export interface VintageWorkspaceData {
  version: string;
  folders: Folder[];
  notebooks: Notebook[];
  chapters: Chapter[];
  notepapers: Notepaper[];
  documents: ImportedDocument[];
  dashboardStickyNotes?: StickyNote[];
}
