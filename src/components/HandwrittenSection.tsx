import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Eraser, Download, Check, RefreshCw, Layers, Sliders,
  HelpCircle, Settings, Play, Archive, Plus, Trash2, Grid, Square, Circle, ChevronRight 
} from 'lucide-react';
import { Notepaper, PageSize, PaperStyle, TableData, ShapeElement, CustomMargin } from '../types';
import { colorClassMap } from './TextNotesSection';
import { StickyNotesSectionLayer, StickyNoteCard } from './StickyNoteOverlay';

interface HandwrittenSectionProps {
  pageItem: Notepaper | null;
  onUpdatePage: (updated: Notepaper) => void;
}

export default function HandwrittenSection({ pageItem, onUpdatePage }: HandwrittenSectionProps) {
  const [activeTool, setActiveTool] = useState<'pen' | 'calligraphy' | 'pencil' | 'eraser' | 'highlighter'>('pen');
  const [penColor, setPenColor] = useState<string>('#1a2d54'); // vintage ink
  const [penSize, setPenSize] = useState<number>(3);
  const [eraserSize, setEraserSize] = useState<number>(25);
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ruled');
  const [pageSize, setPageSize] = useState<PageSize>('Letter');
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);

  // Embedded overlays
  const [localTables, setLocalTables] = useState<TableData[]>([]);
  const [localShapes, setLocalShapes] = useState<ShapeElement[]>([]);

  // Page classes
  const sizeClasses: Record<PageSize, string> = {
    Letter: 'w-full max-w-[800px] min-h-[1050px]',
    A4: 'w-full max-w-[760px] min-h-[1080px]',
    A5: 'w-full max-w-[550px] min-h-[780px]',
    Pocket: 'w-full max-w-[420px] min-h-[600px]',
    Legal: 'w-full max-w-[840px] min-h-[1220px]',
    Letter_Landscape: 'w-full max-w-[1050px] min-h-[750px]',
    A4_Landscape: 'w-full max-w-[1080px] min-h-[720px]',
    Square_Sm: 'w-full max-w-[600px] min-h-[600px]',
    Square_Lg: 'w-full max-w-[800px] min-h-[800px]'
  };

  useEffect(() => {
    if (pageItem) {
      setPaperStyle(pageItem.paperStyle);
      setPageSize(pageItem.pageSize);
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
      setLocalTables(pageItem.tables || []);
      setLocalShapes(pageItem.shapes || []);
      setCustomMargins(pageItem.customMargins || []);
      loadCanvasDrawings();
    }
  }, [pageItem?.id]);

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

  const loadCanvasDrawings = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (pageItem?.drawingsData) {
      const img = new Image();
      img.src = pageItem.drawingsData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e);
    setIsDrawing(true);
    setLastPos({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = eraserSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'pencil') {
      // Chalky greyed style with lower alpha and soft feathered edge
      ctx.globalCompositeOperation = 'source-over';
      const actualColor = penColor === '#1a2d54' ? 'rgba(50, 70, 110, 0.45)' : penColor + '55';
      ctx.strokeStyle = actualColor;
      ctx.lineWidth = penSize * 0.8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Feathered soft edge
      ctx.shadowBlur = 1.8;
      ctx.shadowColor = actualColor;

      // Quadratic outline curve for smooth flowing paths
      ctx.moveTo(lastPos.x, lastPos.y);
      const midPointX = (lastPos.x + x) / 2;
      const midPointY = (lastPos.y + y) / 2;
      ctx.quadraticCurveTo(lastPos.x, lastPos.y, midPointX, midPointY);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'calligraphy') {
      // Calligraphy flat brush angle effect
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize * 1.5;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'miter';
      
      // Fine shadow blur to soften pixelated diagonal steps
      ctx.shadowBlur = 0.6;
      ctx.shadowColor = penColor;

      // Drawing calligraphy nib angle lines
      ctx.moveTo(lastPos.x - 3, lastPos.y - 3);
      ctx.lineTo(x - 3, y - 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      const highlightColor = 'rgba(255, 235, 59, 0.35)';
      ctx.strokeStyle = highlightColor;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Clean marker bounds
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Classic metal core ink pen - with curve interpolation and soft edges
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Fluid ink anti-aliased soft edges
      ctx.shadowBlur = 1.0;
      ctx.shadowColor = penColor;

      // Quadratic curve interpolation
      ctx.moveTo(lastPos.x, lastPos.y);
      const midPointX = (lastPos.x + x) / 2;
      const midPointY = (lastPos.y + y) / 2;
      ctx.quadraticCurveTo(lastPos.x, lastPos.y, midPointX, midPointY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Reset shadow values to make sure other elements dont bleed
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveCanvasData();
  };

  const saveCanvasData = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pageItem) return;
    const dataUrl = canvas.toDataURL();
    onUpdatePage({
      ...pageItem,
      drawingsData: dataUrl,
      paperStyle,
      pageSize,
      hasMargin,
      marginColor,
      marginPosition,
      marginPositionLeft,
      marginPositionRight,
      marginPositionTop,
      marginPositionBottom,
      marginStyle,
      marginSide,
      hasHorizontalMargin,
      tables: localTables,
      shapes: localShapes
    });
  };

  const clearCanvasContent = () => {
    const canvas = canvasRef.current;
    if (!canvas || !pageItem) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onUpdatePage({
      ...pageItem,
      drawingsData: '',
    });
  };

  // Same feature: Inserting custom grids tables in handwriting
  const handleInsertTable = () => {
    const newTable: TableData = {
      headers: ['A', 'B', 'C'],
      rows: [['', '', ''], ['', '', '']]
    };
    const updated = [...localTables, newTable];
    setLocalTables(updated);
    if (pageItem) onUpdatePage({ ...pageItem, tables: updated });
  };

  const handleUpdateTableCell = (tableIndex: number, rIdx: number, cIdx: number, val: string) => {
    const updated = [...localTables];
    updated[tableIndex].rows[rIdx][cIdx] = val;
    setLocalTables(updated);
    if (pageItem) onUpdatePage({ ...pageItem, tables: updated });
  };

  const handleAddTableRow = (tableIndex: number) => {
    const updated = [...localTables];
    const cols = updated[tableIndex].headers.length;
    updated[tableIndex].rows.push(Array(cols).fill(''));
    setLocalTables(updated);
    if (pageItem) onUpdatePage({ ...pageItem, tables: updated });
  };

  const handleUpdateTableHeader = (tableIdx: number, cIdx: number, val: string) => {
    const updated = [...localTables];
    updated[tableIdx].headers[cIdx] = val;
    setLocalTables(updated);
    if (pageItem) onUpdatePage({ ...pageItem, tables: updated });
  };

  const handleAddTableCol = (tableIdx: number) => {
    const updated = [...localTables];
    updated[tableIdx].headers.push(`Col ${updated[tableIdx].headers.length + 1}`);
    updated[tableIdx].rows = updated[tableIdx].rows.map(row => [...row, '']);
    setLocalTables(updated);
    if (pageItem) onUpdatePage({ ...pageItem, tables: updated });
  };

  const handleDeleteTable = (idx: number) => {
    const updated = localTables.filter((_, i) => i !== idx);
    setLocalTables(updated);
    if (pageItem) onUpdatePage({ ...pageItem, tables: updated });
  };

  // Same feature: Inserting vector sketch shapes overlay
  const handleInsertShape = (type: 'rectangle' | 'circle' | 'line' | 'arrow') => {
    const newShape: ShapeElement = {
      id: `hw-shape-${Date.now()}`,
      type,
      x: 80 + (localShapes.length * 20),
      y: 150 + (localShapes.length * 20),
      width: type === 'line' || type === 'arrow' ? 200 : 120,
      height: type === 'line' || type === 'arrow' ? 5 : 85,
      color: penColor,
      strokeWidth: 2
    };
    const updated = [...localShapes, newShape];
    setLocalShapes(updated);
    if (pageItem) onUpdatePage({ ...pageItem, shapes: updated });
  };

  const handleDeleteShape = (id: string) => {
    const updated = localShapes.filter(s => s.id !== id);
    setLocalShapes(updated);
    if (pageItem) onUpdatePage({ ...pageItem, shapes: updated });
  };

  if (!pageItem) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#fdfbf7] p-8 text-center font-serif">
        <div className="max-w-md rounded-md border border-[#ebdcb9] bg-[#fcf8f2] p-8 shadow-xs">
          <Layers className="mx-auto h-12 w-12 text-[#ebdcb9] mb-4" />
          <h2 className="font-display text-xl font-bold text-[#3e2723] mb-2">No Canvas Selected</h2>
          <p className="text-xs text-[#5c4033] leading-relaxed mb-4">
            Bind or select a sketching parchment from your Calligraphy cabinet space to unleash beautiful free style handwriting fluid lines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-[#faf4eb] overflow-hidden font-serif">
      {/* HANDWRITING COMPONENT WORKBENCH RIBBON OVERLAYS */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[#ebdcb9] bg-[#fcf8f2] px-6 py-2 shadow-2xs">
        
        {/* Style selection */}
        <div className="flex items-center gap-1">
          {/* Iron Pen */}
          <button
            onClick={() => setActiveTool('pen')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold select-none ${
              activeTool === 'pen' ? 'bg-[#5c4033] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'
            }`}
            title="Standard Steel Ink Nib"
          >
            <PenTool className="h-4 w-4" />
            <span>Classic Nib</span>
          </button>

          {/* Calligraphy Brush */}
          <button
            onClick={() => setActiveTool('calligraphy')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold select-none ${
              activeTool === 'calligraphy' ? 'bg-[#8c2522] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'
            }`}
            title="Angled Chiseled Calligraphy Edge"
          >
            <Settings className="h-4 w-4" />
            <span>Calligraphy Nib</span>
          </button>

          {/* Pencil */}
          <button
            onClick={() => setActiveTool('pencil')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold select-none ${
              activeTool === 'pencil' ? 'bg-[#7f8c8d] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'
            }`}
            title="Charcoal Pencil Draft"
          >
            <Sliders className="h-4 w-4" />
            <span>Chalk Pencil</span>
          </button>

          {/* Golden Highlighter */}
          <button
            onClick={() => setActiveTool('highlighter')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold select-none ${
              activeTool === 'highlighter' ? 'bg-amber-600 text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'
            }`}
            title="Golden washed translucent highlight marker"
          >
            <Grid className="h-4 w-4" />
            <span>Gold Marker</span>
          </button>

          {/* Clean Eraser */}
          <button
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold select-none ${
              activeTool === 'eraser' ? 'bg-[#333333] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'
            }`}
            title="Clean Ink from Canvas"
          >
            <Eraser className="h-4 w-4" />
            <span>Clean Eraser</span>
          </button>
        </div>

        {/* Eraser Width Settings Slider */}
        {activeTool === 'eraser' && (
          <div className="flex items-center gap-2 border-l border-[#e2d6c5] pl-3 text-xs animate-in fade-in slide-in-from-top-1">
            <span className="text-[10px] font-bold text-[#5c4033] uppercase">Eraser width:</span>
            <input
              type="range"
              min={5}
              max={80}
              value={eraserSize}
              onChange={e => setEraserSize(Number(e.target.value))}
              className="w-24 accent-[#333333] cursor-pointer"
            />
            <span className="text-[11px] font-semibold text-[#8c2522] min-w-[28px]">{eraserSize}px</span>
          </div>
        )}

        {/* Vintage Ink selection */}
        {activeTool !== 'eraser' && (
          <div className="flex items-center gap-2 border-l border-[#e2d6c5] pl-3">
            <span className="text-[10px] font-bold text-[#5c4033] uppercase">Nib Paint:</span>
            <div className="flex items-center gap-1.5">
              {[
                { hex: '#1a2d54', name: 'Royal Ink' },
                { hex: '#8c2522', name: 'Ancient Crimson' },
                { hex: '#3b5220', name: 'Forest Moss' },
                { hex: '#5c4033', name: 'Raw Sepia' },
                { hex: '#333333', name: 'Coal' }
              ].map(col => (
                <button
                  key={col.hex}
                  onClick={() => setPenColor(col.hex)}
                  title={col.name}
                  className={`relative h-5 w-5 rounded-full border border-black/10 transition-transform ${
                    penColor === col.hex ? 'scale-12 w ring-1 ring-[#8c2522] ring-offset-1' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: col.hex }}
                />
              ))}
            </div>

            <span className="text-[10px] font-bold text-[#5c4033] uppercase ml-2">Tip Point:</span>
            <input
              type="range"
              min={1}
              max={12}
              value={penSize}
              onChange={e => setPenSize(Number(e.target.value))}
              className="w-16 accent-[#5c4033]"
            />
          </div>
        )}

        {/* Dynamic Canvas custom settings page styles */}
        <div className="flex items-center gap-3 text-xs relative">
          <div className="flex items-center gap-1.5 rounded border border-[#ebdcb9] bg-white px-2 py-1 text-[#5c4033]">
            <Settings className="h-3.5 w-3.5" />
            <select
              value={pageSize}
              onChange={e => {
                const s = e.target.value as PageSize;
                setPageSize(s);
                if (pageItem) onUpdatePage({ ...pageItem, pageSize: s });
              }}
              className="bg-transparent outline-none font-bold"
            >
              <option value="Letter">Letter Sheet</option>
              <option value="A4">A4 Bond</option>
              <option value="A5">A5 Loose</option>
              <option value="Pocket">Pocket Ledger</option>
              <option value="Legal">Legal Size</option>
              <option value="Letter_Landscape">Landscape Letter</option>
              <option value="A4_Landscape">Landscape A4</option>
              <option value="Square_Sm">Square Small (600x600)</option>
              <option value="Square_Lg">Square Large (800x800)</option>
            </select>

            <select
              value={paperStyle}
              onChange={e => {
                const p = e.target.value as PaperStyle;
                setPaperStyle(p);
                if (pageItem) onUpdatePage({ ...pageItem, paperStyle: p });
              }}
              className="bg-transparent outline-none font-bold border-l border-[#ebdcb9] pl-1.5"
            >
              <option value="unruled">Blank Vellum</option>
              <option value="ruled">Ruled Guides</option>
              <option value="grid">Grid Pattern</option>
            </select>

            <label className="flex items-center gap-1 border-l border-[#ebdcb9] pl-1.5 cursor-pointer font-bold select-none">
              <input
                type="checkbox"
                checked={hasMargin}
                onChange={e => {
                  const m = e.target.checked;
                  setHasMargin(m);
                  if (pageItem) onUpdatePage({ ...pageItem, hasMargin: m });
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
                  id="has-horizontal-margin-hw"
                  checked={hasHorizontalMargin}
                  onChange={e => {
                    const checked = e.target.checked;
                    setHasHorizontalMargin(checked);
                    savePageChanges({ hasHorizontalMargin: checked });
                  }}
                  className="rounded accent-[#8c2522] cursor-pointer"
                />
                <label htmlFor="has-horizontal-margin-hw" className="font-bold text-[#5c4033] cursor-pointer select-none">
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

          <button
            onClick={clearCanvasContent}
            className="rounded border border-[#e5a2a2] bg-[#fcf8f2] px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-[#e5a2a2]/20"
          >
            Clear Sheet
          </button>
        </div>

        {/* Feature: inserting shapes & tables into Handwriting workspace */}
        <div className="flex items-center gap-1.5 border-l border-[#ebdcb9] pl-3">
          <button
            onClick={handleInsertTable}
            className="flex items-center gap-1.5 rounded bg-white border border-[#ebdcb9] px-2 py-1 text-xs font-semibold text-[#5c4033] hover:bg-[#faf4eb]"
            title="Embed tables element onto Canvas margins"
          >
            <Grid className="h-3 w-3" />
            <span>Table Cell</span>
          </button>

          <div className="flex items-center border border-[#ebdcb9] rounded overflow-hidden bg-white">
            <button
              onClick={() => handleInsertShape('rectangle')}
              className="p-1 hover:bg-[#faf4eb] border-r border-[#ebdcb9] text-[#5c4033]"
              title="Add Rectangle Grid Bounds"
            >
              <Square className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleInsertShape('circle')}
              className="p-1 hover:bg-[#faf4eb] border-r border-[#ebdcb9] text-[#5c4033]"
              title="Add Circle Element"
            >
              <Circle className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleInsertShape('line')}
              className="p-1 hover:bg-[#faf4eb] text-[#5c4033]"
              title="Add straight horizontal segment"
            >
              <ChevronRight className="h-3 w-3 rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* COMPONENT DRAWWORKSPACE */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start vintage-scroll">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}>
          <div
            className={`relative bg-[#fdfbf7] ${sizeClasses[pageSize]} border-2 border-[#e2d6c5] shadow-md flex flex-col transition-all duration-300 pointer-events-auto ${
              draggingId ? 'select-none cursor-grabbing' : ''
            }`}
            style={{
              paddingLeft: hasMargin && marginSide !== 'right' ? `${marginPositionLeft + 24}px` : '48px',
              paddingRight: hasMargin && marginSide !== 'left' ? `${marginPositionRight + 24}px` : '48px',
              paddingTop: hasMargin && hasHorizontalMargin ? `${marginPositionTop + 24}px` : '48px',
              paddingBottom: hasMargin && hasHorizontalMargin ? `${marginPositionBottom + 48}px` : '64px',
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
          {/* Ruling Overlay Patterns */}
          {paperStyle !== 'unruled' && (
            <div className={`absolute inset-0 pointer-events-none opacity-45 z-0 ${
              paperStyle === 'ruled' ? 'paper-ruled' : 'paper-grid'
            }`} />
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

          {/* Core Title inputs */}
          <div className="relative z-10 mb-4 border-b border-[#ebdcb9] pb-3 flex justify-between items-end">
            <div className="flex-1 select-text">
              <input
                type="text"
                value={pageItem.title}
                onChange={e => {
                  onUpdatePage({ ...pageItem, title: e.target.value });
                }}
                className="w-full bg-transparent font-display text-2.5xl font-bold text-[#3e2723] outline-none border-b border-transparent hover:border-[#ebdcb9] focus:border-[#8c2522] tracking-wide"
                placeholder="Title your canvas..."
              />
              <p className="text-[10px] text-[#5c4033] font-mono italic mt-1 uppercase">
                Calligraphic Blank Canvas • Synchronized {new Date(pageItem.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Embedded Custom Tables Overlay */}
          {localTables.map((tbl, tIdx) => {
            const borderStyleClass = tbl.styleConfig?.borderStyle === 'dashed' ? 'border-dashed' : 
                                     tbl.styleConfig?.borderStyle === 'dotted' ? 'border-dotted' : 
                                     tbl.styleConfig?.borderStyle === 'none' ? 'border-none' : 'border-solid';
            const borderColorClass = tbl.styleConfig?.borderColor ? colorClassMap[tbl.styleConfig.borderColor]?.border : 'border-[#ebdcb9]';

            return (
              <div key={tIdx} className="absolute z-30 border border-[#ebdcb9] bg-white/95 p-3 rounded shadow-md w-72 group/hwtab flex flex-col pointer-events-auto select-text" style={{ top: 180 + (tIdx * 210), right: 30 }}>
                <div className="flex items-center justify-between mb-1.5 border-b border-stone-200 pb-1">
                  <span className="text-[9px] font-bold text-[#8c2522] uppercase tracking-wide">📚 Margin ledger #{tIdx + 1}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleAddTableCol(tIdx)}
                      className="text-[#5c4033] hover:text-[#8c2522] text-[9.5px] font-bold"
                      title="Add column"
                    >
                      + Col
                    </button>
                    <button
                      onClick={() => handleDeleteTable(tIdx)}
                      className="opacity-0 group-hover/hwtab:opacity-100 text-red-800 p-0.5 rounded-sm hover:bg-red-50 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <table className={`w-full border-collapse text-[10px] ${borderStyleClass} ${borderColorClass}`}>
                  <thead>
                    <tr className="border-b border-stone-300">
                      {tbl.headers.map((h, cIdx) => {
                        const colStyle = tbl.colStyles?.[cIdx];
                        const headerBg = tbl.styleConfig?.headerBg ? colorClassMap[tbl.styleConfig.headerBg]?.bg : 'bg-stone-100';
                        const headerTextColor = tbl.styleConfig?.headerBg ? colorClassMap[tbl.styleConfig.headerBg]?.text : 'text-stone-800';
                        const headerBold = tbl.styleConfig?.headerBold !== false ? 'font-bold' : '';
                        const headerItalic = tbl.styleConfig?.headerItalic ? 'italic' : '';
                        const widthStyle = colStyle?.width || 'auto';

                        return (
                          <th 
                            key={cIdx} 
                            className={`p-1 border-r text-start ${headerBg} ${headerTextColor} ${headerBold} ${headerItalic}`}
                            style={{ width: widthStyle }}
                          >
                            <input
                              type="text"
                              value={h}
                              onChange={e => handleUpdateTableHeader(tIdx, cIdx, e.target.value)}
                              className="bg-transparent font-bold text-[10px] w-full outline-none"
                            />
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {tbl.rows.map((row, rIdx) => {
                      const rStyle = tbl.rowStyles?.[rIdx];
                      const rowBgClass = rStyle?.bg ? colorClassMap[rStyle.bg]?.bg : (tbl.styleConfig?.zebraBanded && rIdx % 2 === 1 ? 'bg-stone-50' : 'bg-transparent');
                      const rowTextClass = rStyle?.textColor ? colorClassMap[rStyle.textColor]?.text : 'text-[#333333]';
                      const rowBoldClass = rStyle?.bold ? 'font-bold' : '';
                      const rowItalicClass = rStyle?.italic ? 'italic' : '';

                      return (
                        <tr key={rIdx} className={`border-b border-stone-200 ${rowBgClass} ${rowTextClass} ${rowBoldClass} ${rowItalicClass}`}>
                          {row.map((cell, cIdx) => {
                            const cellStyleKey = `${rIdx}-${cIdx}`;
                            const cStyle = tbl.cellStyles?.[cellStyleKey];
                            const colStyle = tbl.colStyles?.[cIdx];

                            const cellBgClass = cStyle?.bg ? colorClassMap[cStyle.bg]?.bg : (colStyle?.bg ? colorClassMap[colStyle.bg]?.bg : 'bg-transparent');
                            const cellTextClass = cStyle?.textColor ? colorClassMap[cStyle.textColor]?.text : (colStyle?.textColor ? colorClassMap[colStyle.textColor]?.text : '');
                            const cellAlignClass = cStyle?.align === 'center' ? 'text-center' : cStyle?.align === 'right' ? 'text-right' : (colStyle?.align === 'center' ? 'text-center' : colStyle?.align === 'right' ? 'text-right' : 'text-left');
                            
                            const isBoldText = cStyle?.bold !== undefined ? cStyle.bold : (colStyle?.bold !== undefined ? colStyle.bold : false);
                            const isItalicText = cStyle?.italic !== undefined ? cStyle.italic : (colStyle?.italic !== undefined ? colStyle.italic : false);
                            const isUnderlineText = cStyle?.underline || false;

                            const cellBoldClass = isBoldText ? 'font-bold' : '';
                            const cellItalicClass = isItalicText ? 'italic' : '';
                            const cellUnderlineClass = isUnderlineText ? 'underline' : '';
                            
                            const widthStyle = colStyle?.width || 'auto';

                            return (
                              <td key={cIdx} className={`p-0.5 px-1 border-r border-stone-200 ${cellBgClass} ${cellTextClass} ${cellAlignClass} ${cellBoldClass} ${cellItalicClass} ${cellUnderlineClass}`} style={{ width: widthStyle }}>
                                <input
                                  type="text"
                                  value={cell}
                                  onChange={e => handleUpdateTableCell(tIdx, rIdx, cIdx, e.target.value)}
                                  placeholder="cell..."
                                  className="bg-transparent text-[10px] w-full outline-none"
                                />
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-1 pb-0.5">
                  <button
                    onClick={() => handleAddTableRow(tIdx)}
                    className="text-left text-[9px] font-bold text-[#5c4033] hover:text-[#8c2522]"
                  >
                    + Row
                  </button>
                  <span className="text-[8px] text-stone-400 font-mono">w-resizable</span>
                </div>
              </div>
            );
          })}

          {/* Embedded Vector Shapes on Canvas */}
          {localShapes.map(shape => (
            <div
              key={shape.id}
              style={{
                position: 'absolute',
                left: shape.x,
                top: shape.y,
                width: shape.width,
                height: shape.height,
              }}
              className="z-15 group/hwshape flex items-center justify-center pointer-events-auto"
            >
              {shape.type === 'rectangle' && (
                <div className="absolute inset-0 border-2" style={{ borderColor: shape.color }} />
              )}
              {shape.type === 'circle' && (
                <div className="absolute inset-0 border-2 rounded-full" style={{ borderColor: shape.color }} />
              )}
              {shape.type === 'line' && (
                <div className="absolute top-[50%] inset-x-0 border-t-2" style={{ borderColor: shape.color }} />
              )}

              <div className="absolute -top-6 right-0 p-1 flex items-center gap-1 rounded bg-[#3e2723] scale-75 opacity-0 group-hover/hwshape:opacity-100 transition-all pointer-events-auto">
                <button
                  onClick={() => handleDeleteShape(shape.id)}
                  className="p-0.5 text-white"
                  title="Remove Shape bounds"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}

          {/* HAND STYLE CANVAS LAYER */}
          <canvas
            ref={canvasRef}
            width={850}
            height={1150}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="absolute inset-0 w-full h-full z-20 cursor-crosshair select-none"
          />

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
