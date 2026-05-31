import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Pin, Layers, Minimize2, Move, Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { StickyNote } from '../types';

interface StickyNoteCardProps {
  key?: any;
  note: StickyNote;
  onUpdate: (id: string, updates: Partial<any>) => void;
  onDelete: (id: string) => void;
}

export function StickyNoteCard({ note, onUpdate, onDelete }: StickyNoteCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showConfig, setShowConfig] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Font-style calculators
  const getFontFamily = () => {
    switch (note.fontFamily) {
      case 'serif':
        return "var(--font-serif), 'EB Garamond', Georgia, serif";
      case 'sans':
        return "system-ui, -apple-system, sans-serif";
      case 'mono':
        return "var(--font-mono), 'Fira Code', monospace";
      case 'cursive':
      default:
        return "var(--font-cursive), 'Alex Brush', cursive";
    }
  };

  const getFontSize = () => {
    switch (note.fontSize) {
      case 'sm':
        return note.fontFamily === 'cursive' ? '12px' : '11px';
      case 'lg':
        return note.fontFamily === 'cursive' ? '20px' : '16px';
      case 'xl':
        return note.fontFamily === 'cursive' ? '26px' : '20px';
      case 'base':
      default:
        return note.fontFamily === 'cursive' ? '16px' : '13px';
    }
  };

  // Focus and click-away listeners
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsSelected(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Local drag mechanics
  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLTextAreaElement ||
      e.target instanceof HTMLInputElement ||
      (e.target as HTMLElement).closest('.note-controls')
    ) {
      return;
    }
    
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - note.x,
      y: e.clientY - note.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onUpdate(note.id, {
        x: Math.max(0, e.clientX - dragOffset.x),
        y: Math.max(0, e.clientY - dragOffset.y)
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, note.id, onUpdate]);

  // Color options
  const colors = [
    { value: 'bg-[#fef9c3] border-[#fef08a] text-yellow-950', label: 'Yellow', dot: 'bg-yellow-300' },
    { value: 'bg-[#fce7f3] border-[#fbcfe8] text-pink-950', label: 'Pink', dot: 'bg-pink-300' },
    { value: 'bg-[#e0f2fe] border-[#bae6fd] text-sky-950', label: 'Blue', dot: 'bg-sky-300' },
    { value: 'bg-[#dcfce7] border-[#bbf7d0] text-green-950', label: 'Sage', dot: 'bg-green-300' },
    { value: 'bg-[#ffedd5] border-[#fed7aa] text-orange-950', label: 'Peach', dot: 'bg-orange-300' }
  ];

  // Shapes
  const shapes: Array<'square' | 'rectangle' | 'circle'> = ['square', 'rectangle', 'circle'];

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate(note.id, { text: e.target.value });
  };

  // Shape class determination
  let shapeClass = 'rounded-sm';
  if (note.shape === 'circle') {
    shapeClass = 'rounded-full aspect-square';
  }

  // Set default dimensions block if shape is switched
  const handleShapeChange = (shape: 'square' | 'rectangle' | 'circle') => {
    let dim = { width: note.width, height: note.height };
    if (shape === 'circle') {
      const size = Math.min(note.width, note.height);
      dim = { width: size, height: size };
    } else if (shape === 'rectangle' && note.width === note.height) {
      dim = { width: 220, height: 140 };
    } else if (shape === 'square') {
      const size = Math.max(note.width, note.height);
      dim = { width: size, height: size };
    }
    onUpdate(note.id, { shape, ...dim });
  };

  return (
    <div
      ref={cardRef}
      style={{
        position: 'absolute',
        left: `${note.x}px`,
        top: `${note.y}px`,
        width: `${note.width}px`,
        height: `${note.height}px`,
        zIndex: isDragging ? 40 : isSelected ? 35 : 25,
      }}
      className={`group/note flex flex-col p-3 border shadow-md font-sans transition-all select-none ${shapeClass} ${note.color} ${
        isDragging 
          ? 'shadow-lg cursor-grabbing ring-2 ring-[#8c2522]' 
          : isSelected 
            ? 'ring-2 ring-[#8c2522]/80 shadow-lg cursor-grab scale-[1.02]' 
            : 'cursor-grab hover:shadow-lg'
      }`}
      onMouseDown={(e) => {
        handleMouseDown(e);
        setIsSelected(true);
      }}
      onMouseEnter={() => setShowConfig(true)}
      onMouseLeave={() => setShowConfig(false)}
    >
      {/* Mini Top Pins */}
      <div className="flex items-center justify-between pointer-events-none mb-1 text-[9px] uppercase font-bold tracking-wider opacity-60">
        <div className="flex items-center gap-1">
          <Pin className="h-2.5 w-2.5 text-[#8c2522]" />
          <span>Note</span>
        </div>
        <div className="font-mono text-[8px]">
          {note.shape}
        </div>
      </div>

      {/* Editor Content Box */}
      <div className={`flex-1 flex flex-col justify-center w-full overflow-hidden ${note.shape === 'circle' ? 'p-4 rounded-full' : ''}`}>
        <textarea
          value={note.text}
          onChange={handleTextChange}
          onFocus={() => setIsSelected(true)}
          placeholder="Type reminder here..."
          className="w-full h-full bg-transparent resize-none border-none outline-none focus:ring-0 text-inherit placeholder:text-stone-400 leading-relaxed"
          style={{
            fontFamily: getFontFamily(),
            fontSize: getFontSize(),
            fontWeight: note.isBold ? 'bold' : 'normal',
            fontStyle: note.isItalic ? 'italic' : 'normal',
            textDecoration: note.isUnderline ? 'underline' : 'none',
            textAlign: note.textAlign || (note.shape === 'circle' ? 'center' : 'left'),
          }}
        />
      </div>

      {/* On Hover Helper for Unselected Notes */}
      {showConfig && !isSelected && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#3e2723] text-amber-100 text-[8px] font-sans font-semibold uppercase tracking-wider py-0.5 px-2 rounded shadow border border-amber-600/20 whitespace-nowrap pointer-events-none z-50 animate-bounce">
          🖱️ Click note to customize
        </div>
      )}

      {/* Viewport-Fixed Full Scribe Customization bar when Selected */}
      {isSelected && (
        <div 
          className="note-controls fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] flex flex-col items-center gap-2 bg-[#2d1b18] text-amber-50 text-[11px] p-3 md:p-3.5 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] border-2 border-amber-600/40 select-none animate-in slide-in-from-bottom duration-300 pointer-events-auto"
          style={{ width: 'max-content', maxWidth: 'calc(100vw - 32px)' }}
          onMouseDown={(e) => {
            // Prevent editor container losing focus / click-away triggers
            e.stopPropagation();
          }}
        >
          {/* Header indicator bar */}
          <div className="flex items-center justify-between w-full border-b border-[#4a3531]/80 pb-1.5 mb-0.5">
            <span className="text-[10px] uppercase font-sans tracking-widest text-amber-200/90 font-bold flex items-center gap-1.5">
              <span>✍️</span> Vintage Note Customizer
              <span className="text-[8px] px-1.5 py-0.5 bg-amber-505/10 bg-[#3d2420] text-amber-300 rounded font-mono uppercase tracking-normal">
                {note.shape}
              </span>
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsSelected(false);
              }}
              className="text-[9px] uppercase font-sans tracking-wide bg-stone-700/60 hover:bg-stone-600 hover:text-white px-2 py-0.5 rounded text-amber-100/90 cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Typography Styles */}
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-400 font-sans">Font Scribe</span>
              <div className="flex items-center gap-0.5 bg-black/25 p-1 rounded border border-[#4a3531]">
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontFamily: 'cursive' })}
                  className={`p-1 px-1.5 rounded uppercase font-bold text-[8px] cursor-pointer hover:bg-stone-700 ${(!note.fontFamily || note.fontFamily === 'cursive') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Elegant Cursive Font"
                >
                  Cur
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontFamily: 'serif' })}
                  className={`p-1 px-1.5 rounded uppercase font-bold text-[8px] cursor-pointer hover:bg-stone-700 ${(note.fontFamily === 'serif') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Classic Serif Font"
                >
                  Ser
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontFamily: 'sans' })}
                  className={`p-1 px-1.5 rounded uppercase font-bold text-[8px] cursor-pointer hover:bg-stone-700 ${(note.fontFamily === 'sans') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Modern Sans Font"
                >
                  San
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontFamily: 'mono' })}
                  className={`p-1 px-1.5 rounded uppercase font-bold text-[8px] cursor-pointer hover:bg-stone-700 ${(note.fontFamily === 'mono') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Scribe Monospace"
                >
                  Mon
                </button>
              </div>
            </div>

            {/* Formatting Modifiers */}
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-400 font-sans">Emphasis</span>
              <div className="flex items-center gap-0.5 bg-black/25 p-1 rounded border border-[#4a3531]">
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { isBold: !note.isBold })}
                  className={`p-1 rounded cursor-pointer hover:bg-stone-700 ${note.isBold ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Bold Text Style"
                >
                  <Bold className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { isItalic: !note.isItalic })}
                  className={`p-1 rounded cursor-pointer hover:bg-stone-700 ${note.isItalic ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Italic Text Style"
                >
                  <Italic className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { isUnderline: !note.isUnderline })}
                  className={`p-1 rounded cursor-pointer hover:bg-stone-700 ${note.isUnderline ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Underline Text Style"
                >
                  <Underline className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Alignments */}
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-400 font-sans">Align</span>
              <div className="flex items-center gap-0.5 bg-black/25 p-1 rounded border border-[#4a3531]">
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { textAlign: 'left' })}
                  className={`p-1 rounded cursor-pointer hover:bg-stone-700 ${(note.textAlign === 'left') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Align Text Left"
                >
                  <AlignLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { textAlign: 'center' })}
                  className={`p-1 rounded cursor-pointer hover:bg-stone-700 ${(note.textAlign === 'center' || (!note.textAlign && note.shape === 'circle')) ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Align Text Center"
                >
                  <AlignCenter className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { textAlign: 'right' })}
                  className={`p-1 rounded cursor-pointer hover:bg-stone-700 ${(note.textAlign === 'right') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Align Text Right"
                >
                  <AlignRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Text Font Size */}
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-400 font-sans">Text Size</span>
              <div className="flex items-center gap-0.5 bg-black/25 p-1 rounded border border-[#4a3531]">
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontSize: 'sm' })}
                  className={`p-1 px-1.5 rounded uppercase text-[7px] font-bold cursor-pointer hover:bg-stone-700 ${(note.fontSize === 'sm') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Small Font Size"
                >
                  sm
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontSize: 'base' })}
                  className={`p-1 px-1.5 rounded uppercase text-[7px] font-bold cursor-pointer hover:bg-stone-700 ${(!note.fontSize || note.fontSize === 'base') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Normal Font Size"
                >
                  rg
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontSize: 'lg' })}
                  className={`p-1 px-1.5 rounded uppercase text-[7px] font-bold cursor-pointer hover:bg-stone-700 ${(note.fontSize === 'lg') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Large Font Size"
                >
                  lg
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontSize: 'xl' })}
                  className={`p-1 px-1.5 rounded uppercase text-[7px] font-bold cursor-pointer hover:bg-stone-700 ${(note.fontSize === 'xl') ? 'bg-amber-500 text-[#2d1b18]' : 'text-stone-300'}`}
                  title="Extra Large Font Size"
                >
                  xl
                </button>
              </div>
            </div>

            {/* Shapes customization */}
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-400 font-sans">Shape</span>
              <div className="flex items-center gap-0.5 bg-black/25 p-1 rounded border border-[#4a3531]">
                {shapes.map(sh => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => handleShapeChange(sh)}
                    className={`p-1 px-2 rounded uppercase text-[8px] font-bold cursor-pointer hover:bg-stone-700 transition-all ${
                      note.shape === sh ? 'bg-[#8c2522] text-[#fdfbf7] font-extrabold shadow' : 'text-stone-300'
                    }`}
                    title={`Transform note to ${sh}`}
                  >
                    {sh[0].toUpperCase() + sh.slice(1, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Real-time Dimensions Adjusters */}
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-400 font-sans">Custom Dimensions</span>
              <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded border border-[#4a3531]">
                <div className="flex items-center gap-1">
                  <span className="text-[8px] tracking-normal text-stone-400 font-sans">W:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newWidth = Math.max(100, note.width - 20);
                      const newHeight = note.shape === 'circle' ? newWidth : note.height;
                      onUpdate(note.id, { width: newWidth, height: newHeight });
                    }}
                    className="w-4.5 h-4.5 flex items-center justify-center bg-stone-700 hover:bg-stone-600 rounded text-[9px] font-bold cursor-pointer"
                    title="Shrink Width by 20px"
                  >
                    -
                  </button>
                  <span className="text-[8px] w-5 text-center font-mono font-bold text-amber-200">{note.width}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newWidth = Math.min(450, note.width + 20);
                      const newHeight = note.shape === 'circle' ? newWidth : note.height;
                      onUpdate(note.id, { width: newWidth, height: newHeight });
                    }}
                    className="w-4.5 h-4.5 flex items-center justify-center bg-stone-700 hover:bg-stone-600 rounded text-[9px] font-bold cursor-pointer"
                    title="Grow Width by 20px"
                  >
                    +
                  </button>
                </div>

                {note.shape !== 'circle' && (
                  <div className="flex items-center gap-1 pl-1.5 border-l border-[#4a3531]">
                    <span className="text-[8px] tracking-normal text-stone-400 font-sans">H:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newHeight = Math.max(80, note.height - 20);
                        onUpdate(note.id, { height: newHeight });
                      }}
                      className="w-4.5 h-4.5 flex items-center justify-center bg-stone-700 hover:bg-stone-600 rounded text-[9px] font-bold cursor-pointer"
                      title="Shrink Height by 20px"
                    >
                      -
                    </button>
                    <span className="text-[8px] w-5 text-center font-mono font-bold text-amber-200">{note.height}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const newHeight = Math.min(450, note.height + 20);
                        onUpdate(note.id, { height: newHeight });
                      }}
                      className="w-4.5 h-4.5 flex items-center justify-center bg-stone-700 hover:bg-stone-600 rounded text-[9px] font-bold cursor-pointer"
                      title="Grow Height by 20px"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Colors Palette */}
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-[8px] uppercase tracking-wider text-stone-400 font-sans">Color Palette</span>
              <div className="flex items-center gap-1 bg-black/25 p-1 rounded border border-[#4a3531]">
                {colors.map(col => {
                  const isColorSelected = note.color === col.value;
                  return (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => onUpdate(note.id, { color: col.value })}
                      className={`w-4 h-4 rounded-full border border-stone-800 ${col.dot} hover:scale-125 focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer ${
                        isColorSelected ? 'ring-2 ring-amber-400 scale-110' : ''
                      }`}
                      title={col.label}
                    />
                  );
                })}
              </div>
            </div>

            {/* Discard Node Button */}
            <div className="flex flex-col items-start justify-center pt-3.5">
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you wish to scrap this active sticky note scribbling?")) {
                    onDelete(note.id);
                  }
                }}
                className="p-1 px-2.5 bg-red-950/40 text-red-300 hover:bg-red-900/80 hover:text-white border border-red-900/60 rounded-lg cursor-pointer flex items-center justify-center gap-1 transition-all"
                title="Discard Sticky Note"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="text-[9px] tracking-wide uppercase font-bold font-sans">Scrap</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface StickyNotesSectionLayerProps {
  notes?: StickyNote[];
  onAddNote: () => void;
  onUpdateNote: (id: string, updates: Partial<StickyNote>) => void;
  onDeleteNote: (id: string) => void;
  sectionLabel: string;
}

export function StickyNotesSectionLayer({
  notes = [],
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  sectionLabel
}: StickyNotesSectionLayerProps) {
  return (
    <>
      {/* Floating Add Note Scribe Button */}
      <button
        onClick={onAddNote}
        className="flex items-center gap-1.5 p-1.5 px-3 bg-amber-500/10 border border-amber-600/30 text-amber-900 hover:bg-amber-500/20 rounded shadow-xs text-xs font-serif font-semibold cursor-pointer select-none transition-all hover:scale-102 active:scale-98"
        title={`Pin a customizable sticky note on this active ${sectionLabel}`}
      >
        <span className="text-amber-700 text-lg leading-none">📌</span>
        <span>Add Vintage Sticky Note</span>
      </button>

      {/* Render overlay elements */}
      <div className="absolute inset-0 pointer-events-none overflow-visible w-full h-full z-20">
        {notes.map(note => (
          <StickyNoteCard
            key={note.id}
            note={note}
            onUpdate={onUpdateNote}
            onDelete={onDeleteNote}
          />
        ))}
      </div>
    </>
  );
}
