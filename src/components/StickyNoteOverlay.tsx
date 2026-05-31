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

      {/* On Hover / Selected Controls Deck */}
      {(showConfig || isSelected) && (
        <div className="flex flex-col items-center gap-1 absolute -bottom-12 left-1/2 -translate-x-1/2 z-55">
          {/* Format Sub-Panel (renders when format menu toggle is enabled) */}
          {showFormatMenu && (
            <div className="note-controls flex items-center gap-1 bg-[#2d1b18] text-amber-50 text-[9px] py-1 px-2.5 rounded-full shadow-md animate-in slide-in-from-bottom border border-[#4a3531] whitespace-nowrap">
              {/* Font Family buttons */}
              <div className="flex items-center gap-0.5 border-r border-[#4a3531] pr-1.5">
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontFamily: 'cursive' })}
                  className={`p-0.5 px-1 rounded uppercase font-bold text-[7px] cursor-pointer hover:bg-stone-700 ${(!note.fontFamily || note.fontFamily === 'cursive') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Cursive Font"
                >
                  Cur
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontFamily: 'serif' })}
                  className={`p-0.5 px-1 rounded uppercase font-bold text-[7px] cursor-pointer hover:bg-stone-700 ${(note.fontFamily === 'serif') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Classic Serif"
                >
                  Ser
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontFamily: 'sans' })}
                  className={`p-0.5 px-1 rounded uppercase font-bold text-[7px] cursor-pointer hover:bg-stone-700 ${(note.fontFamily === 'sans') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Modern Sans"
                >
                  San
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontFamily: 'mono' })}
                  className={`p-0.5 px-1 rounded uppercase font-bold text-[7px] cursor-pointer hover:bg-stone-700 ${(note.fontFamily === 'mono') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Monospace srv"
                >
                  Mon
                </button>
              </div>

              {/* Bold, Italic, Underline Font Style Modifiers */}
              <div className="flex items-center gap-0.5 border-r border-[#4a3531] pr-1.5">
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { isBold: !note.isBold })}
                  className={`p-0.5 rounded cursor-pointer hover:bg-stone-700 ${note.isBold ? 'bg-amber-500 text-[#2d1b18] font-bold' : ''}`}
                  title="Bold Style"
                >
                  <Bold className="h-2.5 w-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { isItalic: !note.isItalic })}
                  className={`p-0.5 rounded cursor-pointer hover:bg-stone-700 ${note.isItalic ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Italic Style"
                >
                  <Italic className="h-2.5 w-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { isUnderline: !note.isUnderline })}
                  className={`p-0.5 rounded cursor-pointer hover:bg-stone-700 ${note.isUnderline ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Underline Style"
                >
                  <Underline className="h-2.5 w-2.5" />
                </button>
              </div>

              {/* Text Alignments */}
              <div className="flex items-center gap-0.5 border-r border-[#4a3531] pr-1.5">
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { textAlign: 'left' })}
                  className={`p-0.5 rounded cursor-pointer hover:bg-stone-700 ${(note.textAlign === 'left') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Align Left"
                >
                  <AlignLeft className="h-2.5 w-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { textAlign: 'center' })}
                  className={`p-0.5 rounded cursor-pointer hover:bg-stone-700 ${(note.textAlign === 'center' || (!note.textAlign && note.shape === 'circle')) ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Align Center"
                >
                  <AlignCenter className="h-2.5 w-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { textAlign: 'right' })}
                  className={`p-0.5 rounded cursor-pointer hover:bg-stone-700 ${(note.textAlign === 'right') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Align Right"
                >
                  <AlignRight className="h-2.5 w-2.5" />
                </button>
              </div>

              {/* Text Sizing Scale */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontSize: 'sm' })}
                  className={`p-0.5 px-1 rounded uppercase text-[6px] font-bold cursor-pointer hover:bg-stone-700 ${(note.fontSize === 'sm') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Small typography"
                >
                  sm
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontSize: 'base' })}
                  className={`p-0.5 px-1 rounded uppercase text-[6px] font-bold cursor-pointer hover:bg-stone-700 ${(!note.fontSize || note.fontSize === 'base') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Regular font"
                >
                  rg
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontSize: 'lg' })}
                  className={`p-0.5 px-1 rounded uppercase text-[6px] font-bold cursor-pointer hover:bg-stone-700 ${(note.fontSize === 'lg') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Large typography"
                >
                  lg
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate(note.id, { fontSize: 'xl' })}
                  className={`p-0.5 px-1 rounded uppercase text-[6px] font-bold cursor-pointer hover:bg-stone-700 ${(note.fontSize === 'xl') ? 'bg-amber-500 text-[#2d1b18]' : ''}`}
                  title="Extra Large typography"
                >
                  xl
                </button>
              </div>
            </div>
          )}

          {/* Primary Operations Deck */}
          <div className="note-controls flex items-center gap-1.5 bg-[#3e2723] text-stone-200 text-[10px] py-1 px-2.5 rounded-full shadow-lg border border-[#52352e] whitespace-nowrap">
            {/* Colors palette */}
            <div className="flex items-center gap-0.5 border-r border-stone-600 pr-1.5 h-4">
              {colors.map(col => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => onUpdate(note.id, { color: col.value })}
                  className={`w-2.5 h-2.5 rounded-full border border-stone-800 ${col.dot} hover:scale-110 active:scale-95 transition-transform cursor-pointer`}
                  title={col.label}
                />
              ))}
            </div>

            {/* Shapes selector */}
            <div className="flex items-center gap-1 border-r border-stone-600 pr-1.5 h-4">
              {shapes.map(sh => (
                <button
                  key={sh}
                  type="button"
                  onClick={() => handleShapeChange(sh)}
                  className={`p-0.5 rounded uppercase hover:bg-stone-700 hover:text-white px-1 leading-none text-[8px] font-bold cursor-pointer ${
                    note.shape === sh ? 'bg-[#8c2522] text-white font-extrabold' : ''
                  }`}
                  title={`Make ${sh}`}
                >
                  {sh[0]}
                </button>
              ))}
            </div>

            {/* Typing / Formatting toggle */}
            <div className="border-r border-stone-600 pr-1.5 h-4 flex items-center">
              <button
                type="button"
                onClick={() => setShowFormatMenu(!showFormatMenu)}
                className={`p-0.5 rounded hover:bg-stone-700 hover:text-white cursor-pointer transition-colors ${
                  showFormatMenu ? 'bg-amber-400 text-stone-900 font-bold' : 'text-stone-300'
                }`}
                title="Scribe Typography Formatting"
              >
                <Type className="h-3 w-3" />
              </button>
            </div>

            {/* Sizing Toggles */}
            <div className="flex items-center gap-0.5 border-r border-stone-600 pr-1.5 h-4 text-stone-300">
              <button
                type="button"
                onClick={() => {
                  const newWidth = Math.max(100, note.width - 20);
                  const newHeight = note.shape === 'circle' ? newWidth : Math.max(80, note.height - 20);
                  onUpdate(note.id, { width: newWidth, height: newHeight });
                }}
                className="px-1 hover:bg-stone-700 rounded text-[9px] font-bold cursor-pointer"
                title="Shrink note"
              >
                -
              </button>
              <span className="text-[7px] text-stone-400">Size</span>
              <button
                type="button"
                onClick={() => {
                  const newWidth = Math.min(350, note.width + 20);
                  const newHeight = note.shape === 'circle' ? newWidth : Math.min(300, note.height + 20);
                  onUpdate(note.id, { width: newWidth, height: newHeight });
                }}
                className="px-1 hover:bg-stone-700 rounded text-[9px] font-bold cursor-pointer"
                title="Expand note"
              >
                +
              </button>
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="p-0.5 hover:bg-red-900 rounded text-red-400 hover:text-red-300 transition-colors cursor-pointer"
              title="Scribble archive delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
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
