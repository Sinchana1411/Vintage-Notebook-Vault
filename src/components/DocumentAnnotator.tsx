import React, { useState, useRef, useEffect } from 'react';
import { 
  PenTool, Eraser, Download, Check, RefreshCw, Upload, Eye, FileText, 
  Table as TableIcon, Maximize2, Palette, Settings, BookOpen, Sliders 
} from 'lucide-react';
import { ImportedDocument, PageSize, PaperStyle, CustomMargin } from '../types';
import { StickyNotesSectionLayer, StickyNoteCard } from './StickyNoteOverlay';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to fetch natively instead of relying on iframe base64
const ver = pdfjsLib.version || '5.7.284';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${ver}/build/pdf.worker.min.mjs`;

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
  const currentStrokePointsRef = useRef<Array<{ x: number; y: number; pressure: number }>>([]);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1.0);
  const [pageSize, setPageSize] = useState<PageSize>('Portrait');
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
  const [customWidth, setCustomWidth] = useState<number>(800);
  const [customHeight, setCustomHeight] = useState<number>(1131);

  const sizePixels: Record<PageSize, { width: number; height: number }> = {
    Portrait: { width: 800, height: 1131 },
    Landscape: { width: 1131, height: 800 }
  };

  // PDF Viewer Natively rendered states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(1);
  const [pdf, setPdf] = useState<any>(null);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }>({ width: 720, height: 1000 });

  // Undo annotation history
  interface UndoAction { page: number; data: string; }
  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [redoStack, setRedoStack] = useState<UndoAction[]>([]);

  const isPdf = documentItem?.fileType === 'pdf';

  // Reset undo history only when file changes
  useEffect(() => {
    if (documentItem) {
      setUndoStack([]);
      setRedoStack([]);
      setCurrentPage(1);
    }
  }, [documentItem?.id]);

  const mappedPageSize = (val: string): PageSize => {
    if (val === 'Landscape' || val === 'Letter_Landscape' || val === 'A4_Landscape') {
      return 'Landscape';
    }
    return 'Portrait';
  };

  // Load state from active document item
  useEffect(() => {
    if (documentItem) {
      const mappedSize = mappedPageSize(documentItem.pageSize);
      setPageSize(mappedSize);
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

      const sizeDef = sizePixels[mappedSize];
      setCustomWidth((documentItem as any).customWidth || sizeDef.width);
      setCustomHeight((documentItem as any).customHeight || sizeDef.height);
    }
  }, [documentItem?.id, documentItem?.pageSize, (documentItem as any)?.customWidth, (documentItem as any)?.customHeight]);

  // Load PDF document on change
  useEffect(() => {
    if (documentItem?.fileType !== 'pdf' || !documentItem.fileUrl) {
      setPdf(null);
      setNumPages(1);
      return;
    }

    let active = true;
    const loadPDF = async () => {
      setPdfLoading(true);
      setPdfError(null);
      try {
        const fileUrl = documentItem.fileUrl;
        const base64Data = fileUrl.includes(',') ? fileUrl.split(',')[1] : fileUrl;
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const loadedPdf = await loadingTask.promise;
        if (active) {
          setPdf(loadedPdf);
          setNumPages(loadedPdf.numPages);
        }
      } catch (err: any) {
        console.error("PDF.js loading error:", err);
        if (active) {
          setPdfError(err.message || "Failed to load PDF document.");
        }
      } finally {
        if (active) setPdfLoading(false);
      }
    };

    loadPDF();
    return () => {
      active = false;
    };
  }, [documentItem?.id, documentItem?.fileUrl]);

  // Render current PDF page onto background canvas
  useEffect(() => {
    if (!pdf || documentItem?.fileType !== 'pdf') return;
    let active = true;
    let renderTask: any = null;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        if (!active) return;

        const canvas = pdfCanvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        // Fit page to A4 or Letter sheet width
        const initialViewport = page.getViewport({ scale: 1.0 });
        const desiredWidth = 720;
        const scaleVal = desiredWidth / initialViewport.width;
        const viewport = page.getViewport({ scale: scaleVal });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (active) {
          setPdfDimensions({ width: viewport.width, height: viewport.height });
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err) {
        console.error("PDF page rendering error:", err);
      }
    };

    renderPage();
    return () => {
      active = false;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdf, currentPage, documentItem?.fileType]);

  useEffect(() => {
    loadCanvasAnnotation();
  }, [documentItem?.id, currentPage]);

  const saveDocumentChanges = (updates: Partial<ImportedDocument>) => {
    if (!documentItem) return;
    onUpdateDocument({
      ...documentItem,
      ...updates
    });
  };

  const handleAddStickyNote = () => {
    if (!documentItem) return;
    const currentNotes = documentItem.stickyNotes || [];
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
    saveDocumentChanges({ stickyNotes: [...currentNotes, newNote] });
  };

  const handleUpdateStickyNote = (id: string, updates: Partial<any>) => {
    if (!documentItem) return;
    const updatedNotes = (documentItem.stickyNotes || []).map(note =>
      note.id === id ? { ...note, ...updates } : note
    );
    saveDocumentChanges({ stickyNotes: updatedNotes });
  };

  const handleDeleteStickyNote = (id: string) => {
    if (!documentItem) return;
    const updatedNotes = (documentItem.stickyNotes || []).filter(note => note.id !== id);
    saveDocumentChanges({ stickyNotes: updatedNotes });
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
    
    // Support per-page drawing map, gracefully falling back to page 1 annotations
    const pageAnns = (documentItem as any)?.pageAnnotations || {};
    const annotationSrc = pageAnns[currentPage] || (currentPage === 1 ? documentItem?.annotations : '');

    if (annotationSrc) {
      const img = new Image();
      img.src = annotationSrc;
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

  const getPressureSize = (baseSize: number, pressure: number | undefined): number => {
    if (pressure === undefined) return baseSize;
    const minFactor = 0.40;
    const maxFactor = 1.60;
    const factor = minFactor + (maxFactor - minFactor) * pressure;
    return baseSize * factor;
  };

  const drawStrokeSegment = (
    ctx: CanvasRenderingContext2D,
    tool: 'pen' | 'highlighter' | 'eraser',
    points: Array<{ x: number; y: number; pressure: number }>,
    addedPoints: Array<{ x: number; y: number; pressure: number }>
  ) => {
    if (points.length < 2) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const isHighlighter = tool === 'highlighter';
    const isEraser = tool === 'eraser';

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = eraserSize;
    } else if (isHighlighter) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = highlighterColor;
      ctx.lineWidth = highlighterSize;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.shadowBlur = 1.0;
      ctx.shadowColor = penColor;
    }

    const totalPoints = points.length;
    const startIndex = Math.max(0, totalPoints - addedPoints.length - 2);

    for (let i = startIndex + 1; i < totalPoints; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];

      const size1 = isEraser ? eraserSize : (isHighlighter ? highlighterSize : getPressureSize(penSize, p1.pressure));
      const size2 = isEraser ? eraserSize : (isHighlighter ? highlighterSize : getPressureSize(penSize, p2.pressure));

      ctx.beginPath();
      ctx.lineWidth = (size1 + size2) / 2;

      if (i > 1) {
        const p0 = points[i - 2];
        const xc = (p1.x + p2.x) / 2;
        const yc = (p1.y + p2.y) / 2;
        ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
        ctx.quadraticCurveTo(p1.x, p1.y, xc, yc);
      } else {
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
      }
      ctx.stroke();
    }
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);

    // Track state for undo before starting a drawing stroke
    const pageAnns = (documentItem as any)?.pageAnnotations || {};
    const currentData = pageAnns[currentPage] || (currentPage === 1 ? (documentItem?.annotations || '') : '');
    setUndoStack(prev => [...prev, { page: currentPage, data: currentData }]);
    setRedoStack([]); // Clear redo cache on a new user stroke

    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    let pressure = e.pressure;
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      pressure = 0;
    } else if (pressure === 0 || pressure === undefined) {
      pressure = 0.5;
    }

    setLastPos({ x, y });

    const points: Array<{ x: number; y: number; pressure: number }> = [];
    if (e.nativeEvent && typeof e.nativeEvent.getCoalescedEvents === 'function') {
      const coalesced = e.nativeEvent.getCoalescedEvents();
      if (coalesced && coalesced.length > 0) {
        coalesced.forEach(ce => {
          const cx = (ce.clientX - rect.left) * (canvas.width / rect.width);
          const cy = (ce.clientY - rect.top) * (canvas.height / rect.height);
          let cp = ce.pressure;
          if (ce.pointerType === 'mouse' && ce.buttons === 0) {
            cp = 0;
          } else if (cp === 0 || cp === undefined) {
            cp = 0.5;
          }
          points.push({ x: cx, y: cy, pressure: cp });
        });
      }
    }

    if (points.length === 0) {
      points.push({ x, y, pressure });
    }

    currentStrokePointsRef.current = points;

    const ctx = canvas.getContext('2d');
    if (ctx && points.length === 1 && activeTool !== 'eraser') {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const size = activeTool === 'highlighter' ? highlighterSize : getPressureSize(penSize, pressure);
      ctx.beginPath();
      if (activeTool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = highlighterColor;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = penColor;
      }
      ctx.arc(x, y, size / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    let pressure = e.pressure;
    if (e.pointerType === 'mouse' && e.buttons === 0) {
      pressure = 0;
    } else if (pressure === 0 || pressure === undefined) {
      pressure = 0.5;
    }

    const newPoints: Array<{ x: number; y: number; pressure: number }> = [];
    if (e.nativeEvent && typeof e.nativeEvent.getCoalescedEvents === 'function') {
      const coalesced = e.nativeEvent.getCoalescedEvents();
      if (coalesced && coalesced.length > 0) {
        coalesced.forEach(ce => {
          const cx = (ce.clientX - rect.left) * (canvas.width / rect.width);
          const cy = (ce.clientY - rect.top) * (canvas.height / rect.height);
          let cp = ce.pressure;
          if (ce.pointerType === 'mouse' && ce.buttons === 0) {
            cp = 0;
          } else if (cp === 0 || cp === undefined) {
            cp = 0.5;
          }
          newPoints.push({ x: cx, y: cy, pressure: cp });
        });
      }
    }

    if (newPoints.length === 0) {
      newPoints.push({ x, y, pressure });
    }

    currentStrokePointsRef.current.push(...newPoints);

    ctx.save();
    drawStrokeSegment(ctx, activeTool, currentStrokePointsRef.current, newPoints);
    ctx.restore();

    setLastPos({ x, y });
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch (err) {
        // Safe fallback
      }
    }

    currentStrokePointsRef.current = [];
    saveAnnotations();
  };

  const saveAnnotations = () => {
    const canvas = canvasRef.current;
    if (!canvas || !documentItem) return;
    const dataUrl = canvas.toDataURL();
    
    const pageAnns = (documentItem as any)?.pageAnnotations || {};
    const updatedPageAnns = {
      ...pageAnns,
      [currentPage]: dataUrl
    };

    onUpdateDocument({
      ...documentItem,
      annotations: currentPage === 1 ? dataUrl : (documentItem.annotations || ''),
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
      hasHorizontalMargin,
      ...({ pageAnnotations: updatedPageAnns } as any)
    });
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !documentItem) return;

    // Track state for undo before clearing the canvas
    const pageAnns = (documentItem as any)?.pageAnnotations || {};
    const currentData = pageAnns[currentPage] || (currentPage === 1 ? (documentItem?.annotations || '') : '');
    setUndoStack(prev => [...prev, { page: currentPage, data: currentData }]);
    setRedoStack([]); // Clear redo stack on clear

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const updatedPageAnns = {
      ...pageAnns,
      [currentPage]: ''
    };

    onUpdateDocument({
      ...documentItem,
      annotations: currentPage === 1 ? '' : (documentItem.annotations || ''),
      ...({ pageAnnotations: updatedPageAnns } as any)
    });
  };

  const handleUndo = () => {
    if (undoStack.length === 0) return;

    const lastAction = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));

    // Save current state for redo
    const pageAnns = (documentItem as any)?.pageAnnotations || {};
    const currentData = pageAnns[currentPage] || (currentPage === 1 ? (documentItem?.annotations || '') : '');
    setRedoStack(prev => [...prev, { page: currentPage, data: currentData }]);

    if (lastAction.page !== currentPage) {
      setCurrentPage(lastAction.page);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (lastAction.data) {
      const img = new Image();
      img.src = lastAction.data;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }

    const updatedPageAnns = {
      ...pageAnns,
      [lastAction.page]: lastAction.data
    };

    onUpdateDocument({
      ...documentItem,
      annotations: lastAction.page === 1 ? lastAction.data : (documentItem.annotations || ''),
      ...({ pageAnnotations: updatedPageAnns } as any)
    });
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;

    const lastRedo = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));

    // Save current state for undo before applying redo
    const pageAnns = (documentItem as any)?.pageAnnotations || {};
    const currentData = pageAnns[currentPage] || (currentPage === 1 ? (documentItem?.annotations || '') : '');
    setUndoStack(prev => [...prev, { page: currentPage, data: currentData }]);

    if (lastRedo.page !== currentPage) {
      setCurrentPage(lastRedo.page);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (lastRedo.data) {
      const img = new Image();
      img.src = lastRedo.data;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }

    const updatedPageAnns = {
      ...pageAnns,
      [lastRedo.page]: lastRedo.data
    };

    onUpdateDocument({
      ...documentItem,
      annotations: lastRedo.page === 1 ? lastRedo.data : (documentItem.annotations || ''),
      ...({ pageAnnotations: updatedPageAnns } as any)
    });
  };

  // Convert loaded device pdf upload to view
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !documentItem) return;
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file.type !== "application/pdf" && file.name.slice(-4).toLowerCase() !== '.pdf') {
      alert("Please upload standard document files strictly in PDF format.");
      return;
    }

    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdateDocument({
          ...documentItem,
          fileType: 'pdf',
          fileUrl: event.target.result as string,
          title: file.name
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('scroll-paper-body');
    if (!element || !documentItem) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(element, {
        scale: 2, // higher scale for crisp high-res layout
        useCORS: true,
        backgroundColor: '#fdfbf7', // vintage paper background
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const sanitisedTitle = documentItem.title.replace(/\.[^/.]+$/, ""); // strip extension
      pdf.save(`${sanitisedTitle || 'document'}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF: ', error);
      alert('Could not export to PDF. Please try again.');
    }
  };

  if (!documentItem) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-[#fdfbf7] p-8 text-center font-serif">
        <div className="max-w-md rounded-md border border-[#ebdcb9] bg-[#fcf8f2] p-8 shadow-xs">
          <BookOpen className="mx-auto h-12 w-12 text-[#ebdcb9] mb-4" />
          <h2 className="font-display text-xl font-bold text-[#3e2723] mb-2">No Document Selected</h2>
          <p className="text-xs text-[#5c4033] leading-relaxed mb-4">
            Select an annotated book draft from your Literary Cabinet, or import a PDF document to begin scribing directly onto the parchment margins.
          </p>
        </div>
      </div>
    );
  }

  // Sizing styles
  const sizeClasses: Record<PageSize, string> = {
    Portrait: 'w-full max-w-[800px] min-h-[1131px]',
    Landscape: 'w-full max-w-[1131px] min-h-[800px]'
  };

  return (
    <div className="flex flex-1 flex-col bg-[#faf4eb] overflow-hidden font-serif">
      {/* Scrollable Document Area Toolbar */}
      <div className="relative z-30 flex flex-wrap items-center justify-between gap-4 border-b border-[#e2d6c5] bg-[#fcf8f2] px-6 py-2.5 shadow-2xs">
        {/* Tools */}
        <div className="flex items-center gap-1">
          {isPdf && (
            <span className="flex items-center gap-1.5 rounded bg-[#8c2522]/10 border border-[#8c2522]/25 px-2.5 py-1 text-[11px] font-bold text-[#8c2522] uppercase tracking-wide mr-2 select-none">
              📖 PDF Leaf
            </span>
          )}
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
          {!isPdf && (
            <div className="flex flex-col gap-1.5 text-xs relative select-none">
              {/* Keep the undo/redo button row ABOVE the page shape changing slot */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={undoStack.length === 0}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-bold transition-all cursor-pointer border text-[11px] ${
                    undoStack.length > 0
                      ? 'bg-red-50 border-[#8c2522] text-[#8c2522] hover:bg-red-100 shadow-2xs'
                      : 'bg-[#faf4eb] border-[#ebdcb9]/60 text-[#5c4033]/40 cursor-not-allowed opacity-60'
                  }`}
                  title="Undo last stroke"
                >
                  <span className="text-sm">↩</span>
                  <span>Undo Stroke</span>
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  disabled={redoStack.length === 0}
                  className={`flex items-center gap-1.5 rounded px-2.5 py-1 font-bold transition-all cursor-pointer border text-[11px] ${
                    redoStack.length > 0
                      ? 'bg-red-50 border-[#8c2522] text-[#8c2522] hover:bg-red-100 shadow-2xs'
                      : 'bg-[#faf4eb] border-[#ebdcb9]/60 text-[#5c4033]/40 cursor-not-allowed opacity-60'
                  }`}
                  title="Redo last stroke"
                >
                  <span>Redo Stroke</span>
                  <span className="text-sm">↪</span>
                </button>
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="rounded border border-[#e5a2a2] bg-[#fcf8f2] px-2.5 py-1 font-bold text-red-800 hover:bg-[#e5a2a2]/20 select-none cursor-pointer"
                  title="Clear all doodles"
                >
                  Clear All
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
                      onUpdateDocument({
                        ...documentItem,
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
                        onUpdateDocument({ ...documentItem, customWidth: w, customHeight: h } as any);
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
                        onUpdateDocument({ ...documentItem, customWidth: w, customHeight: h } as any);
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
                        onUpdateDocument({ ...documentItem, customWidth: w, customHeight: h } as any);
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
                        onUpdateDocument({ ...documentItem, customWidth: w, customHeight: h } as any);
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
          )}

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

          {/* PDF Page/Leaf Navigator */}
          {documentItem?.fileType === 'pdf' && numPages > 1 && (
            <div className="flex items-center gap-1.5 border-l border-[#ebdcb9] pl-3 text-xs select-none">
              <span className="text-[10px] font-bold text-[#5c4033] uppercase font-mono">Leaf:</span>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded bg-[#faf4eb] hover:bg-[#ebdcb9] border border-[#ebdcb9]/60 font-bold hover:scale-105 active:scale-95 transition-all w-6 h-6 flex items-center justify-center text-xs text-[#5c4033] cursor-pointer disabled:opacity-40"
                title="Scribe Back Leaf"
              >
                ◀
              </button>
              <span className="font-mono text-[11px] text-[#5c4033] min-w-[50px] text-center font-bold">
                {currentPage} of {numPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage(prev => Math.min(numPages, prev + 1))}
                className="p-1 rounded bg-[#faf4eb] hover:bg-[#ebdcb9] border border-[#ebdcb9]/60 font-bold hover:scale-105 active:scale-95 transition-all w-6 h-6 flex items-center justify-center text-xs text-[#5c4033] cursor-pointer disabled:opacity-40"
                title="Scribe Forward Leaf"
              >
                ▶
              </button>
            </div>
          )}

          {/* Sticky Notes Button */}
          <div className="border-l border-[#ebdcb9] pl-3 h-full flex items-center">
            <button
              type="button"
              onClick={handleAddStickyNote}
              disabled={!documentItem}
              className="flex items-center gap-1 p-1 px-2 pb-1.5 bg-amber-500/10 border border-amber-600/30 text-amber-900 hover:bg-amber-500/25 rounded shadow-xs text-[11px] font-semibold cursor-pointer select-none transition-all disabled:opacity-50"
              title="Add customizable Sticky Note annotation onto this document"
            >
              <span className="text-amber-700">📌</span>
              <span>Add Sticky Note</span>
            </button>
          </div>

          {/* Export to PDF Button */}
          <div className="border-l border-[#ebdcb9] pl-3 h-full flex items-center">
            <button
              type="button"
              onClick={exportToPDF}
              disabled={!documentItem}
              className="flex items-center gap-1.5 p-1 px-2.5 pb-1.5 bg-[#8c2522]/10 border border-[#8c2522]/35 text-[#8c2522] hover:bg-[#8c2522]/25 rounded shadow-xs text-[11px] font-bold cursor-pointer select-none transition-all disabled:opacity-50"
              title="Export this annotated document strictly in PDF format"
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

          {/* Clear Draft button */}
          <button
            onClick={clearCanvas}
            title="Clean All Pencil Annotations"
            className="rounded-sm border border-[#e5a2a2] bg-[#fcf8f2] px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-[#e5a2a2]/20"
          >
            Clear Draft
          </button>

          {/* Undo Annotations Button */}
          <button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            title="Undo last annotation stroke"
            className="rounded-sm border border-[#ebdcb9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5c4033] hover:bg-[#faf4eb] disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer select-none"
          >
            <span className="text-sm">↩</span>
            <span>Undo Stroke</span>
          </button>

          {/* Redo Annotations Button */}
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Redo last annotation stroke"
            className="rounded-sm border border-[#ebdcb9] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5c4033] hover:bg-[#faf4eb] disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer select-none"
          >
            <span className="text-sm">↪</span>
            <span>Redo Stroke</span>
          </button>

          {/* Import file device btn */}
          <label className="flex items-center gap-1.5 rounded-sm bg-[#5c4033] px-3 py-1.5 text-xs font-bold text-[#fdfbf7] cursor-pointer hover:bg-[#3e2723]">
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">{isPdf ? 'Replace PDF' : 'Replace document'}</span>
            <input
              type="file"
              onChange={handleLocalFileUpload}
              accept="application/pdf"
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
            className={isPdf 
              ? "relative bg-[#fdfbf7] border-2 border-[#e2d6c5] shadow-md flex flex-col transition-all duration-300"
              : `relative bg-[#fdfbf7] border-2 border-[#e2d6c5] shadow-md flex flex-col transition-all duration-300 ${
                  draggingId ? 'select-none cursor-grabbing animate-none' : ''
                }`
            }
            style={isPdf 
              ? { width: `${pdfDimensions.width}px`, height: `${pdfDimensions.height}px`, padding: 0 }
              : {
                  width: `${customWidth}px`,
                  height: `${customHeight}px`,
                  paddingLeft: hasMargin && marginSide !== 'right' ? `${marginPositionLeft + 24}px` : '48px',
                  paddingRight: hasMargin && marginSide !== 'left' ? `${marginPositionRight + 24}px` : '48px',
                  paddingTop: hasMargin && hasHorizontalMargin ? `${marginPositionTop + 24}px` : '48px',
                  paddingBottom: hasMargin && hasHorizontalMargin ? `${marginPositionBottom + 48}px` : '64px',
                }
            }
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
          {/* Ruling Overlay if matching */}
          {!isPdf && paperStyle !== 'unruled' && (
            <div className={`absolute inset-0 pointer-events-none opacity-40 z-0 ${
              paperStyle === 'ruled' ? 'paper-ruled' : 'paper-grid'
            }`} />
          )}

          {/* Scribe Guideline Margin Line */}
          {!isPdf && hasMargin && (
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
          {!isPdf && hasMargin && customMargins && customMargins.map(m => {
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
          {!isPdf && (
            <div className="relative z-10 mb-6 border-b border-[#ebdcb9] pb-4">
              <h2 className="font-display text-2xl font-bold text-[#3e2723] uppercase tracking-wide">
                {documentItem.title}
              </h2>
              <p className="text-[10px] text-[#5c4033] font-mono italic">
                Archived Leaf • Created {new Date(documentItem.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Content layer depending on file type */}
          <div className="relative z-10 flex-1 text-sm text-[#333] leading-relaxed select-text font-serif">
            {documentItem.fileType === 'pdf' ? (
              <div className="absolute inset-0 z-0 bg-transparent select-none pointer-events-none">
                {pdfLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-600 font-sans">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8c2522] mb-3 border-t-transparent"></div>
                    <p className="text-xs font-bold uppercase tracking-wider">Unrolling Ancient Manuscript Scroll...</p>
                  </div>
                )}
                {pdfError && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-[#8c2522] bg-red-50 border border-red-200 rounded font-sans">
                    <div>
                      <p className="font-bold">Scribe Decryption Error</p>
                      <p className="text-xs mt-1">{pdfError}</p>
                    </div>
                  </div>
                )}
                {!pdfLoading && !pdfError && (
                  <canvas ref={pdfCanvasRef} className="w-full h-full rounded-sm" />
                )}
              </div>
            ) : documentItem.fileType === 'txt' ? (
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
            width={isPdf ? pdfDimensions.width : 850}
            height={isPdf ? pdfDimensions.height : 1150}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            onPointerCancel={stopDrawing}
            className="absolute inset-0 w-full h-full z-20 cursor-crosshair select-none"
            style={{ touchAction: 'none' }}
          />

          {/* Draggable Sticky Notes Annotation Overlay */}
          {documentItem && documentItem.stickyNotes && documentItem.stickyNotes.map(note => (
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
