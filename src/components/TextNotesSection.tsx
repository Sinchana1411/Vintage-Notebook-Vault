import React, { useState, useEffect } from 'react';
import { 
  Type, Bold, Italic, Underline, Table as TableIcon, BarChart3, 
  HelpCircle, AlertCircle, Trash2, Plus, Settings, Square, Circle, 
  ChevronsRight, FileText, LayoutTemplate, ChevronUp, ChevronDown, Sliders, Download 
} from 'lucide-react';
import { Notepaper, PageSize, PaperStyle, TableData, ChartData, ShapeElement, CustomMargin } from '../types';
import { StickyNotesSectionLayer, StickyNoteCard } from './StickyNoteOverlay';

export const colorClassMap: Record<string, { bg: string; text: string; border: string; bgHover: string }> = {
  transparent: { bg: 'bg-transparent', text: 'text-stone-800', border: 'border-stone-300', bgHover: 'hover:bg-stone-50' },
  burgundy: { bg: 'bg-[#8c2522]', text: 'text-white', border: 'border-[#ebdcb9]', bgHover: 'hover:bg-[#a32e2a]' },
  emerald: { bg: 'bg-[#2e4f3f]', text: 'text-white', border: 'border-[#ebdcb9]', bgHover: 'hover:bg-[#3d6954]' },
  royal: { bg: 'bg-[#1e3557]', text: 'text-white', border: 'border-[#ebdcb9]', bgHover: 'hover:bg-[#2b4c7e]' },
  parchment: { bg: 'bg-[#ebdcb9]', text: 'text-[#3e2723]', border: 'border-[#ebdcb9]/60', bgHover: 'hover:bg-[#dfd0aa]' },
  amber: { bg: 'bg-[#fbf0d9]', text: 'text-[#5c4033]', border: 'border-[#ebdcb9]/40', bgHover: 'hover:bg-[#f6dfba]' },
  linen: { bg: 'bg-[#fcf8f2]', text: 'text-stone-800', border: 'border-stone-200', bgHover: 'hover:bg-[#faf4eb]' },
  slateLight: { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300', bgHover: 'hover:bg-slate-200' },
  slateDark: { bg: 'bg-slate-700', text: 'text-white', border: 'border-slate-600', bgHover: 'hover:bg-slate-600' },
  obsidian: { bg: 'bg-stone-900', text: 'text-white', border: 'border-stone-800', bgHover: 'hover:bg-stone-850' },
  plum: { bg: 'bg-purple-100', text: 'text-purple-950', border: 'border-purple-300', bgHover: 'hover:bg-purple-200' },
  sunlight: { bg: 'bg-yellow-100', text: 'text-yellow-950', border: 'border-yellow-300', bgHover: 'hover:bg-yellow-200' },
  mint: { bg: 'bg-emerald-100', text: 'text-emerald-950', border: 'border-emerald-300', bgHover: 'hover:bg-emerald-200' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-950', border: 'border-rose-300', bgHover: 'hover:bg-rose-200' }
};

export const colorOptions = [
  { key: 'transparent', label: 'Transparent', bgClass: 'bg-transparent border border-stone-300' },
  { key: 'burgundy', label: 'Burgundy Red', bgClass: 'bg-[#8c2522]' },
  { key: 'emerald', label: 'Emerald Green', bgClass: 'bg-[#2e4f3f]' },
  { key: 'royal', label: 'Royal Blue', bgClass: 'bg-[#1e3557]' },
  { key: 'parchment', label: 'Aged Parchment', bgClass: 'bg-[#ebdcb9]' },
  { key: 'amber', label: 'Warm Amber', bgClass: 'bg-[#fbf0d9]' },
  { key: 'linen', label: 'Scribe Linen', bgClass: 'bg-[#fcf8f2]' },
  { key: 'slateLight', label: 'Slate Light', bgClass: 'bg-slate-100 border border-slate-200' },
  { key: 'slateDark', label: 'Slate Dark', bgClass: 'bg-slate-700' },
  { key: 'obsidian', label: 'Ink Obsidian', bgClass: 'bg-stone-900' },
  { key: 'plum', label: 'Plum Pastel', bgClass: 'bg-purple-100 border border-purple-200' },
  { key: 'sunlight', label: 'Gold Sunlight', bgClass: 'bg-yellow-100 border border-yellow-200' },
  { key: 'mint', label: 'Moss Mint', bgClass: 'bg-emerald-100 border border-emerald-200' },
  { key: 'rose', label: 'Rose Petal', bgClass: 'bg-rose-100 border border-rose-200' }
];

interface TextNotesSectionProps {
  pageItem: Notepaper | null;
  onUpdatePage: (updated: Notepaper) => void;
}

export default function TextNotesSection({ pageItem, onUpdatePage }: TextNotesSectionProps) {
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ruled');
  const [pageSize, setPageSize] = useState<PageSize>('Portrait');
  const [hasMargin, setHasMargin] = useState<boolean>(true);
  const [marginColor, setMarginColor] = useState<string>('#f87171');
  const [marginPosition, setMarginPosition] = useState<number>(75);
  const [marginPositionLeft, setMarginPositionLeft] = useState<number>(75);
  const [marginPositionRight, setMarginPositionRight] = useState<number>(75);
  const [marginPositionTop, setMarginPositionTop] = useState<number>(60);
  const [marginPositionBottom, setMarginPositionBottom] = useState<number>(60);
  const [hasHorizontalMargin, setHasHorizontalMargin] = useState<boolean>(false);
  const [marginStyle, setMarginStyle] = useState<'solid' | 'dashed' | 'dotted' | 'double'>('solid');
  const [marginSide, setMarginSide] = useState<'left' | 'right' | 'both'>('left');
  const [showMarginStyles, setShowMarginStyles] = useState<boolean>(false);
  const [customMargins, setCustomMargins] = useState<CustomMargin[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [customWidth, setCustomWidth] = useState<number>(800);
  const [customHeight, setCustomHeight] = useState<number>(1131);

  const sizePixels: Record<PageSize, { width: number; height: number }> = {
    Portrait: { width: 800, height: 1131 },
    Landscape: { width: 1131, height: 800 }
  };

  // Editor states
  const [fontStyle, setFontStyle] = useState<'serif' | 'display' | 'cursive' | 'mono'>('serif');
  const [fontSize, setFontSize] = useState<string>('16px');
  const [textColor, setTextColor] = useState<string>('#333333');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);

  // Document draft editable text
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [initialHtml, setInitialHtml] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1.0);
  const editorRef = React.useRef<HTMLDivElement | null>(null);

  // Margin editorial states and references
  const [leftMarginContent, setLeftMarginContent] = useState<string>('');
  const [rightMarginContent, setRightMarginContent] = useState<string>('');
  const [topMarginContent, setTopMarginContent] = useState<string>('');
  const [bottomMarginContent, setBottomMarginContent] = useState<string>('');

  const leftMarginRef = React.useRef<HTMLDivElement | null>(null);
  const rightMarginRef = React.useRef<HTMLDivElement | null>(null);
  const topMarginRef = React.useRef<HTMLDivElement | null>(null);
  const bottomMarginRef = React.useRef<HTMLDivElement | null>(null);

  // Table customizer active states
  const [selectedCell, setSelectedCell] = useState<{ tableIdx: number; rIdx: number; cIdx: number } | null>(null);
  const [selectedRow, setSelectedRow] = useState<{ tableIdx: number; rIdx: number } | null>(null);
  const [selectedCol, setSelectedCol] = useState<{ tableIdx: number; cIdx: number } | null>(null);
  const [activeTableIdx, setActiveTableIdx] = useState<number | null>(null);
  const [tableConfigTab, setTableConfigTab] = useState<Record<number, 'data' | 'cell' | 'row' | 'col' | 'global'>>({});

  // Sizing styles
  const sizeClasses: Record<PageSize, string> = {
    Portrait: 'w-full max-w-[800px] min-h-[1131px]',
    Landscape: 'w-full max-w-[1131px] min-h-[800px]'
  };

  const mappedPageSize = (val: string): PageSize => {
    if (val === 'Landscape' || val === 'Letter_Landscape' || val === 'A4_Landscape') {
      return 'Landscape';
    }
    return 'Portrait';
  };

  // Load page specific data
  useEffect(() => {
    if (pageItem) {
      setPaperStyle(pageItem.paperStyle);
      const mappedSize = mappedPageSize(pageItem.pageSize);
      setPageSize(mappedSize);
      setHasMargin(pageItem.hasMargin);
      setMarginColor(pageItem.marginColor || '#f87171');
      setMarginPosition(pageItem.marginPosition !== undefined ? pageItem.marginPosition : 75);
      setMarginPositionLeft(pageItem.marginPositionLeft !== undefined ? pageItem.marginPositionLeft : (pageItem.marginPosition !== undefined ? pageItem.marginPosition : 75));
      setMarginPositionRight(pageItem.marginPositionRight !== undefined ? pageItem.marginPositionRight : (pageItem.marginPosition !== undefined ? pageItem.marginPosition : 75));
      setMarginPositionTop(pageItem.marginPositionTop !== undefined ? pageItem.marginPositionTop : 60);
      setMarginPositionBottom(pageItem.marginPositionBottom !== undefined ? pageItem.marginPositionBottom : 60);
      setHasHorizontalMargin(!!pageItem.hasHorizontalMargin);
      setMarginStyle(pageItem.marginStyle || 'solid');
      setMarginSide(pageItem.marginSide || 'left');
      setHtmlContent(pageItem.formattedHtml || '');
      setInitialHtml(pageItem.formattedHtml || '');
      setCustomMargins(pageItem.customMargins || []);
      
      const sizeDef = sizePixels[mappedSize];
      setCustomWidth(pageItem.customWidth || sizeDef.width);
      setCustomHeight(pageItem.customHeight || sizeDef.height);
      
      if (editorRef.current) {
        editorRef.current.innerHTML = pageItem.formattedHtml || '';
      }

      setLeftMarginContent(pageItem.leftMarginHtml || '');
      if (leftMarginRef.current) {
        leftMarginRef.current.innerHTML = pageItem.leftMarginHtml || '';
      }
      setRightMarginContent(pageItem.rightMarginHtml || '');
      if (rightMarginRef.current) {
        rightMarginRef.current.innerHTML = pageItem.rightMarginHtml || '';
      }
      setTopMarginContent(pageItem.topMarginHtml || '');
      if (topMarginRef.current) {
        topMarginRef.current.innerHTML = pageItem.topMarginHtml || '';
      }
      setBottomMarginContent(pageItem.bottomMarginHtml || '');
      if (bottomMarginRef.current) {
        bottomMarginRef.current.innerHTML = pageItem.bottomMarginHtml || '';
      }
    }
  }, [pageItem?.id, pageItem?.pageSize, pageItem?.customWidth, pageItem?.customHeight]);

  const savePageChanges = (updates: Partial<Notepaper>) => {
    if (!pageItem) return;
    onUpdatePage({
      ...pageItem,
      ...updates
    });
  };

  const handleAddStickyNote = () => {
    if (!pageItem) return;
    const currentNotes = pageItem.stickyNotes || [];
    const newNote = {
      id: `sticky-${Date.now()}`,
      text: '',
      x: 150 + (currentNotes.length * 15),
      y: 200 + (currentNotes.length * 15),
      width: 160,
      height: 160,
      color: 'bg-[#fef9c3] border-[#fef08a] text-yellow-950',
      shape: 'square' as const,
      createdAt: Date.now()
    };
    savePageChanges({ stickyNotes: [...currentNotes, newNote] });
  };

  const handleUpdateStickyNote = (id: string, updates: Partial<any>) => {
    if (!pageItem) return;
    const updatedNotes = (pageItem.stickyNotes || []).map(note =>
      note.id === id ? { ...note, ...updates } : note
    );
    savePageChanges({ stickyNotes: updatedNotes });
  };

  const handleDeleteStickyNote = (id: string) => {
    if (!pageItem) return;
    const updatedNotes = (pageItem.stickyNotes || []).filter(note => note.id !== id);
    savePageChanges({ stickyNotes: updatedNotes });
  };

  const exportToPDF = async () => {
    const element = document.getElementById('scroll-paper-body');
    if (!element || !pageItem) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2, // crisp quality
        useCORS: true,
        backgroundColor: '#fdfbf7', // vintage paper color
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${pageItem.title || 'untitled-page'}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF: ', error);
      alert('Could not export to PDF. Please try again.');
    }
  };

  const addCustomMargin = (type: 'vertical-left' | 'vertical-right' | 'horizontal-top' | 'horizontal-bottom') => {
    const newMargin: CustomMargin = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      position: 120
    };
    const updated = [...customMargins, newMargin];
    setCustomMargins(updated);
    savePageChanges({ customMargins: updated });
  };

  const removeCustomMargin = (id: string) => {
    const updated = customMargins.filter(m => m.id !== id);
    setCustomMargins(updated);
    savePageChanges({ customMargins: updated });
  };

  const handleStartDrag = (e: React.PointerEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    setDraggingId(id);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingId) return;
    const container = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - container.left;
    const y = e.clientY - container.top;
    
    let newValue = 0;
    
    if (draggingId === 'left') {
      newValue = Math.max(15, Math.min(300, Math.round(x)));
      setMarginPositionLeft(newValue);
      savePageChanges({ marginPositionLeft: newValue, marginPosition: newValue });
    } else if (draggingId === 'right') {
      newValue = Math.max(15, Math.min(300, Math.round(container.width - x)));
      setMarginPositionRight(newValue);
      savePageChanges({ marginPositionRight: newValue });
    } else if (draggingId === 'top') {
      newValue = Math.max(15, Math.min(300, Math.round(y)));
      setMarginPositionTop(newValue);
      savePageChanges({ marginPositionTop: newValue });
    } else if (draggingId === 'bottom') {
      newValue = Math.max(15, Math.min(300, Math.round(container.height - y)));
      setMarginPositionBottom(newValue);
      savePageChanges({ marginPositionBottom: newValue });
    } else if (draggingId.startsWith('custom-')) {
      const margin = customMargins.find(m => m.id === draggingId);
      if (margin) {
        if (margin.type === 'vertical-left') {
          newValue = Math.max(15, Math.min(container.width - 15, Math.round(x)));
        } else if (margin.type === 'vertical-right') {
          newValue = Math.max(15, Math.min(container.width - 15, Math.round(container.width - x)));
        } else if (margin.type === 'horizontal-top') {
          newValue = Math.max(15, Math.min(container.height - 15, Math.round(y)));
        } else if (margin.type === 'horizontal-bottom') {
          newValue = Math.max(15, Math.min(container.height - 15, Math.round(container.height - y)));
        }
        
        const updated = customMargins.map(m => m.id === draggingId ? { ...m, position: newValue } : m);
        setCustomMargins(updated);
        savePageChanges({ customMargins: updated });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  const handleTextChange = (e: React.FormEvent<HTMLDivElement>) => {
    const val = e.currentTarget.innerHTML;
    setHtmlContent(val);
    savePageChanges({ formattedHtml: val });
  };

  const handleUndo = () => {
    try {
      document.execCommand('undo', false);
    } catch (err) {
      console.warn('Undo action failed', err);
    }
  };

  const handleRedo = () => {
    try {
      document.execCommand('redo', false);
    } catch (err) {
      console.warn('Redo action failed', err);
    }
  };

  const handleLeftMarginChange = (e: React.FormEvent<HTMLDivElement>) => {
    const val = e.currentTarget.innerHTML;
    setLeftMarginContent(val);
    savePageChanges({ leftMarginHtml: val });
  };

  const handleRightMarginChange = (e: React.FormEvent<HTMLDivElement>) => {
    const val = e.currentTarget.innerHTML;
    setRightMarginContent(val);
    savePageChanges({ rightMarginHtml: val });
  };

  const handleTopMarginChange = (e: React.FormEvent<HTMLDivElement>) => {
    const val = e.currentTarget.innerHTML;
    setTopMarginContent(val);
    savePageChanges({ topMarginHtml: val });
  };

  const handleBottomMarginChange = (e: React.FormEvent<HTMLDivElement>) => {
    const val = e.currentTarget.innerHTML;
    setBottomMarginContent(val);
    savePageChanges({ bottomMarginHtml: val });
  };

  // Insert Rich Formatted Tables
  const handleInsertTable = () => {
    if (!pageItem) return;
    const currentTables = pageItem.tables || [];
    const newTable: TableData = {
      headers: ['Concept', 'Scribe Notes', 'Status'],
      rows: [
        ['Example Ledger', 'Enter text...', 'Pending'],
        ['Draft Section', 'Enter text...', 'Drafted']
      ]
    };
    savePageChanges({ tables: [...currentTables, newTable] });
  };

  const handleUpdateTableCell = (tableIndex: number, rowIndex: number, colIndex: number, val: string) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    updatedTables[tableIndex].rows[rowIndex][colIndex] = val;
    savePageChanges({ tables: updatedTables });
  };

  const handleUpdateTableHeader = (tableIndex: number, colIndex: number, val: string) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    updatedTables[tableIndex].headers[colIndex] = val;
    savePageChanges({ tables: updatedTables });
  };

  const handleAddTableRow = (tableIndex: number) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    const colCount = updatedTables[tableIndex].headers.length;
    updatedTables[tableIndex].rows.push(Array(colCount).fill(''));
    savePageChanges({ tables: updatedTables });
  };

  const handleAddTableCol = (tableIndex: number) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    updatedTables[tableIndex].headers.push(`Header ${updatedTables[tableIndex].headers.length + 1}`);
    updatedTables[tableIndex].rows = updatedTables[tableIndex].rows.map(row => [...row, '']);
    savePageChanges({ tables: updatedTables });
  };

  const handleDeleteTableRow = (tableIndex: number, rowIndex: number) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    updatedTables[tableIndex].rows.splice(rowIndex, 1);
    savePageChanges({ tables: updatedTables });
  };

  const handleDeleteTableCol = (tableIndex: number, colIndex: number) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    updatedTables[tableIndex].headers.splice(colIndex, 1);
    updatedTables[tableIndex].rows = updatedTables[tableIndex].rows.map(row => {
      const newRow = [...row];
      newRow.splice(colIndex, 1);
      return newRow;
    });
    // Adjust cellStyles indices if needed, otherwise clear cellStyles to avoid keys being misaligned
    updatedTables[tableIndex].cellStyles = {};
    savePageChanges({ tables: updatedTables });
  };

  const handleUpdateTableCellFormat = (tableIndex: number, rowIndex: number, colIndex: number, format: any) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    const tbl = updatedTables[tableIndex];
    if (!tbl.cellStyles) tbl.cellStyles = {};
    const key = `${rowIndex}-${colIndex}`;
    tbl.cellStyles[key] = { ...tbl.cellStyles[key], ...format };
    savePageChanges({ tables: updatedTables });
  };

  const handleUpdateTableRowStyle = (tableIndex: number, rowIndex: number, style: any) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    const tbl = updatedTables[tableIndex];
    if (!tbl.rowStyles) tbl.rowStyles = {};
    tbl.rowStyles[rowIndex] = { ...tbl.rowStyles[rowIndex], ...style };
    savePageChanges({ tables: updatedTables });
  };

  const handleUpdateTableColStyle = (tableIndex: number, colIndex: number, style: any) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    const tbl = updatedTables[tableIndex];
    if (!tbl.colStyles) tbl.colStyles = {};
    tbl.colStyles[colIndex] = { ...tbl.colStyles[colIndex], ...style };
    savePageChanges({ tables: updatedTables });
  };

  const handleUpdateTableStyleConfig = (tableIndex: number, config: any) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = [...pageItem.tables];
    const tbl = updatedTables[tableIndex];
    tbl.styleConfig = { ...tbl.styleConfig, ...config };
    savePageChanges({ tables: updatedTables });
  };

  const handleDeleteTable = (tableIndex: number) => {
    if (!pageItem || !pageItem.tables) return;
    const updatedTables = pageItem.tables.filter((_, i) => i !== tableIndex);
    savePageChanges({ tables: updatedTables });
  };

  // Insert stylized vector charts
  const handleInsertChart = () => {
    if (!pageItem) return;
    const currentCharts = pageItem.charts || [];
    const newChart: ChartData = {
      title: 'Historical Scribing Statistics',
      type: 'bar',
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      values: [6, 14, 8, 22, 19]
    };
    savePageChanges({ charts: [...currentCharts, newChart] });
  };

  const handleUpdateChartValue = (chartIndex: number, labelIndex: number, val: number) => {
    if (!pageItem || !pageItem.charts) return;
    const updatedCharts = [...pageItem.charts];
    updatedCharts[chartIndex].values[labelIndex] = val;
    savePageChanges({ charts: updatedCharts });
  };

  const handleUpdateChartType = (chartIndex: number, type: 'bar' | 'line' | 'pie') => {
    if (!pageItem || !pageItem.charts) return;
    const updatedCharts = [...pageItem.charts];
    updatedCharts[chartIndex].type = type;
    savePageChanges({ charts: updatedCharts });
  };

  const handleDeleteChart = (chartIndex: number) => {
    if (!pageItem || !pageItem.charts) return;
    const updatedCharts = pageItem.charts.filter((_, i) => i !== chartIndex);
    savePageChanges({ charts: updatedCharts });
  };

  // Insert Geometric outlines (vintage aesthetic shapes)
  const handleInsertShape = (type: 'rectangle' | 'circle' | 'line' | 'arrow') => {
    if (!pageItem) return;
    const currentShapes = pageItem.shapes || [];
    const newShape: ShapeElement = {
      id: `shape-${Date.now()}`,
      type,
      x: 50 + (currentShapes.length * 20),
      y: 120 + (currentShapes.length * 20),
      width: type === 'line' || type === 'arrow' ? 200 : 120,
      height: type === 'line' || type === 'arrow' ? 5 : 80,
      color: '#8c2522', // antique ink maroon
      strokeWidth: 2,
      fill: 'transparent'
    };
    savePageChanges({ shapes: [...currentShapes, newShape] });
  };

  const handleDeleteShape = (shapeId: string) => {
    if (!pageItem || !pageItem.shapes) return;
    const updatedShapes = pageItem.shapes.filter(s => s.id !== shapeId);
    savePageChanges({ shapes: updatedShapes });
  };

  // Text Selection tool triggers
  const applyStyle = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    const updates: Partial<Notepaper> = {};
    
    const editor = document.getElementById('vintage-content-editor');
    if (editor) {
      setHtmlContent(editor.innerHTML);
      updates.formattedHtml = editor.innerHTML;
    }
    const leftEditor = document.getElementById('vintage-left-margin-editor');
    if (leftEditor) {
      setLeftMarginContent(leftEditor.innerHTML);
      updates.leftMarginHtml = leftEditor.innerHTML;
    }
    const rightEditor = document.getElementById('vintage-right-margin-editor');
    if (rightEditor) {
      setRightMarginContent(rightEditor.innerHTML);
      updates.rightMarginHtml = rightEditor.innerHTML;
    }
    const topEditor = document.getElementById('vintage-top-margin-editor');
    if (topEditor) {
      setTopMarginContent(topEditor.innerHTML);
      updates.topMarginHtml = topEditor.innerHTML;
    }
    const bottomEditor = document.getElementById('vintage-bottom-margin-editor');
    if (bottomEditor) {
      setBottomMarginContent(bottomEditor.innerHTML);
      updates.bottomMarginHtml = bottomEditor.innerHTML;
    }
    
    savePageChanges(updates);
  };

  const applyCustomFont = (style: 'serif' | 'display' | 'cursive' | 'mono') => {
    setFontStyle(style);
    let fontFamily = 'var(--font-serif)';
    if (style === 'display') fontFamily = 'var(--font-display)';
    if (style === 'cursive') fontFamily = 'var(--font-cursive)';
    if (style === 'mono') fontFamily = 'var(--font-mono)';
    applyStyle('fontName', fontFamily);
  };

  const applyCustomColor = (color: string) => {
    setTextColor(color);
    applyStyle('foreColor', color);
  };

  const applyHighlight = (color: string) => {
    setActiveHighlight(color);
    applyStyle('backColor', color);
  };

  if (!pageItem) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#fdfbf7] p-8 text-center font-serif">
        <div className="max-w-md rounded-md border border-[#ebdcb9] bg-[#fcf8f2] p-8 shadow-xs">
          <FileText className="mx-auto h-12 w-12 text-[#ebdcb9] mb-4" />
          <h2 className="font-display text-xl font-bold text-[#3e2723] mb-2">No Page Selected</h2>
          <p className="text-xs text-[#5c4033] leading-relaxed mb-4">
            Create or select a notepaper leaf to start scribing list notes, chapters, diagrams, and editable charts with a classic parchment finish.
          </p>
        </div>
      </div>
    );
  }

  // Map font styles for selection
  const fontStyles = [
    { key: 'serif', label: 'Aged Serif (EB Garamond)', class: 'font-serif' },
    { key: 'display', label: 'Vintage Display (Playfair)', class: 'font-display font-medium' },
    { key: 'cursive', label: 'Feather Pen (Cursive)', class: 'font-cursive text-lg' },
    { key: 'mono', label: 'Scribe Monospace', class: 'font-mono' }
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#faf4eb] overflow-hidden font-serif">
      {/* RICH TEXT RIBBON TOOLBAR & CONTROLS */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-y-2 border-b border-[#e2d6c5] bg-[#fcf8f2] px-6 py-2 shadow-2xs">
        
        {/* Style selection */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Font selection */}
          <div className="flex items-center gap-1 bg-white border border-[#ebdcb9] rounded px-1.5 py-1">
            <Type className="h-3.5 w-3.5 text-[#5c4033]" />
            <select
              value={fontStyle}
              onChange={e => applyCustomFont(e.target.value as any)}
              className="bg-transparent outline-none font-semibold text-[#5c4033] cursor-pointer"
            >
              {fontStyles.map(f => (
                <option key={f.key} value={f.key} className={f.class}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sizing dropdown */}
          <div className="flex items-center gap-1 bg-white border border-[#ebdcb9] rounded px-1.5 py-1">
            <span className="text-[10px] font-bold text-[#5c4033]">SIZE:</span>
            <select
              value={fontSize}
              onChange={e => {
                setFontSize(e.target.value);
                applyStyle('fontSize', e.target.value === '14px' ? '3' : e.target.value === '18px' ? '5' : '4');
              }}
              className="bg-transparent outline-none font-semibold text-[#5c4033] cursor-pointer"
            >
              <option value="14px">Small (14px)</option>
              <option value="16px">Medium (16px)</option>
              <option value="18px">Great (18px)</option>
              <option value="24px">Display (24px)</option>
            </select>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center border border-[#ebdcb9] rounded bg-white overflow-hidden">
            <button
              onClick={() => {
                setIsBold(!isBold);
                applyStyle('bold');
              }}
              className={`p-1 select-none border-r border-[#ebdcb9] ${isBold ? 'bg-[#5c4033] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'}`}
              title="Gothic Bold"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setIsItalic(!isItalic);
                applyStyle('italic');
              }}
              className={`p-1 select-none border-r border-[#ebdcb9] ${isItalic ? 'bg-[#5c4033] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'}`}
              title="Italic Swash"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => {
                setIsUnderline(!isUnderline);
                applyStyle('underline');
              }}
              className={`p-1 select-none ${isUnderline ? 'bg-[#5c4033] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'}`}
              title="Underline Ink"
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Ink Paint Tints */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[10px] font-bold text-[#5c4033] uppercase">Ink:</span>
          {['#333333', '#1a2d54', '#8c2522', '#3b5220', '#5c4033'].map(col => (
            <button
              key={col}
              onClick={() => applyCustomColor(col)}
              className="w-4 h-4 rounded-full border border-black/10 transition-transform hover:scale-110"
              style={{ backgroundColor: col }}
              title={`Switch ink to ${col}`}
            />
          ))}

          <span className="text-[10px] font-bold text-[#5c4033] uppercase ml-1.5">Muted Tint:</span>
          {['rgba(255, 235, 59, 0.4)', 'rgba(76, 175, 80, 0.3)', 'rgba(33, 150, 243, 0.25)', 'transparent'].map(col => (
            <button
              key={col}
              onClick={() => applyHighlight(col)}
              className="w-4 h-4 border border-[#ebdcb9] transition-transform hover:scale-110 rounded-xs"
              style={{ backgroundColor: col === 'transparent' ? '#fff' : col }}
              title={col === 'transparent' ? 'No highlight wrap' : 'Highlight selection'}
            />
          ))}
        </div>

        {/* Paper & Page styling controls */}
        <div className="flex flex-col gap-1.5 text-xs relative select-none">
          {/* Keep the undo/redo button row ABOVE the page shape changing slot */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUndo}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 font-bold transition-all cursor-pointer border text-[11px] bg-red-50 border-[#8c2522] text-[#8c2522] hover:bg-red-100 shadow-2xs"
              title="Undo last text edit"
            >
              <span className="text-sm">↩</span>
              <span>Undo Text</span>
            </button>
            <button
              type="button"
              onClick={handleRedo}
              className="flex items-center gap-1.5 rounded px-2.5 py-1 font-bold transition-all cursor-pointer border text-[11px] bg-red-50 border-[#8c2522] text-[#8c2522] hover:bg-red-100 shadow-2xs"
              title="Redo last text edit"
            >
              <span>Redo Text</span>
              <span className="text-sm">↪</span>
            </button>
          </div>

          {/* The page shape slot itself */}
          <div className="flex flex-wrap items-center gap-1.5 rounded border border-[#ebdcb9] bg-white px-2.5 py-1.5 text-[#5c4033]">
            <div className="flex items-center gap-1">
              <Settings className="h-3.5 w-3.5" />
              <select
                value={pageSize}
                onChange={e => {
                  const s = e.target.value as PageSize;
                  setPageSize(s);
                  const sizeDef = sizePixels[s] || { width: 800, height: 1131 };
                  setCustomWidth(sizeDef.width);
                  setCustomHeight(sizeDef.height);
                  savePageChanges({
                    pageSize: s,
                    customWidth: sizeDef.width,
                    customHeight: sizeDef.height
                  } as any);
                }}
                className="bg-transparent outline-none font-bold"
              >
                <option value="Portrait">Portrait (1 : 1.414)</option>
                <option value="Landscape">Landscape (1.414 : 1)</option>
              </select>
            </div>

            {/* Custom Length and Width Sliders */}
            <div className="flex items-center gap-1.5 border-l border-[#ebdcb9] pl-2 flex-wrap text-[#5c4033]">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase text-[#8c2522]">Width:</span>
                <input
                  type="text"
                  maxLength={4}
                  value={customWidth}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    const w = Number(val) || 300;
                    const h = Math.round(pageSize === 'Portrait' ? w * 1.414 : w / 1.414);
                    setCustomWidth(w);
                    setCustomHeight(h);
                    savePageChanges({ customWidth: w, customHeight: h } as any);
                  }}
                  className="w-10 bg-transparent outline-none font-bold font-mono text-center border-b border-[#ebdcb9]/60"
                  placeholder="Width"
                />
                <input
                  type="range"
                  min={300}
                  max={1650}
                  value={customWidth}
                  onChange={e => {
                    const w = Number(e.target.value);
                    const h = Math.round(pageSize === 'Portrait' ? w * 1.414 : w / 1.414);
                    setCustomWidth(w);
                    setCustomHeight(h);
                    savePageChanges({ customWidth: w, customHeight: h } as any);
                  }}
                  className="w-16 accent-[#8c2522] cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 border-l border-[#ebdcb9]/45 pl-1.5">
                <span className="text-[10px] font-bold uppercase text-[#8c2522]">Length:</span>
                <input
                  type="text"
                  maxLength={4}
                  value={customHeight}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    const h = Number(val) || 400;
                    const w = Math.round(pageSize === 'Portrait' ? h / 1.414 : h * 1.414);
                    setCustomWidth(w);
                    setCustomHeight(h);
                    savePageChanges({ customWidth: w, customHeight: h } as any);
                  }}
                  className="w-10 bg-transparent outline-none font-bold font-mono text-center border-b border-[#ebdcb9]/60"
                  placeholder="Length"
                />
                <input
                  type="range"
                  min={400}
                  max={2250}
                  value={customHeight}
                  onChange={e => {
                    const h = Number(e.target.value);
                    const w = Math.round(pageSize === 'Portrait' ? h / 1.414 : h * 1.414);
                    setCustomWidth(w);
                    setCustomHeight(h);
                    savePageChanges({ customWidth: w, customHeight: h } as any);
                  }}
                  className="w-16 accent-[#8c2522] cursor-pointer"
                />
              </div>
            </div>

            <select
              value={paperStyle}
              onChange={e => {
                const p = e.target.value as PaperStyle;
                setPaperStyle(p);
                savePageChanges({ paperStyle: p });
              }}
              className="bg-transparent outline-none font-bold border-l border-[#ebdcb9] pl-1.5"
            >
              <option value="unruled">Blank Parchment</option>
              <option value="ruled">Ruled Lines</option>
              <option value="grid">Grid Pattern</option>
            </select>

            <label className="flex items-center gap-1 border-l border-[#ebdcb9] pl-1.5 cursor-pointer font-bold select-none">
              <input
                type="checkbox"
                checked={hasMargin}
                onChange={e => {
                  const m = e.target.checked;
                  setHasMargin(m);
                  savePageChanges({ hasMargin: m });
                }}
                className="rounded accent-[#8c2522]"
              />
              <span>Margin</span>
            </label>
            {hasMargin && (
              <button
                type="button"
                onClick={() => setShowMarginStyles(!showMarginStyles)}
                className={`ml-1 p-1 rounded-sm border transition-colors select-none ${
                  showMarginStyles 
                    ? 'bg-[#5c4033] text-white border-[#5c4033]' 
                    : 'bg-white text-[#5c4033] border-[#ebdcb9] hover:bg-[#faf4eb]'
                }`}
                title="Format Guidelines"
              >
                <Sliders className="h-3 w-3" />
              </button>
            )}
          </div>

        </div>

          {/* Scriptorium Antique Zoom Controls */}
          <div className="flex items-center gap-1.5 border-l border-[#ebdcb9] pl-3 text-xs select-none">
            <span className="text-[10px] font-bold text-[#5c4033] uppercase font-mono">Zoom:</span>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.max(0.5, Number((prev - 0.1).toFixed(1))))}
              className="p-1 rounded bg-[#faf4eb] hover:bg-[#ebdcb9] border border-[#ebdcb9]/60 font-bold hover:scale-105 active:scale-95 transition-all w-6 h-6 flex items-center justify-center text-xs text-[#5c4033] cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
            <span className="font-mono text-[11px] text-[#5c4033] min-w-[34px] text-center font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(prev => Math.min(2.5, Number((prev + 0.1).toFixed(1))))}
              className="p-1 rounded bg-[#faf4eb] hover:bg-[#ebdcb9] border border-[#ebdcb9]/60 font-bold hover:scale-105 active:scale-95 transition-all w-6 h-6 flex items-center justify-center text-xs text-[#5c4033] cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(1.0)}
              className="p-1 px-1.5 text-[9px] rounded bg-[#faf4eb] hover:bg-[#ebdcb9] border border-[#ebdcb9]/60 uppercase font-bold text-[#8c2522] cursor-pointer"
              title="Reset Zoom"
            >
              Reset
            </button>
          </div>

          {/* Sticky Notes Button */}
          <div className="border-l border-[#ebdcb9] pl-3 h-full flex items-center">
            <button
              type="button"
              onClick={handleAddStickyNote}
              disabled={!pageItem}
              className="flex items-center gap-1 p-1 px-2 pb-1.5 bg-amber-500/10 border border-amber-600/30 text-amber-900 hover:bg-amber-500/25 rounded shadow-xs text-[11px] font-semibold cursor-pointer select-none transition-all disabled:opacity-50"
              title="Add customizable Sticky Note onto this note page"
            >
              <span className="text-amber-700">📌</span>
              <span>Add Sticky Note</span>
            </button>
          </div>

          {/* Export strictly to PDF */}
          <div className="border-l border-[#ebdcb9] pl-3 h-full flex items-center">
            <button
              type="button"
              onClick={exportToPDF}
              disabled={!pageItem}
              className="flex items-center gap-1.5 p-1 px-2.5 pb-1.5 bg-[#8c2522]/10 border border-[#8c2522]/35 text-[#8c2522] hover:bg-[#8c2522]/25 rounded shadow-xs text-[11px] font-bold cursor-pointer select-none transition-all disabled:opacity-50"
              title="Export this page strictly in PDF format"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export PDF</span>
            </button>
          </div>

          {/* Floated Scribe Guidelines Formatting Panel */}
          {hasMargin && showMarginStyles && (
            <div className="absolute top-10 right-0 z-50 w-72 rounded-md border border-[#ebdcb9] bg-white p-4 shadow-lg text-xs flex flex-col gap-3 font-serif max-h-[420px] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-[#ebdcb9]/55 pb-1.5 font-bold text-[#3e2723] uppercase text-[10px]">
                <span>📐 Format Margin Guidelines</span>
                <button 
                  type="button"
                  onClick={() => setShowMarginStyles(false)} 
                  className="text-[#a1887f] hover:text-[#3e2723] font-bold text-center"
                >
                  ✕
                </button>
              </div>
              
              {/* Margin Side Alignment */}
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[#5c4033]">Vertical Alignment:</span>
                <div className="grid grid-cols-3 gap-1 bg-[#faf4eb] p-0.5 rounded-sm">
                  {(['left', 'right', 'both'] as const).map(side => (
                    <button
                      key={side}
                      type="button"
                      onClick={() => {
                        setMarginSide(side);
                        savePageChanges({ marginSide: side });
                      }}
                      className={`py-1 text-[10px] uppercase font-bold rounded-xs transition-colors ${
                        marginSide === side 
                          ? 'bg-[#3e2723] text-white shadow-2xs' 
                          : 'text-[#5c4033] hover:bg-[#ebdcb9]/40'
                      }`}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              </div>

              {/* Left Margin Position Slider */}
              {marginSide !== 'right' && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#5c4033]">
                    <span>Left Margin Indent:</span>
                    <span className="text-[#8c2522]">{marginPositionLeft}px</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={180}
                    value={marginPositionLeft}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMarginPositionLeft(v);
                      savePageChanges({ marginPositionLeft: v, marginPosition: v });
                    }}
                    className="w-full cursor-pointer accent-[#8c2522]"
                  />
                </div>
              )}

              {/* Right Margin Position Slider */}
              {marginSide !== 'left' && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#5c4033]">
                    <span>Right Margin Indent:</span>
                    <span className="text-[#8c2522]">{marginPositionRight}px</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={180}
                    value={marginPositionRight}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMarginPositionRight(v);
                      savePageChanges({ marginPositionRight: v });
                    }}
                    className="w-full cursor-pointer accent-[#8c2522]"
                  />
                </div>
              )}

              {/* Horizontal Guidelines Checkbox */}
              <div className="flex items-center gap-2 border-t border-[#ebdcb9]/40 pt-2 pb-1">
                <input
                  type="checkbox"
                  id="has-horizontal-margin"
                  checked={hasHorizontalMargin}
                  onChange={e => {
                    const checked = e.target.checked;
                    setHasHorizontalMargin(checked);
                    savePageChanges({ hasHorizontalMargin: checked });
                  }}
                  className="rounded accent-[#8c2522] cursor-pointer"
                />
                <label htmlFor="has-horizontal-margin" className="font-bold text-[#5c4033] cursor-pointer select-none">
                  Enable Horizontal Margins
                </label>
              </div>

              {/* Top Margin Position Slider */}
              {hasHorizontalMargin && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#5c4033]">
                    <span>Top Margin Indent:</span>
                    <span className="text-[#8c2522]">{marginPositionTop}px</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={180}
                    value={marginPositionTop}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMarginPositionTop(v);
                      savePageChanges({ marginPositionTop: v });
                    }}
                    className="w-full cursor-pointer accent-[#8c2522]"
                  />
                </div>
              )}

              {/* Bottom Margin Position Slider */}
              {hasHorizontalMargin && (
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between font-bold text-[#5c4033]">
                    <span>Bottom Margin Indent:</span>
                    <span className="text-[#8c2522]">{marginPositionBottom}px</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={180}
                    value={marginPositionBottom}
                    onChange={e => {
                      const v = Number(e.target.value);
                      setMarginPositionBottom(v);
                      savePageChanges({ marginPositionBottom: v });
                    }}
                    className="w-full cursor-pointer accent-[#8c2522]"
                  />
                </div>
              )}

              {/* Margin Line Style */}
              <div className="flex flex-col gap-1 border-t border-[#ebdcb9]/40 pt-2">
                <span className="font-bold text-[#5c4033]">Guideline Line Pattern:</span>
                <div className="grid grid-cols-4 gap-1 bg-[#faf4eb] p-0.5 rounded-sm">
                  {(['solid', 'dashed', 'dotted', 'double'] as const).map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        setMarginStyle(style);
                        savePageChanges({ marginStyle: style });
                      }}
                      className={`py-1 text-[9px] uppercase font-bold rounded-xs transition-colors ${
                        marginStyle === style 
                          ? 'bg-[#3e2723] text-white font-bold' 
                          : 'text-[#5c4033] hover:bg-[#ebdcb9]/40'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Ink Pigment */}
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[#5c4033]">Guidelines Ink Dye:</span>
                <div className="flex items-center gap-2 mt-1">
                  {[
                    { hex: '#f87171', name: 'Classic Red' },
                    { hex: '#d97706', name: 'Amber Sepia' },
                    { hex: '#3b82f6', name: 'Ink Blue' },
                    { hex: '#4b5563', name: 'Charcoal' },
                    { hex: '#10b981', name: 'Sage Green' }
                  ].map(col => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => {
                        setMarginColor(col.hex);
                        savePageChanges({ marginColor: col.hex });
                      }}
                      title={col.name}
                      className={`w-6 h-6 rounded-full border border-black/10 transition-transform ${
                        marginColor === col.hex ? 'scale-115 ring-2 ring-[#3e2723] ring-offset-1' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Add Custom Margin Guidelines */}
              <div className="flex flex-col gap-1.5 border-t border-[#ebdcb9]/40 pt-2 pb-1 text-xs">
                <span className="font-bold text-[#5c4033]">➕ Add Extra Guidelines:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => addCustomMargin('vertical-left')}
                    className="py-1 px-1.5 bg-[#faf4eb] hover:bg-[#ebdcb9]/30 rounded text-[10px] text-[#5c4033] font-serif border border-[#ebdcb9]/60 flex items-center justify-center gap-1"
                  >
                    <span>│ Left Guide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addCustomMargin('vertical-right')}
                    className="py-1 px-1.5 bg-[#faf4eb] hover:bg-[#ebdcb9]/30 rounded text-[10px] text-[#5c4033] font-serif border border-[#ebdcb9]/60 flex items-center justify-center gap-1"
                  >
                    <span>│ Right Guide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addCustomMargin('horizontal-top')}
                    className="py-1 px-1.5 bg-[#faf4eb] hover:bg-[#ebdcb9]/30 rounded text-[10px] text-[#5c4033] font-serif border border-[#ebdcb9]/60 flex items-center justify-center gap-1"
                  >
                    <span>─ Top Guide</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addCustomMargin('horizontal-bottom')}
                    className="py-1 px-1.5 bg-[#faf4eb] hover:bg-[#ebdcb9]/30 rounded text-[10px] text-[#5c4033] font-serif border border-[#ebdcb9]/60 flex items-center justify-center gap-1"
                  >
                    <span>─ Bottom Guide</span>
                  </button>
                </div>
              </div>

              {/* List of Custom Guidelines for Deletion */}
              {customMargins.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-[#ebdcb9]/40 pt-2 max-h-[140px] overflow-y-auto">
                  <span className="font-bold text-[#5c4033]">Active Custom Guidelines:</span>
                  <div className="flex flex-col gap-1">
                    {customMargins.map((m, idx) => (
                      <div key={m.id} className="flex justify-between items-center bg-[#faf4eb] px-1.5 py-1 rounded border border-[#ebdcb9]/40 text-[10px] text-[#5c4033]">
                        <span>
                          {m.type === 'vertical-left' ? 'V-Left' : m.type === 'vertical-right' ? 'V-Right' : m.type === 'horizontal-top' ? 'H-Top' : 'H-Bottom'} ({m.position}px)
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCustomMargin(m.id)}
                          className="text-[#8c2522] hover:text-red-700 font-bold px-1"
                          title="Delete guideline"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Element inserters (shapes, charts, tables) */}
        <div className="flex items-center gap-1.5 border-l border-[#ebdcb9] pl-3">
          <button
            onClick={handleInsertTable}
            className="flex items-center gap-1 rounded bg-[#ffffff] border border-[#ebdcb9] px-2.5 py-1 text-xs font-semibold text-[#5c4033] hover:bg-[#faf4eb]"
            title="Insert Structured Table"
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>

          <button
            onClick={handleInsertChart}
            className="flex items-center gap-1 rounded bg-[#ffffff] border border-[#ebdcb9] px-2.5 py-1 text-xs font-semibold text-[#5c4033] hover:bg-[#faf4eb]"
            title="Insert SVG Vector Chart"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Chart</span>
          </button>

          {/* Shape inserters drop-down or shortcuts */}
          <div className="flex items-center border border-[#ebdcb9] rounded overflow-hidden bg-white">
            <button
              onClick={() => handleInsertShape('rectangle')}
              className="p-1 hover:bg-[#faf4eb] border-r border-[#ebdcb9] text-[#5c4033]"
              title="Place Sketch Rectangle"
            >
              <Square className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleInsertShape('circle')}
              className="p-1 hover:bg-[#faf4eb] border-r border-[#ebdcb9] text-[#5c4033]"
              title="Place Sketch Circle"
            >
              <Circle className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => handleInsertShape('line')}
              className="p-1 hover:bg-[#faf4eb] text-[#5c4033]"
              title="Place Underlining Line"
            >
              <ChevronsRight className="h-3.5 w-3.5 rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* COMPONENT BODY */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start vintage-scroll">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}>
          <div
            id="scroll-paper-body"
            className={`relative bg-[#fdfbf7] border-2 border-[#e2d6c5] shadow-md flex flex-col transition-all duration-300 ${
              draggingId ? 'select-none cursor-grabbing' : ''
            }`}
            style={{
              width: `${customWidth}px`,
              height: `${customHeight}px`,
              paddingLeft: hasMargin && marginSide !== 'right' ? `${marginPositionLeft + 24}px` : '48px',
              paddingRight: hasMargin && marginSide !== 'left' ? `${marginPositionRight + 24}px` : '48px',
              paddingTop: hasMargin && hasHorizontalMargin ? `${marginPositionTop + 24}px` : '48px',
              paddingBottom: hasMargin && hasHorizontalMargin ? `${marginPositionBottom + 48}px` : '64px',
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
          {/* Ruling Pattern */}
          {paperStyle !== 'unruled' && (
            <div className={`absolute inset-0 pointer-events-none opacity-45 z-0 ${
              paperStyle === 'ruled' ? 'paper-ruled' : 'paper-grid'
            }`} />
          )}

          {/* Margins Separate Editors (Side Scribbling Columns) */}
          {hasMargin && (marginSide === 'left' || marginSide === 'both') && (
            <div
              id="vintage-left-margin-editor"
              ref={leftMarginRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleLeftMarginChange}
              placeholder="Scribe side note..."
              className="absolute z-20 outline-none text-[#5c4033] hover:cursor-text text-lg leading-relaxed select-text overflow-y-auto px-1 empty:before:content-[attr(placeholder)] empty:before:text-[#ebdcb9] hover:empty:before:text-[#8c2522]/80 focus:empty:before:text-[#8c2522]/80 empty:before:font-serif empty:before:italic empty:before:text-xs"
              style={{
                left: '12px',
                width: `${marginPositionLeft - 22}px`,
                top: `${hasHorizontalMargin ? marginPositionTop + 20 : 120}px`,
                bottom: `${hasHorizontalMargin ? marginPositionBottom + 30 : 60}px`,
                fontFamily: 'var(--font-cursive), "Alex Brush", cursive',
                textAlign: 'left',
              }}
            />
          )}

          {hasMargin && (marginSide === 'right' || marginSide === 'both') && (
            <div
              id="vintage-right-margin-editor"
              ref={rightMarginRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleRightMarginChange}
              placeholder="Scribe side note..."
              className="absolute z-20 outline-none text-[#5c4033] hover:cursor-text text-lg leading-relaxed select-text overflow-y-auto px-1 empty:before:content-[attr(placeholder)] empty:before:text-[#ebdcb9] hover:empty:before:text-[#8c2522]/80 focus:empty:before:text-[#8c2522]/80 empty:before:font-serif empty:before:italic empty:before:text-xs"
              style={{
                right: '12px',
                width: `${marginPositionRight - 22}px`,
                top: `${hasHorizontalMargin ? marginPositionTop + 20 : 120}px`,
                bottom: `${hasHorizontalMargin ? marginPositionBottom + 30 : 60}px`,
                fontFamily: 'var(--font-cursive), "Alex Brush", cursive',
                textAlign: 'left',
              }}
            />
          )}

          {hasMargin && hasHorizontalMargin && (
            <div
              id="vintage-top-margin-editor"
              ref={topMarginRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleTopMarginChange}
              placeholder="Header annotation..."
              className="absolute z-20 outline-none text-[#5c4033] hover:cursor-text text-sm select-text overflow-hidden empty:before:content-[attr(placeholder)] empty:before:text-[#ebdcb9] hover:empty:before:text-[#8c2522]/80 focus:empty:before:text-[#8c2522]/80 empty:before:font-serif empty:before:italic empty:before:text-xs flex items-center justify-center"
              style={{
                top: '8px',
                height: `${marginPositionTop - 16}px`,
                left: `${marginSide !== 'right' ? marginPositionLeft + 24 : 48}px`,
                right: `${marginSide !== 'left' ? marginPositionRight + 24 : 48}px`,
                fontFamily: 'var(--font-serif), serif',
                textAlign: 'center',
                opacity: 0.8
              }}
            />
          )}

          {hasMargin && hasHorizontalMargin && (
            <div
              id="vintage-bottom-margin-editor"
              ref={bottomMarginRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleBottomMarginChange}
              placeholder="Footer annotation..."
              className="absolute z-20 outline-none text-[#5c4033] hover:cursor-text text-sm select-text overflow-hidden empty:before:content-[attr(placeholder)] empty:before:text-[#ebdcb9] hover:empty:before:text-[#8c2522]/80 focus:empty:before:text-[#8c2522]/80 empty:before:font-serif empty:before:italic empty:before:text-xs flex items-center justify-center"
              style={{
                bottom: '8px',
                height: `${marginPositionBottom - 16}px`,
                left: `${marginSide !== 'right' ? marginPositionLeft + 24 : 48}px`,
                right: `${marginSide !== 'left' ? marginPositionRight + 24 : 48}px`,
                fontFamily: 'var(--font-serif), serif',
                textAlign: 'center',
                opacity: 0.8
              }}
            />
          )}

          {/* Scribe Guideline Margin Line */}
          {hasMargin && (
            <>
              {/* Left Side line */}
              {marginSide !== 'right' && (
                <>
                  <div 
                    className="absolute top-0 bottom-0 z-0 pointer-events-none"
                    style={{
                      left: `${marginPositionLeft}px`,
                      width: marginStyle === 'double' ? '6px' : '2px',
                      borderLeft: marginStyle === 'double' ? `3px double ${marginColor}` : (marginStyle === 'dashed' ? `2px dashed ${marginColor}` : (marginStyle === 'dotted' ? `2px dotted ${marginColor}` : `1px solid ${marginColor}`)),
                      opacity: 0.65
                    }}
                  />
                  {/* Left Margin Interactive Drag Handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-3 cursor-col-resize z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center"
                    style={{ left: `${marginPositionLeft - 6}px` }}
                    onPointerDown={(e) => handleStartDrag(e, 'left')}
                    title="Drag to adjust left guideline margin"
                  >
                    <div className="w-[2px] h-8 bg-[#8c2522] opacity-0 group-hover:opacity-60 transition-opacity rounded-full" />
                  </div>
                </>
              )}
              {/* Right Side line */}
              {marginSide !== 'left' && (
                <>
                  <div 
                    className="absolute top-0 bottom-0 z-0 pointer-events-none"
                    style={{
                      right: `${marginPositionRight}px`,
                      width: marginStyle === 'double' ? '6px' : '2px',
                      borderRight: marginStyle === 'double' ? `3px double ${marginColor}` : (marginStyle === 'dashed' ? `2px dashed ${marginColor}` : (marginStyle === 'dotted' ? `2px dotted ${marginColor}` : `1px solid ${marginColor}`)),
                      opacity: 0.65
                    }}
                  />
                  {/* Right Margin Interactive Drag Handle */}
                  <div 
                    className="absolute top-0 bottom-0 w-3 cursor-col-resize z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center"
                    style={{ right: `${marginPositionRight - 6}px` }}
                    onPointerDown={(e) => handleStartDrag(e, 'right')}
                    title="Drag to adjust right guideline margin"
                  >
                    <div className="w-[2px] h-8 bg-[#8c2522] opacity-0 group-hover:opacity-60 transition-opacity rounded-full" />
                  </div>
                </>
              )}
              {/* Top Side line */}
              {hasHorizontalMargin && (
                <>
                  <div 
                    className="absolute left-0 right-0 z-0 pointer-events-none"
                    style={{
                      top: `${marginPositionTop}px`,
                      height: marginStyle === 'double' ? '6px' : '2px',
                      borderTop: marginStyle === 'double' ? `3px double ${marginColor}` : (marginStyle === 'dashed' ? `2px dashed ${marginColor}` : (marginStyle === 'dotted' ? `2px dotted ${marginColor}` : `1px solid ${marginColor}`)),
                      opacity: 0.65
                    }}
                  />
                  {/* Top Margin Interactive Drag Handle */}
                  <div 
                    className="absolute left-0 right-0 h-3 cursor-row-resize z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center"
                    style={{ top: `${marginPositionTop - 6}px` }}
                    onPointerDown={(e) => handleStartDrag(e, 'top')}
                    title="Drag to adjust top guideline margin"
                  >
                    <div className="h-[2px] w-8 bg-[#8c2522] opacity-0 group-hover:opacity-60 transition-opacity rounded-full" />
                  </div>
                </>
              )}
              {/* Bottom Side line */}
              {hasHorizontalMargin && (
                <>
                  <div 
                    className="absolute left-0 right-0 z-0 pointer-events-none"
                    style={{
                      bottom: `${marginPositionBottom}px`,
                      height: marginStyle === 'double' ? '6px' : '2px',
                      borderBottom: marginStyle === 'double' ? `3px double ${marginColor}` : (marginStyle === 'dashed' ? `2px dashed ${marginColor}` : (marginStyle === 'dotted' ? `2px dotted ${marginColor}` : `1px solid ${marginColor}`)),
                      opacity: 0.65
                    }}
                  />
                  {/* Bottom Margin Interactive Drag Handle */}
                  <div 
                    className="absolute left-0 right-0 h-3 cursor-row-resize z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center"
                    style={{ bottom: `${marginPositionBottom - 6}px` }}
                    onPointerDown={(e) => handleStartDrag(e, 'bottom')}
                    title="Drag to adjust bottom guideline margin"
                  >
                    <div className="h-[2px] w-8 bg-[#8c2522] opacity-0 group-hover:opacity-60 transition-opacity rounded-full" />
                  </div>
                </>
              )}
            </>
          )}

          {/* Multiple Custom Guidelines rendering */}
          {hasMargin && customMargins && customMargins.map(m => {
            let styleObj: React.CSSProperties = {};
            if (m.type === 'vertical-left') {
              styleObj = { left: `${m.position}px`, width: marginStyle === 'double' ? '6px' : '2px', top: 0, bottom: 0 };
            } else if (m.type === 'vertical-right') {
              styleObj = { right: `${m.position}px`, width: marginStyle === 'double' ? '6px' : '2px', top: 0, bottom: 0 };
            } else if (m.type === 'horizontal-top') {
              styleObj = { top: `${m.position}px`, height: marginStyle === 'double' ? '6px' : '2px', left: 0, right: 0 };
            } else if (m.type === 'horizontal-bottom') {
              styleObj = { bottom: `${m.position}px`, height: marginStyle === 'double' ? '6px' : '2px', left: 0, right: 0 };
            }
            
            const isVertical = m.type.startsWith('vertical');
            const borderProp = isVertical 
              ? (m.type === 'vertical-left' ? 'borderLeft' : 'borderRight') 
              : (m.type === 'horizontal-top' ? 'borderTop' : 'borderBottom');

            const borderVal = marginStyle === 'double' 
              ? `3px double ${marginColor}` 
              : (marginStyle === 'dashed' ? `2px dashed ${marginColor}` : (marginStyle === 'dotted' ? `2px dotted ${marginColor}` : `1px solid ${marginColor}`));

            return (
              <React.Fragment key={m.id}>
                {/* Decorative margin line */}
                <div 
                  className="absolute z-0 pointer-events-none"
                  style={{
                    ...styleObj,
                    [borderProp]: borderVal,
                    opacity: 0.65
                  }}
                />
                {/* Interactive Drag Handle */}
                <div 
                  className={`absolute z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center ${
                    isVertical ? 'top-0 bottom-0 w-3 cursor-col-resize justify-center' : 'left-0 right-0 h-3 cursor-row-resize items-center'
                  }`}
                  style={isVertical 
                    ? (m.type === 'vertical-left' ? { left: `${m.position - 6}px` } : { right: `${m.position - 6}px` })
                    : (m.type === 'horizontal-top' ? { top: `${m.position - 6}px` } : { bottom: `${m.position - 6}px` })
                  }
                  onPointerDown={(e) => handleStartDrag(e, m.id)}
                  onDoubleClick={() => removeCustomMargin(m.id)}
                  title="Drag to reposition / Double-click to dissolve custom guideline"
                >
                  <div className={`bg-[#8c2522] opacity-0 group-hover:opacity-60 transition-opacity rounded-full ${
                    isVertical ? 'w-[2px] h-8' : 'h-[2px] w-8'
                  }`} />
                </div>
              </React.Fragment>
            );
          })}

          {/* Heading */}
          <div className="relative z-10 mb-6 border-b border-[#ebdcb9] pb-3 flex justify-between items-end">
            <div className="flex-1">
              <input
                type="text"
                value={pageItem.title}
                onChange={e => savePageChanges({ title: e.target.value })}
                dir="ltr"
                style={{ textAlign: 'left' }}
                className="w-full bg-transparent font-display text-2.5xl font-bold text-[#3e2723] outline-none border-b border-transparent hover:border-[#ebdcb9] focus:border-[#8c2522] tracking-wide"
                placeholder="Title your leaf..."
              />
              <p className="text-[10px] text-[#5c4033] font-mono italic mt-1 uppercase">
                Loose-leaf Notepaper • Compiled {new Date(pageItem.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Core Interactive Editor */}
          <div
            id="vintage-content-editor"
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleTextChange}
            dir="ltr"
            className="relative z-10 flex-1 outline-none text-[#333333] font-serif hover:cursor-text text-base leading-8 min-h-[300px]"
            style={{ fontFamily: 'var(--font-serif)', textAlign: 'left' }}
          />

          {/* Embedded Custom Tables */}
          {pageItem.tables && pageItem.tables.length > 0 && (
            <div className="relative z-10 mt-8 space-y-6">
              {pageItem.tables.map((table, tIdx) => {
                const activeTab = tableConfigTab[tIdx] || 'data';
                
                // Style Configuration Defaults
                const borderStyleClass = table.styleConfig?.borderStyle === 'dashed' ? 'border-dashed' : 
                                         table.styleConfig?.borderStyle === 'dotted' ? 'border-dotted' : 
                                         table.styleConfig?.borderStyle === 'none' ? 'border-none' : 'border-solid';
                const borderColorClass = table.styleConfig?.borderColor ? colorClassMap[table.styleConfig.borderColor]?.border : 'border-stone-300';

                return (
                  <div key={tIdx} className="border border-[#ebdcb9] rounded bg-[#fdfbf7] p-4 shadow-sm group/table flex flex-col">
                    
                    {/* Sub-toolbar inside table container */}
                    <div className="flex flex-col gap-2.5 border-b border-[#ebdcb9]/60 pb-3 mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className="p-1 px-2.5 bg-[#8c2522]/10 text-[#8c2522] border border-[#8c2522]/20 rounded font-mono text-[10px] font-bold uppercase tracking-wide">
                            📜 Table Ledger #{tIdx + 1}
                          </span>
                          
                          {/* Tabs */}
                          <div className="flex border border-stone-200 rounded overflow-hidden text-[11px] bg-white shadow-sm">
                            {(['data', 'cell', 'row', 'col', 'global'] as const).map(tab => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => {
                                  setTableConfigTab(prev => ({ ...prev, [tIdx]: tab }));
                                  setActiveTableIdx(tIdx);
                                }}
                                className={`px-2.5 py-1 font-bold border-r border-stone-100 last:border-0 uppercase transition-all ${
                                  activeTab === tab
                                    ? 'bg-[#8c2522] text-white shadow-inner'
                                    : 'text-stone-600 hover:bg-stone-50'
                                }`}
                              >
                                {tab === 'data' ? '✏️ Data' : tab === 'cell' ? '💧 Cell' : tab === 'row' ? '☰ Row' : tab === 'col' ? '⑃ Col' : '🏛️ Global'}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => handleDeleteTable(tIdx)}
                            className="text-stone-400 hover:text-red-700 hover:bg-red-50 p-1 rounded-sm transition-colors"
                            title="Delete entire ledger table"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Tab panel contents */}
                      <div className="bg-[#faf4eb]/60 rounded p-2.5 border border-[#ebdcb9]/30 text-xs text-[#5c4033]">
                        {activeTab === 'data' && (
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleAddTableRow(tIdx)}
                                className="bg-[#8c2522] text-[#fdfbf7] p-1 px-3 rounded font-bold hover:bg-[#a32e2a] transition-all text-[11px] flex items-center gap-1 shadow-xs"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add Row</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddTableCol(tIdx)}
                                className="bg-stone-800 text-[#fdfbf7] p-1 px-3 rounded font-bold hover:bg-stone-700 transition-all text-[11px] flex items-center gap-1 shadow-xs"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add Column</span>
                              </button>
                            </div>
                            <div className="text-[10px] italic text-[#8c2522] font-mono uppercase">
                              💡 Tip: Click any cell, header, row, or column to format its background & font properties!
                            </div>
                          </div>
                        )}

                        {activeTab === 'cell' && (
                          <div className="space-y-2">
                            {selectedCell?.tableIdx === tIdx ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[11px] text-[#8c2522] uppercase tracking-wide">
                                    💧 Specific Cell Format (Row {selectedCell.rIdx + 1}, Col {selectedCell.cIdx + 1})
                                  </span>
                                  <div className="flex gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTableRow(tIdx, selectedCell.rIdx)}
                                      className="text-red-700 hover:bg-red-50 p-1 px-2 border border-red-200 rounded text-[10px] font-bold"
                                    >
                                      Delete Row
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTableCol(tIdx, selectedCell.cIdx)}
                                      className="text-red-700 hover:bg-red-50 p-1 px-2 border border-red-200 rounded text-[10px] font-bold"
                                    >
                                      Delete Column
                                    </button>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                  {/* Background color */}
                                  <div>
                                    <span className="font-bold text-[10px] block uppercase text-[#5c4033] mb-1">Cell Fill</span>
                                    <div className="flex gap-1">
                                      {colorOptions.slice(0, 8).map(opt => {
                                        const isSel = table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.bg === opt.key;
                                        return (
                                          <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleUpdateTableCellFormat(tIdx, selectedCell.rIdx, selectedCell.cIdx, { bg: opt.key })}
                                            className={`w-4 h-4 rounded-full border transition-transform ${opt.bgClass} ${
                                              isSel ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                                            }`}
                                            title={opt.label}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Text Color */}
                                  <div>
                                    <span className="font-bold text-[10px] block uppercase text-[#5c4033] mb-1">Text Color</span>
                                    <div className="flex gap-1">
                                      {colorOptions.filter(o => o.key !== 'transparent').slice(0, 6).map(opt => {
                                        const isSel = table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.textColor === opt.key;
                                        return (
                                          <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleUpdateTableCellFormat(tIdx, selectedCell.rIdx, selectedCell.cIdx, { textColor: opt.key })}
                                            className={`w-4 h-4 rounded border transition-transform ${opt.bgClass} ${
                                              isSel ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                                            }`}
                                            title={opt.label}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Alignments & Font Weights */}
                                  <div className="flex items-center gap-2 border-l border-stone-200 pl-3">
                                    <div className="flex flex-col">
                                      <span className="font-bold text-[10px] uppercase text-[#5c4033] mb-1">Alignment</span>
                                      <div className="flex border border-stone-200 rounded bg-white">
                                        {(['left', 'center', 'right'] as const).map(align => {
                                          const isSel = table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.align === align;
                                          return (
                                            <button
                                              key={align}
                                              type="button"
                                              onClick={() => handleUpdateTableCellFormat(tIdx, selectedCell.rIdx, selectedCell.cIdx, { align })}
                                              className={`px-2 py-0.5 capitalize text-[10px] font-bold ${isSel ? 'bg-amber-900 text-white' : 'text-[#5c4033]'}`}
                                            >
                                              {align[0].toUpperCase()}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    <div className="flex flex-col pl-2">
                                      <span className="font-bold text-[10px] uppercase text-[#5c4033] mb-1">Emphasis</span>
                                      <div className="flex border border-stone-200 rounded bg-white overflow-hidden font-bold text-[10px]">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const curr = table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.bold;
                                            handleUpdateTableCellFormat(tIdx, selectedCell.rIdx, selectedCell.cIdx, { bold: !curr });
                                          }}
                                          className={`px-2 py-0.5 border-r border-stone-200 ${table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.bold ? 'bg-amber-950 text-white' : 'text-stone-700'}`}
                                        >
                                          B
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const curr = table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.italic;
                                            handleUpdateTableCellFormat(tIdx, selectedCell.rIdx, selectedCell.cIdx, { italic: !curr });
                                          }}
                                          className={`px-2 py-0.5 border-r border-stone-200 ${table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.italic ? 'bg-amber-950 text-white italic' : 'text-stone-700'}`}
                                        >
                                          I
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const curr = table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.underline;
                                            handleUpdateTableCellFormat(tIdx, selectedCell.rIdx, selectedCell.cIdx, { underline: !curr });
                                          }}
                                          className={`px-2 py-0.5 ${table.cellStyles?.[`${selectedCell.rIdx}-${selectedCell.cIdx}`]?.underline ? 'bg-amber-950 text-white underline' : 'text-stone-700'}`}
                                        >
                                          U
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2 text-[#8c2522] italic font-medium animate-pulse">
                                Click on any interior cell in the ledger below to start formatting its cell backgrounds and typography!
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'row' && (
                          <div className="space-y-2">
                            {selectedRow?.tableIdx === tIdx ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[11px] text-[#8c2522] uppercase tracking-wide">
                                    ☰ Format Row {selectedRow.rIdx + 1}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteTableRow(tIdx, selectedRow.rIdx);
                                      setSelectedRow(null);
                                      setSelectedCell(null);
                                    }}
                                    className="text-red-700 hover:bg-red-50 p-1 px-2 border border-red-200 rounded text-[10px] font-bold"
                                  >
                                    Delete This Entire Row
                                  </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                  {/* Row Background color */}
                                  <div>
                                    <span className="font-bold text-[10px] block uppercase text-[#5c4033] mb-1">Row Background</span>
                                    <div className="flex gap-1">
                                      {colorOptions.slice(0, 8).map(opt => {
                                        const isSel = table.rowStyles?.[selectedRow.rIdx]?.bg === opt.key;
                                        return (
                                          <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleUpdateTableRowStyle(tIdx, selectedRow.rIdx, { bg: opt.key })}
                                            className={`w-4 h-4 rounded-full border transition-transform ${opt.bgClass} ${
                                              isSel ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                                            }`}
                                            title={opt.label}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Row Text Color */}
                                  <div>
                                    <span className="font-bold text-[10px] block uppercase text-[#5c4033] mb-1">Row Text Color</span>
                                    <div className="flex gap-1">
                                      {colorOptions.filter(o => o.key !== 'transparent').slice(0, 6).map(opt => {
                                        const isSel = table.rowStyles?.[selectedRow.rIdx]?.textColor === opt.key;
                                        return (
                                          <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleUpdateTableRowStyle(tIdx, selectedRow.rIdx, { textColor: opt.key })}
                                            className={`w-4 h-4 rounded border transition-transform ${opt.bgClass} ${
                                              isSel ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                                            }`}
                                            title={opt.label}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Bold / Italic Emphasis */}
                                  <div className="flex flex-col border-l border-stone-200 pl-3">
                                    <span className="font-bold text-[10px] uppercase text-[#5c4033] mb-1">Row Emphasis</span>
                                    <div className="flex border border-stone-200 rounded bg-white overflow-hidden font-bold text-[10px]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const curr = table.rowStyles?.[selectedRow.rIdx]?.bold;
                                          handleUpdateTableRowStyle(tIdx, selectedRow.rIdx, { bold: !curr });
                                        }}
                                        className={`px-2 py-0.5 border-r border-stone-200 ${table.rowStyles?.[selectedRow.rIdx]?.bold ? 'bg-amber-955 text-white' : 'text-stone-700'}`}
                                      >
                                        Bold Row
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const curr = table.rowStyles?.[selectedRow.rIdx]?.italic;
                                          handleUpdateTableRowStyle(tIdx, selectedRow.rIdx, { italic: !curr });
                                        }}
                                        className={`px-2 py-0.5 ${table.rowStyles?.[selectedRow.rIdx]?.italic ? 'bg-amber-955 text-white italic' : 'text-stone-700'}`}
                                      >
                                        Italic Row
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2 text-[#8c2522] italic font-medium">
                                Click on any row cell below to select, modify and format the entire row's backdrop color and styling!
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'col' && (
                          <div className="space-y-2">
                            {selectedCol?.tableIdx === tIdx ? (
                              <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[11px] text-[#8c2522] uppercase tracking-wide">
                                    ⑃ Format Column {selectedCol.cIdx + 1} ({table.headers[selectedCol.cIdx] || 'Unnamed'})
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleDeleteTableCol(tIdx, selectedCol.cIdx);
                                      setSelectedCol(null);
                                      setSelectedCell(null);
                                    }}
                                    className="text-red-700 hover:bg-red-50 p-1 px-2 border border-red-200 rounded text-[10px] font-bold"
                                  >
                                    Delete This Entire Column
                                  </button>
                                </div>
                                <div className="flex flex-wrap items-center gap-4">
                                  {/* Col Background Color */}
                                  <div>
                                    <span className="font-bold text-[10px] block uppercase text-[#5c4033] mb-1">Column Background</span>
                                    <div className="flex gap-1">
                                      {colorOptions.slice(0, 8).map(opt => {
                                        const isSel = table.colStyles?.[selectedCol.cIdx]?.bg === opt.key;
                                        return (
                                          <button
                                            key={opt.key}
                                            type="button"
                                            onClick={() => handleUpdateTableColStyle(tIdx, selectedCol.cIdx, { bg: opt.key })}
                                            className={`w-4 h-4 rounded-full border transition-transform ${opt.bgClass} ${
                                              isSel ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                                            }`}
                                            title={opt.label}
                                          />
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Col Align */}
                                  <div className="flex flex-col">
                                    <span className="font-bold text-[10px] uppercase text-[#5c4033] mb-1">Column Align</span>
                                    <div className="flex border border-stone-200 rounded bg-white">
                                      {(['left', 'center', 'right'] as const).map(align => {
                                        const isSel = table.colStyles?.[selectedCol.cIdx]?.align === align;
                                        return (
                                          <button
                                            key={align}
                                            type="button"
                                            onClick={() => handleUpdateTableColStyle(tIdx, selectedCol.cIdx, { align })}
                                            className={`px-2.5 py-0.5 capitalize text-[10px] font-bold ${isSel ? 'bg-stone-800 text-white' : 'text-[#5c4033]'}`}
                                          >
                                            {align}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Col Width dropdown */}
                                  <div className="flex flex-col">
                                    <span className="font-bold text-[10px] uppercase text-[#5c4033] mb-1">Width</span>
                                    <select
                                      value={table.colStyles?.[selectedCol.cIdx]?.width || 'auto'}
                                      onChange={e => handleUpdateTableColStyle(tIdx, selectedCol.cIdx, { width: e.target.value })}
                                      className="text-[10px] p-1 rounded border border-stone-300 bg-white outline-none font-bold text-[#5c4033]"
                                    >
                                      <option value="auto">Auto-Fit (Default)</option>
                                      <option value="80px">Narrow (80px)</option>
                                      <option value="140px">Medium (140px)</option>
                                      <option value="220px">Wide (220px)</option>
                                      <option value="300px">Extra-Wide (300px)</option>
                                    </select>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-2 text-[#8c2522] italic font-medium">
                                Click on any interior header or cell column below to start formatting that entire column properties!
                              </div>
                            )}
                          </div>
                        )}

                        {activeTab === 'global' && (
                          <div className="space-y-2">
                            <span className="font-bold text-[11px] text-[#8c2522] uppercase tracking-wide block mb-1">
                              🏛️ Ledger Global Parameters & Aesthetics
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                {/* Zebra striping */}
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`zebra-${tIdx}`}
                                    checked={!!table.styleConfig?.zebraBanded}
                                    onChange={e => handleUpdateTableStyleConfig(tIdx, { zebraBanded: e.target.checked })}
                                    className="rounded border-[#ebdcb9] text-[#8c2522] focus:ring-[#8c2522]"
                                  />
                                  <label htmlFor={`zebra-${tIdx}`} className="text-xs font-bold text-[#5c4033] uppercase select-none cursor-pointer">
                                    Alternate Row Color Shading (Zebra Banded)
                                  </label>
                                </div>

                                {/* Custom borders config */}
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[10px] uppercase text-[#5c4033] block">Border Style:</span>
                                  <select
                                    value={table.styleConfig?.borderStyle || 'solid'}
                                    onChange={e => handleUpdateTableStyleConfig(tIdx, { borderStyle: e.target.value })}
                                    className="p-1 text-[10px] rounded border border-stone-300 bg-white text-[#5c4033]"
                                  >
                                    <option value="solid">Ink Solid Line</option>
                                    <option value="dashed">Hyphen Dashed</option>
                                    <option value="dotted">Point Dotted</option>
                                    <option value="none">No Borders (Clean)</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1.5 border-l border-stone-200 pl-4">
                                <span className="font-bold text-[10px] uppercase text-[#5c4033] block">Header Plate Color</span>
                                <div className="flex gap-1 flex-wrap">
                                  {colorOptions.slice(0, 8).map(opt => {
                                    const isSel = table.styleConfig?.headerBg === opt.key;
                                    return (
                                      <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => handleUpdateTableStyleConfig(tIdx, { headerBg: opt.key })}
                                        className={`w-3.5 h-3.5 rounded-full border transition-transform ${opt.bgClass} ${
                                          isSel ? 'ring-2 ring-amber-500 scale-110' : 'hover:scale-105'
                                        }`}
                                        title={`Header Bg: ${opt.label}`}
                                      />
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Highly-Formatted Interactive Scribe Table */}
                    <div className="overflow-x-auto w-full rounded border border-stone-200 shadow-xs bg-white">
                      <table className={`w-full text-xs border-collapse ${borderStyleClass} ${borderColorClass}`}>
                        <thead>
                          <tr className="border-b border-stone-300">
                            {table.headers.map((h, cIdx) => {
                              const colStyle = table.colStyles?.[cIdx];
                              const isSelected = selectedCol?.tableIdx === tIdx && selectedCol?.cIdx === cIdx;
                              
                              // Style hierarchy
                              const headerBg = table.styleConfig?.headerBg ? colorClassMap[table.styleConfig.headerBg]?.bg : 'bg-stone-100';
                              const headerTextColor = table.styleConfig?.headerBg ? colorClassMap[table.styleConfig.headerBg]?.text : 'text-stone-800';
                              const headerBold = table.styleConfig?.headerBold !== false ? 'font-bold' : '';
                              const headerItalic = table.styleConfig?.headerItalic ? 'italic' : '';
                              
                              const widthStyle = colStyle?.width || 'auto';

                              return (
                                <th 
                                  key={cIdx} 
                                  onClick={() => {
                                    setSelectedCol({ tableIdx: tIdx, cIdx });
                                    setSelectedRow(null);
                                    setSelectedCell(null);
                                    setActiveTableIdx(tIdx);
                                  }}
                                  className={`p-2 border-r text-start font-bold select-none cursor-pointer border-stone-300 transition-colors ${headerBg} ${headerTextColor} ${headerBold} ${headerItalic} ${
                                    isSelected ? 'ring-2 ring-inset ring-amber-500 bg-amber-50/50' : 'hover:bg-stone-100/50'
                                  }`}
                                  style={{ width: widthStyle }}
                                >
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={h}
                                      onChange={e => handleUpdateTableHeader(tIdx, cIdx, e.target.value)}
                                      className="bg-transparent font-bold text-xs w-full outline-none focus:ring-1 focus:ring-amber-500"
                                    />
                                    {isSelected && <span className="text-[9px] text-[#8c2522]">▼</span>}
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {table.rows.map((row, rIdx) => {
                            const rStyle = table.rowStyles?.[rIdx];
                            const rowBgClass = rStyle?.bg ? colorClassMap[rStyle.bg]?.bg : (table.styleConfig?.zebraBanded && rIdx % 2 === 1 ? 'bg-stone-50/80' : 'bg-transparent');
                            const rowTextClass = rStyle?.textColor ? colorClassMap[rStyle.textColor]?.text : 'text-[#333333]';
                            const rowBoldClass = rStyle?.bold ? 'font-bold' : '';
                            const rowItalicClass = rStyle?.italic ? 'italic' : '';

                            return (
                              <tr 
                                key={rIdx} 
                                className={`border-b border-stone-200/60 hover:bg-amber-50/20 transition-all ${rowBgClass} ${rowTextClass} ${rowBoldClass} ${rowItalicClass}`}
                              >
                                {row.map((cell, cIdx) => {
                                  // cell style keys
                                  const cellStyleKey = `${rIdx}-${cIdx}`;
                                  const cStyle = table.cellStyles?.[cellStyleKey];
                                  const colStyle = table.colStyles?.[cIdx];

                                  // Background override
                                  const cellBgClass = cStyle?.bg ? colorClassMap[cStyle.bg]?.bg : (colStyle?.bg ? colorClassMap[colStyle.bg]?.bg : 'bg-transparent');
                                  // Color overrides
                                  const cellTextClass = cStyle?.textColor ? colorClassMap[cStyle.textColor]?.text : (colStyle?.textColor ? colorClassMap[colStyle.textColor]?.text : '');
                                  // Alignment overrides
                                  const cellAlignClass = cStyle?.align === 'center' ? 'text-center' : cStyle?.align === 'right' ? 'text-right' : (colStyle?.align === 'center' ? 'text-center' : colStyle?.align === 'right' ? 'text-right' : 'text-left');
                                  
                                  // Emphasis overrides
                                  const isBoldText = cStyle?.bold !== undefined ? cStyle.bold : (colStyle?.bold !== undefined ? colStyle.bold : false);
                                  const isItalicText = cStyle?.italic !== undefined ? cStyle.italic : (colStyle?.italic !== undefined ? colStyle.italic : false);
                                  const isUnderlineText = cStyle?.underline || false;

                                  const cellBoldClass = isBoldText ? 'font-bold' : '';
                                  const cellItalicClass = isItalicText ? 'italic' : '';
                                  const cellUnderlineClass = isUnderlineText ? 'underline' : '';

                                  const isSelected = selectedCell?.tableIdx === tIdx && selectedCell?.rIdx === rIdx && selectedCell?.cIdx === cIdx;
                                  const widthStyle = colStyle?.width || 'auto';

                                  return (
                                    <td 
                                      key={cIdx} 
                                      onClick={() => {
                                        setSelectedCell({ tableIdx: tIdx, rIdx, cIdx });
                                        setSelectedRow({ tableIdx: tIdx, rIdx });
                                        setSelectedCol({ tableIdx: tIdx, cIdx });
                                        setActiveTableIdx(tIdx);
                                      }}
                                      className={`p-1 border-r border-stone-200 transition-shadow ${cellBgClass} ${cellTextClass} ${cellAlignClass} ${cellBoldClass} ${cellItalicClass} ${cellUnderlineClass} ${
                                        isSelected ? 'ring-2 ring-inset ring-amber-500 bg-amber-50/10' : ''
                                      }`}
                                      style={{ width: widthStyle }}
                                    >
                                      <input
                                        type="text"
                                        value={cell}
                                        onChange={e => handleUpdateTableCell(tIdx, rIdx, cIdx, e.target.value)}
                                        className="bg-transparent text-xs w-full outline-none focus:bg-[#faf4eb]/50"
                                      />
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Embedded Custom Vector Charts */}
          {pageItem.charts && pageItem.charts.length > 0 && (
            <div className="relative z-10 mt-8 space-y-6">
              {pageItem.charts.map((chart, cIdx) => (
                <div key={cIdx} className="border border-[#ebdcb9] rounded bg-[#fcf8f2] p-4 shadow-2xs group/chart">
                  <div className="flex items-center justify-between mb-4 border-b border-[#ebdcb9]/40 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-[#3e2723]">📊 Vector Chart: {chart.title}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={chart.type}
                        onChange={e => handleUpdateChartType(cIdx, e.target.value as any)}
                        className="text-xs bg-white border border-[#ebdcb9] rounded px-1.5 py-0.5 outline-none font-bold text-[#5c4033]"
                      >
                        <option value="bar">Bar Plot</option>
                        <option value="line">Line Plot</option>
                        <option value="pie">Sector Pie</option>
                      </select>
                      <button
                        onClick={() => handleDeleteChart(cIdx)}
                        className="opacity-0 group-hover/chart:opacity-100 text-red-700 hover:bg-neutral-100 p-0.5 rounded transition-opacity"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* SVG generated Chart */}
                  <div className="flex gap-4">
                    {/* SVG canvas */}
                    <div className="flex-1 h-32 flex items-end justify-between px-4 pb-2 pt-4 bg-[#fdfbf7] border border-[#ebdcb9]/35 rounded relative min-w-[240px]">
                      {chart.type === 'bar' && (
                        <div className="w-full h-full flex items-end justify-around gap-2 pt-2">
                          {chart.values.map((val, idx) => {
                            const maxVal = Math.max(...chart.values, 1);
                            const percent = (val / maxVal) * 80; // keep some padding
                            return (
                              <div key={idx} className="flex-1 flex flex-col items-center">
                                <span className="text-[9px] font-mono text-[#8c2522] mb-1">{val}</span>
                                <div
                                  style={{ height: `${percent}%` }}
                                  className="w-full max-w-[20px] bg-[#8c2522]/85 hover:bg-[#8c2522] rounded-t-xs border-r border-[#3e2723]/10"
                                />
                                <span className="text-[9px] truncate max-w-[40px] text-[#5c4033] mt-1.5 font-sans font-medium">{chart.labels[idx]}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {chart.type === 'line' && (
                        <div className="w-full h-full relative">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            {/* SVG lines and dots */}
                            <path
                              d={chart.values.map((val, idx) => {
                                const maxVal = Math.max(...chart.values, 1);
                                const x = (idx / (chart.values.length - 1)) * 100;
                                const y = 90 - (val / maxVal) * 85;
                                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#8c2522"
                              strokeWidth="3.5"
                            />
                            {chart.values.map((val, idx) => {
                              const maxVal = Math.max(...chart.values, 1);
                              const x = (idx / (chart.values.length - 1)) * 100;
                              const y = 90 - (val / maxVal) * 85;
                              return (
                                <circle key={idx} cx={x} cy={y} r="4.5" fill="#1a2d54" />
                              );
                            })}
                          </svg>
                          <div className="absolute inset-x-0 bottom-0 flex justify-between px-1">
                            {chart.labels.map((l, i) => (
                              <span key={i} className="text-[9px] text-[#5c4033] font-sans font-medium mt-1">{l}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {chart.type === 'pie' && (
                        <div className="w-full h-full flex items-center justify-center gap-6">
                          <svg className="h-28 w-28 -rotate-90 overflow-visible" viewBox="0 0 40 40">
                            {chart.values.map((val, idx) => {
                              const total = chart.values.reduce((a, b) => a + b, 0);
                              let currentOffset = 0;
                              for (let i = 0; i < idx; i++) {
                                currentOffset += (chart.values[i] / total) * 100;
                              }
                              const percentage = (val / total) * 100;
                              const currentRadius = 15.91549430918954;
                              const colorsList = ['#9e2a2b', '#3a5a40', '#d4a373', '#1d3557', '#e76f51'];
                              const strokeColor = colorsList[idx % colorsList.length];
                              return (
                                <circle
                                  key={idx}
                                  cx="20"
                                  cy="20"
                                  r={currentRadius}
                                  fill="none"
                                  stroke={strokeColor}
                                  strokeWidth="6"
                                  strokeDasharray={`${percentage} ${100 - percentage}`}
                                  strokeDashoffset={100 - currentOffset}
                                  title={`${chart.labels[idx]}: ${val}`}
                                />
                              );
                            })}
                          </svg>
                          <div className="flex flex-col gap-1 justify-center">
                            {chart.values.map((v, i) => {
                              const colorsList = ['#9e2a2b', '#3a5a40', '#d4a373', '#1d3557', '#e76f51'];
                              return (
                                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorsList[i % colorsList.length] }} />
                                  <span className="font-semibold text-[#5c4033]">{chart.labels[i]}: <span className="text-black font-bold">{v}</span></span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Editor parameters table layout */}
                    <div className="w-56 bg-white p-3 border border-[#ebdcb9] rounded flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[#ebdcb9] uppercase">Modify Scale:</span>
                      <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[100px] vintage-scroll pr-1">
                        {chart.values.map((val, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2 text-xs">
                            <span className="text-[#5c4033] font-sans text-[11px] truncate">{chart.labels[idx]}</span>
                            <input
                              type="number"
                              value={val}
                              onChange={e => handleUpdateChartValue(cIdx, idx, Number(e.target.value))}
                              className="w-16 border border-[#ebdcb9] bg-white rounded text-center text-xs text-[#333] font-sans"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Customizable Shapes */}
          {pageItem.shapes && pageItem.shapes.map(shape => {
            const colorsList = ['#8c2522', '#1a2d54', '#3b5220', '#5c4033', '#333333'];
            return (
              <div
                key={shape.id}
                style={{
                  position: 'absolute',
                  left: shape.x,
                  top: shape.y,
                  width: shape.width,
                  height: shape.height,
                  border: `${shape.strokeWidth}px border ${shape.color}`,
                }}
                className="z-15 group/shape flex items-center justify-center pointer-events-auto"
              >
                {/* Visual shape representations */}
                {shape.type === 'rectangle' && (
                  <div className="absolute inset-0 border-2" style={{ borderColor: shape.color }} />
                )}
                {shape.type === 'circle' && (
                  <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: shape.color }} />
                )}
                {shape.type === 'line' && (
                  <div className="absolute top-[50%] inset-x-0 border-t-2" style={{ borderColor: shape.color }} />
                )}
                {shape.type === 'arrow' && (
                  <div className="absolute top-[50%] inset-x-0 flex items-center justify-end">
                    <div className="flex-1 border-t-2" style={{ borderColor: shape.color }} />
                    <div className="w-2 h-2 border-t-2 border-r-2 -rotate-45 -mr-1" style={{ borderColor: shape.color }} />
                  </div>
                )}

                {/* Drag handle or color adjustment/Deletion panel */}
                <div className="absolute -top-7 right-0 p-1 flex items-center gap-1 rounded bg-[#3e2723] scale-80 opacity-0 group-hover/shape:opacity-100 transition-all pointer-events-auto">
                  {colorsList.map(col => (
                    <button
                      key={col}
                      onClick={() => {
                        const updatedShapes = pageItem.shapes?.map(s => s.id === shape.id ? { ...s, color: col } : s);
                        savePageChanges({ shapes: updatedShapes });
                      }}
                      className="w-2.5 h-2.5 rounded-full border border-[#fdfbf7]"
                      style={{ backgroundColor: col }}
                    />
                  ))}
                  <button
                    onClick={() => handleDeleteShape(shape.id)}
                    className="p-0.5 hover:bg-neutral-700 text-white border-l border-neutral-600 pl-1.5"
                    title="Delete shape"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Draggable Sticky Notes Annotation Overlay */}
          {pageItem && pageItem.stickyNotes && pageItem.stickyNotes.map(note => (
            <StickyNoteCard
              key={note.id}
              note={note}
              onUpdate={handleUpdateStickyNote}
              onDelete={handleDeleteStickyNote}
            />
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}
