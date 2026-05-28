import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Eraser, Download, Check, RefreshCw, Upload, Eye, FileText, 
  Table as TableIcon, Maximize2, Palette, Settings, BookOpen, Sliders 
} from 'lucide-react';
import { ImportedDocument, PageSize, PaperStyle, CustomMargin } from '../types';

interface DocumentAnnotatorProps {
  documentItem: ImportedDocument | null;
  onUpdateDocument: (updated: ImportedDocument) => void;
}

export default function DocumentAnnotator({ documentItem, onUpdateDocument }: DocumentAnnotatorProps) {
  const [activeTool, setActiveTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen');
  const [penColor, setPenColor] = useState<string>('#1a2d54'); // default navy ink
  const [penSize, setPenSize] = useState<number>(3);
  const [highlighterColor, setHighlighterColor] = useState<string>('rgba(198, 146, 20, 0.35)'); // antique ochre
  const [highlighterSize, setHighlighterSize] = useState<number>(18);
  const [eraserSize, setEraserSize] = useState<number>(25);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [pageSize, setPageSize] = useState<PageSize>('Letter');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ruled');
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

  // Load state from active document item
  useEffect(() => {
    if (documentItem) {
      setPageSize(documentItem.pageSize);
      setPaperStyle(documentItem.paperStyle);
      setHasMargin(documentItem.hasMargin);
      setMarginColor(documentItem.marginColor || '#f87171');
      setMarginPosition(documentItem.marginPosition !== undefined ? documentItem.marginPosition : 75);
      setMarginPositionLeft(documentItem.marginPositionLeft !== undefined ? documentItem.marginPositionLeft : (documentItem.marginPosition !== undefined ? documentItem.marginPosition : 75));
      setMarginPositionRight(documentItem.marginPositionRight !== undefined ? documentItem.marginPositionRight : (documentItem.marginPosition !== undefined ? documentItem.marginPosition : 75));
      setMarginPositionTop(documentItem.marginPositionTop !== undefined ? documentItem.marginPositionTop : 60);
      setMarginPositionBottom(documentItem.marginPositionBottom !== undefined ? documentItem.marginPositionBottom : 60);
      setHasHorizontalMargin(!!documentItem.hasHorizontalMargin);
      setMarginStyle(documentItem.marginStyle || 'solid');
      setMarginSide(documentItem.marginSide || 'left');
      setCustomMargins(documentItem.customMargins || []);
      loadCanvasAnnotation();
    }
  }, [documentItem?.id]);

  const saveDocumentChanges = (updates: Partial<ImportedDocument>) => {
    if (!documentItem) return;
    onUpdateDocument({
      ...documentItem,
      ...updates
    });
  };

  const addCustomMargin = (type: 'vertical-left' | 'vertical-right' | 'horizontal-top' | 'horizontal-bottom') => {
    const newMargin: CustomMargin = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      position: 120
    };
    const updated = [...customMargins, newMargin];
    setCustomMargins(updated);
    saveDocumentChanges({ customMargins: updated });
  };

  const removeCustomMargin = (id: string) => {
    const updated = customMargins.filter(m => m.id !== id);
    setCustomMargins(updated);
    saveDocumentChanges({ customMargins: updated });
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
      saveDocumentChanges({ marginPositionLeft: newValue, marginPosition: newValue });
    } else if (draggingId === 'right') {
      newValue = Math.max(15, Math.min(300, Math.round(container.width - x)));
      setMarginPositionRight(newValue);
      saveDocumentChanges({ marginPositionRight: newValue });
    } else if (draggingId === 'top') {
      newValue = Math.max(15, Math.min(300, Math.round(y)));
      setMarginPositionTop(newValue);
      saveDocumentChanges({ marginPositionTop: newValue });
    } else if (draggingId === 'bottom') {
      newValue = Math.max(15, Math.min(300, Math.round(container.height - y)));
      setMarginPositionBottom(newValue);
      saveDocumentChanges({ marginPositionBottom: newValue });
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
        saveDocumentChanges({ customMargins: updated });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDraggingId(null);
    }
  };

  const loadCanvasAnnotation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (documentItem?.annotations) {
      const img = new Image();
      img.src = documentItem.annotations;
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
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = highlighterColor;
      ctx.lineWidth = highlighterSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      ctx.moveTo(lastPos.x, lastPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Beautiful anti-aliasing soft edges
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

    // Reset shadow values for subsequent drawings
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    setLastPos({ x, y });
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveAnnotations();
  };

  const saveAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas || !documentItem) return;
    const dataUrl = canvas.toDataURL();
    onUpdateDocument({
      ...documentItem,
      annotations: dataUrl,
      pageSize,
      paperStyle,
      hasMargin,
      marginColor,
      marginPosition,
      marginPositionLeft,
      marginPositionRight,
      marginPositionTop,
      marginPositionBottom,
      marginStyle,
      marginSide,
      hasHorizontalMargin
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !documentItem) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onUpdateDocument({
      ...documentItem,
      annotations: '',
    });
  };

  // Convert loaded device image/pdf upload to view
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !documentItem) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateDocument({
            ...documentItem,
            fileType: 'image',
            fileUrl: event.target.result as string,
            title: file.name
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateDocument({
            ...documentItem,
            fileType: 'txt',
            fileUrl: event.target.result as string,
            title: file.name
          });
        }
      };
      reader.readAsText(file);
    }
  };

  if (!documentItem) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#fdfbf7] p-8 text-center font-serif">
        <div className="max-w-md rounded-md border border-[#ebdcb9] bg-[#fcf8f2] p-8 shadow-xs">
          <BookOpen className="mx-auto h-12 w-12 text-[#ebdcb9] mb-4" />
          <h2 className="font-display text-xl font-bold text-[#3e2723] mb-2">No Document Selected</h2>
          <p className="text-xs text-[#5c4033] leading-relaxed mb-4">
            Select an annotated book draft from your Literary Cabinet, or import a text sheet to begin scribing directly onto the parchment margins.
          </p>
        </div>
      </div>
    );
  }

  // Sizing styles
  const sizeClasses: Record<PageSize, string> = {
    Letter: 'w-full max-w-[800px] min-h-[1000px]',
    A4: 'w-full max-w-[760px] min-h-[1050px]',
    A5: 'w-full max-w-[550px] min-h-[750px]',
    Pocket: 'w-full max-w-[420px] min-h-[580px]',
    Legal: 'w-full max-w-[840px] min-h-[1200px]',
    Letter_Landscape: 'w-full max-w-[1050px] min-h-[750px]',
    A4_Landscape: 'w-full max-w-[1080px] min-h-[720px]',
    Square_Sm: 'w-full max-w-[600px] min-h-[600px]',
    Square_Lg: 'w-full max-w-[800px] min-h-[800px]'
  };

  return (
    <div className="flex flex-1 flex-col bg-[#faf4eb] overflow-hidden font-serif">
      {/* Scrollable Document Area Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2d6c5] bg-[#fcf8f2] px-6 py-2.5 shadow-2xs">
        {/* Tools */}
        <div className="flex items-center gap-1">
          {/* Pen */}
          <button
            onClick={() => setActiveTool('pen')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold select-none ${
              activeTool === 'pen' ? 'bg-[#5c4033] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'
            }`}
          >
            <PenTool className="h-4 w-4" />
            <span>Iron Pen</span>
          </button>

          {/* Highlighter */}
          <button
            onClick={() => setActiveTool('highlighter')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold select-none ${
              activeTool === 'highlighter' ? 'bg-[#c69214] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'
            }`}
          >
            <Palette className="h-4 w-4" />
            <span>Highlighter</span>
          </button>

          {/* Eraser */}
          <button
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-semibold select-none ${
              activeTool === 'eraser' ? 'bg-[#8c2522] text-white' : 'text-[#5c4033] hover:bg-[#faf4eb]'
            }`}
          >
            <Eraser className="h-4 w-4" />
            <span>Clean Eraser</span>
          </button>
        </div>

        {/* Color Palette Selector */}
        {activeTool === 'pen' && (
          <div className="flex items-center gap-2 border-l border-[#e2d6c5] pl-3">
            <span className="text-[10px] font-bold text-[#5c4033] uppercase">Ink:</span>
            <div className="flex items-center gap-1.5">
              {[
                { hex: '#1a2d54', name: 'Royal Navy' },
                { hex: '#8c2522', name: 'Iron Maroon' },
                { hex: '#3b5220', name: 'Olive Sage' },
                { hex: '#5c4033', name: 'Sepia Dust' },
                { hex: '#333333', name: 'Carbon' }
              ].map(col => (
                <button
                  key={col.hex}
                  onClick={() => setPenColor(col.hex)}
                  title={col.name}
                  className={`relative h-5 w-5 rounded-full border border-black/10 transition-transform ${
                    penColor === col.hex ? 'scale-120 ring-1 ring-[#8c2522] ring-offset-1' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: col.hex }}
                />
              ))}
            </div>

            <span className="text-[10px] font-bold text-[#5c4033] uppercase ml-2">Tip:</span>
            <input
              type="range"
              min={1}
              max={10}
              value={penSize}
              onChange={e => setPenSize(Number(e.target.value))}
              className="w-16 accent-[#5c4033]"
            />
          </div>
        )}

         {/* Highlighter colors */}
        {activeTool === 'highlighter' && (
          <div className="flex items-center gap-2 border-l border-[#e2d6c5] pl-3">
            <span className="text-[10px] font-bold text-[#5c4033] uppercase">Tint:</span>
            <div className="flex items-center gap-1.5">
              {[
                { rgba: 'rgba(198, 146, 20, 0.35)', name: 'Ochre' },
                { rgba: 'rgba(140, 37, 34, 0.25)', name: 'Blush' },
                { rgba: 'rgba(59, 82, 32, 0.25)', name: 'Sage' },
                { rgba: 'rgba(26, 45, 84, 0.20)', name: 'Washed Navy' }
              ].map(hl => (
                <button
                  key={hl.rgba}
                  onClick={() => setHighlighterColor(hl.rgba)}
                  title={hl.name}
                  className={`h-5 w-5 rounded-full border border-black/10 transition-transform ${
                    highlighterColor === hl.rgba ? 'scale-120 ring-1 ring-[#8c2522] ring-offset-1' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: hl.rgba }}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-[#5c4033] uppercase ml-2">Width:</span>
            <input
              type="range"
              min={10}
              max={40}
              value={highlighterSize}
              onChange={e => setHighlighterSize(Number(e.target.value))}
              className="w-16 accent-[#c69214]"
            />
          </div>
        )}

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

        {/* Paper Style controls */}
        <div className="flex items-center gap-3 relative">
          {/* Format config indicators */}
          <div className="flex items-center gap-1.5 rounded border border-[#ebdcb9] bg-white px-2 py-1 text-xs text-[#5c4033]">
            <Settings className="h-3.5 w-3.5" />
            <select
              value={pageSize}
              onChange={e => {
                const s = e.target.value as PageSize;
                setPageSize(s);
                onUpdateDocument({ ...documentItem, pageSize: s });
              }}
              className="bg-transparent outline-none font-bold"
            >
              <option value="Letter">Letter</option>
              <option value="A4">A4 Size</option>
              <option value="A5">A5 Scroll</option>
              <option value="Pocket">Pocket Book</option>
              <option value="Legal">Legal Scroll</option>
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
                onUpdateDocument({ ...documentItem, paperStyle: p });
              }}
              className="bg-transparent outline-none font-bold border-l border-[#ebdcb9] pl-1.5"
            >
              <option value="unruled">Blank Parchment</option>
              <option value="ruled">Ruled Sheet</option>
              <option value="grid">Grid Sheet</option>
            </select>

            <label className="flex items-center gap-1 border-l border-[#ebdcb9] pl-1.5 cursor-pointer font-bold select-none">
              <input
                type="checkbox"
                checked={hasMargin}
                onChange={e => {
                  const m = e.target.checked;
                  setHasMargin(m);
                  onUpdateDocument({ ...documentItem, hasMargin: m });
                }}
                className="rounded accent-[#8c2522]"
              />
              <span>Margin</span>
            </label>
            {hasMargin && (
              <button
                type="button"
                onClick={() => setShowMarginStyles(!showMarginStyles)}
                className={`ml-1 select-none p-1 rounded-sm border transition-colors ${
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
                        saveDocumentChanges({ marginSide: side });
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
                      saveDocumentChanges({ marginPositionLeft: v, marginPosition: v });
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
                      saveDocumentChanges({ marginPositionRight: v });
                    }}
                    className="w-full cursor-pointer accent-[#8c2522]"
                  />
                </div>
              )}

              {/* Horizontal Guidelines Checkbox */}
              <div className="flex items-center gap-2 border-t border-[#ebdcb9]/40 pt-2 pb-1">
                <input
                  type="checkbox"
                  id="has-horizontal-margin-da"
                  checked={hasHorizontalMargin}
                  onChange={e => {
                    const checked = e.target.checked;
                    setHasHorizontalMargin(checked);
                    saveDocumentChanges({ hasHorizontalMargin: checked });
                  }}
                  className="rounded accent-[#8c2522] cursor-pointer"
                />
                <label htmlFor="has-horizontal-margin-da" className="font-bold text-[#5c4033] cursor-pointer select-none">
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
                      saveDocumentChanges({ marginPositionTop: v });
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
                      saveDocumentChanges({ marginPositionBottom: v });
                    }}
                    className="w-full cursor-pointer accent-[#8c2522]"
                  />
                </div>
              )}

              {/* Margin Line Style */}
              <div className="flex flex-col gap-1 border-t border-[#ebdcb9]/40 pt-2">
                <span className="font-bold text-[#5c4033]">Guideline Line Pattern:</span>
                <div className="grid grid-cols-4 gap-1 bg-[#faf4eb] p-0.5 rounded-sm flex-wrap">
                  {(['solid', 'dashed', 'dotted', 'double'] as const).map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => {
                        setMarginStyle(style);
                        saveDocumentChanges({ marginStyle: style });
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
                        saveDocumentChanges({ marginColor: col.hex });
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
                <div className="flex flex-col gap-1 border-t border-[#ebdcb9]/40 pt-2 max-h-[140px] overflow-y-auto w-full">
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
            onClick={clearCanvas}
            title="Clean All Pencil Annotations"
            className="rounded-sm border border-[#e5a2a2] bg-[#fcf8f2] px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-[#e5a2a2]/20"
          >
            Clear Draft
          </button>

          {/* Import file device btn */}
          <label className="flex items-center gap-1.5 rounded-sm bg-[#5c4033] px-3 py-1.5 text-xs font-bold text-[#fdfbf7] cursor-pointer hover:bg-[#3e2723]">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Replace File</span>
            <input
              type="file"
              onChange={handleLocalFileUpload}
              accept="text/plain,image/*"
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Parchment workspace view container */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start vintage-scroll">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}>
          <div
            id="scroll-paper-body"
            className={`relative bg-[#fdfbf7] ${sizeClasses[pageSize]} border-2 border-[#e2d6c5] shadow-md flex flex-col transition-all duration-300 ${
              draggingId ? 'select-none cursor-grabbing animate-none' : ''
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
          {/* Ruling Overlay if matching */}
          {paperStyle !== 'unruled' && (
            <div className={`absolute inset-0 pointer-events-none opacity-40 z-0 ${
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
                    className="absolute top-0 bottom-0 w-3 cursor-col-resize z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center animate-none"
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
                    className="absolute top-0 bottom-0 w-3 cursor-col-resize z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center animate-none"
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
                    className="absolute left-0 right-0 h-3 cursor-row-resize z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center animate-none"
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
                    className="absolute left-0 right-0 h-3 cursor-row-resize z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center animate-none"
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
                  className={`absolute z-30 group hover:bg-[#8c2522]/10 transition-colors pointer-events-auto flex items-center justify-center animate-none ${
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

          {/* Workspace Title */}
          <div className="relative z-10 mb-6 border-b border-[#ebdcb9] pb-4">
            <h2 className="font-display text-2xl font-bold text-[#3e2723] uppercase tracking-wide">
              {documentItem.title}
            </h2>
            <p className="text-[10px] text-[#5c4033] font-mono italic">
              Archived Leaf • Created {new Date(documentItem.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Content layer depending on file type */}
          <div className="relative z-10 flex-1 text-sm text-[#333] leading-relaxed select-text font-serif">
            {documentItem.fileType === 'txt' ? (
              <pre className="whitespace-pre-wrap font-serif text-[15px] italic text-[#3e2723]/90 leading-8">
                {documentItem.fileUrl}
              </pre>
            ) : (
              <div className="flex justify-center items-center py-4 bg-[#faf4eb]/30 border border-[#ebdcb9]/40 rounded-sm">
                <img
                  src={documentItem.fileUrl}
                  alt={documentItem.title}
                  referrerPolicy="no-referrer"
                  className="max-h-[700px] object-contain rounded-xs shadow-xs"
                />
              </div>
            )}
          </div>

          {/* Annotation Canvas Overlay */}
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
        </div>
        </div>
      </div>
    </div>
  );
}
