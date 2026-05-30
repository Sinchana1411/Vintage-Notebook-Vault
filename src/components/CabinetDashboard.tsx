import React, { useState, useEffect } from 'react';
import { 
  Folder as FolderIcon, Book, Layers, FileText, PenTool, 
  Search, Plus, Sparkles, Grid, Sliders, ChevronRight, FolderOpen,
  X, Calendar, Edit3, Trash2, Library, BookOpen, Settings, Filter
} from 'lucide-react';
import { VintageWorkspaceData, Folder, Notebook, Chapter, Notepaper, ImportedDocument } from '../types';
import { StickyNotesSectionLayer } from './StickyNoteOverlay';

interface CabinetDashboardProps {
  workspace: VintageWorkspaceData;
  onSelectItem: (id: string, type: 'document' | 'page') => void;
  onSelectSection: (section: 'documents' | 'text' | 'handwriting') => void;
  onCreateFolder: (name: string, section: 'documents' | 'text' | 'handwriting') => void;
  onCreateNotebook: (
    name: string, 
    folderId: string | null, 
    section: 'text' | 'handwriting',
    coverColor?: string,
    coverStyle?: 'leather' | 'linen' | 'parchment' | 'marbled' | 'velvet',
    coverLabel?: 'classic' | 'vintage' | 'minimal' | 'brass_plate'
  ) => void;
  onUpdateNotebook: (updated: Notebook) => void;
  onDeleteNode: (id: string, type: 'folder' | 'notebook' | 'chapter' | 'page' | 'document') => void;
  onUpdateWorkspace: (updated: VintageWorkspaceData) => void;
}

export default function CabinetDashboard({
  workspace,
  onSelectItem,
  onSelectSection,
  onCreateFolder,
  onCreateNotebook,
  onUpdateNotebook,
  onDeleteNode,
  onUpdateWorkspace
}: CabinetDashboardProps) {
  const handleAddStickyNote = () => {
    const newNote = {
      id: `sticky-${Date.now()}`,
      text: '',
      x: 350 + ((workspace.dashboardStickyNotes?.length || 0) * 15),
      y: 110 + ((workspace.dashboardStickyNotes?.length || 0) * 15),
      width: 160,
      height: 160,
      color: 'bg-[#fef9c3] border-[#fef08a] text-yellow-950',
      shape: 'square' as const,
      createdAt: Date.now()
    };
    onUpdateWorkspace({
      ...workspace,
      dashboardStickyNotes: [...(workspace.dashboardStickyNotes || []), newNote]
    });
  };

  const handleUpdateStickyNote = (id: string, updates: Partial<any>) => {
    onUpdateWorkspace({
      ...workspace,
      dashboardStickyNotes: (workspace.dashboardStickyNotes || []).map(note =>
        note.id === id ? { ...note, ...updates } : note
      )
    });
  };

  const handleDeleteStickyNote = (id: string) => {
    onUpdateWorkspace({
      ...workspace,
      dashboardStickyNotes: (workspace.dashboardStickyNotes || []).filter(note => note.id !== id)
    });
  };

  const [activeTab, setActiveTab] = useState<'cabinet' | 'all-files'>('cabinet');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  
  // Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState<'all' | 'document' | 'page'>('all');
  
  // Custom Notebook Modal / Cover Customizer State
  const [showConfiguratorId, setShowConfiguratorId] = useState<string | null>(null);
  const [editingColor, setEditingColor] = useState('#8c2522');
  const [editingStyle, setEditingStyle] = useState<'leather' | 'linen' | 'parchment' | 'marbled' | 'velvet'>('leather');
  const [editingLabel, setEditingLabel] = useState<'classic' | 'vintage' | 'minimal' | 'brass_plate'>('brass_plate');
  const [editingName, setEditingName] = useState('');

  // Quick Notebook Creation State
  const [showNewBookModal, setShowNewBookModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [newBookSection, setNewBookSection] = useState<'text' | 'handwriting'>('text');
  const [newBookFolderId, setNewBookFolderId] = useState<string | null>(null);
  const [newBookColor, setNewBookColor] = useState('#8c2522');
  const [newBookStyle, setNewBookStyle] = useState<'leather' | 'linen' | 'parchment' | 'marbled' | 'velvet'>('leather');
  const [newBookLabel, setNewBookLabel] = useState<'classic' | 'vintage' | 'minimal' | 'brass_plate'>('brass_plate');

  // Quick Folder Creation State
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderSection, setNewFolderSection] = useState<'text' | 'handwriting' | 'documents'>('text');

  // Cover presets
  const coverColors = [
    { hex: '#8c2522', name: 'Burgundy Wine' },
    { hex: '#2e4f3f', name: 'Emerald Guild' },
    { hex: '#1e3557', name: 'Royal Cobalt' },
    { hex: '#1a1a1a', name: 'Obsidian Ink' },
    { hex: '#b5823c', name: 'Ochre Wheat' },
    { hex: '#4f5d65', name: 'Dusky Slate' },
    { hex: '#5d4037', name: 'Aged Bark' },
    { hex: '#63445d', name: 'Deep Amethyst' }
  ];

  const coverStyleGradients: Record<string, string> = {
    leather: 'bg-gradient-to-br from-white/10 via-black/10 to-black/40 border-r border-[#6d1310]/30 shadow-inner',
    linen: 'bg-gradient-to-br from-[#dfdcd6]/40 via-transparent to-black/30 border-r border-black/25',
    parchment: 'bg-gradient-to-r from-[#faf0dd] via-[#ecdcb9] to-[#d8c397] border-l border-r border-black/15',
    marbled: 'bg-gradient-to-tr from-[#9c3a36]/30 via-[#2e4f3f]/10 to-[#b5823c]/40 border-r border-black/20',
    velvet: 'bg-gradient-to-b from-white/20 via-transparent to-black/50 border-r border-black/40'
  };

  const coverTextures: Record<string, string> = {
    leather: 'opacity-20 blend-overlay contrast-125 select-none pointer-events-none absolute inset-0 bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:3px_3px]',
    linen: 'opacity-40 blend-multiply pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.06)_50%,transparent_50%),linear-gradient(rgba(0,0,0,0.06)_50%,transparent_50%)] [background-size:4px_4px]',
    parchment: 'opacity-25 pointer-events-none mix-blend-darken absolute inset-0 bg-[radial-gradient(#ede1c5_10%,transparent_10%)] [background-size:2px_2px]',
    marbled: 'opacity-30 mix-blend-color-burn pointer-events-none absolute inset-0 bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-amber-700 via-rose-900 to-emerald-900 filter blur-[1px]',
    velvet: 'opacity-15 pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white to-black mix-blend-overlay'
  };

  // Compile folders across Vintage Workspace
  const allFolders = workspace.folders;

  // Compile notebooks
  const notebooksForSelectedFolder = workspace.notebooks.filter(n => n.folderId === selectedFolderId);
  const docsInActiveFolder = workspace.documents.filter(d => d.folderId === selectedFolderId);

  // Compile loose root notebooks
  const rootNotebooks = workspace.notebooks.filter(n => !n.folderId);

  // Active folder selection representation
  const activeFolder = allFolders.find(f => f.id === selectedFolderId) || null;

  // Active notebook selection details
  const activeNotebook = workspace.notebooks.find(n => n.id === selectedNotebookId) || null;
  const activeNotebookChapters = activeNotebook ? workspace.chapters.filter(ch => ch.notebookId === activeNotebook.id) : [];

  // General Index (all files with dates/types)
  const allSearchableFiles: Array<{
    id: string;
    title: string;
    type: 'document' | 'page';
    section: 'documents' | 'text' | 'handwriting';
    createdAt: number;
    folderName: string;
    parentName?: string; // Notebook or Chapter name
  }> = [
    ...workspace.documents.map(doc => {
      const folder = workspace.folders.find(f => f.id === doc.folderId);
      return {
        id: doc.id,
        title: doc.title,
        type: 'document' as const,
        section: 'documents' as const,
        createdAt: doc.createdAt,
        folderName: folder ? folder.name : 'Unassigned Parchment'
      };
    }),
    ...workspace.notepapers.map(page => {
      const chapter = workspace.chapters.find(ch => ch.id === page.chapterId);
      const notebook = chapter ? workspace.notebooks.find(nb => nb.id === chapter.notebookId) : null;
      const folder = notebook ? workspace.folders.find(f => f.id === notebook.folderId) : null;
      return {
        id: page.id,
        title: page.title,
        type: 'page' as const,
        section: notebook ? notebook.section : 'text' as const,
        createdAt: page.createdAt,
        folderName: folder ? folder.name : 'Loose Scribing',
        parentName: notebook ? `${notebook.name} ➔ ${chapter?.name}` : chapter?.name
      };
    })
  ].sort((a, b) => b.createdAt - a.createdAt);

  const filteredSearchableFiles = allSearchableFiles.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.folderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (f.parentName && f.parentName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = fileTypeFilter === 'all' || f.type === fileTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleOpenConfigurator = (nb: Notebook) => {
    setShowConfiguratorId(nb.id);
    setEditingName(nb.name);
    setEditingColor(nb.coverColor || '#8c2522');
    setEditingStyle(nb.coverStyle || 'leather');
    setEditingLabel(nb.coverLabel || 'brass_plate');
  };

  const handleApplyConfiguratorChanges = () => {
    if (!showConfiguratorId) return;
    const nb = workspace.notebooks.find(n => n.id === showConfiguratorId);
    if (nb) {
      onUpdateNotebook({
        ...nb,
        name: editingName,
        coverColor: editingColor,
        coverStyle: editingStyle,
        coverLabel: editingLabel
      });
    }
    setShowConfiguratorId(null);
  };

  const triggerCreateNotebook = () => {
    if (!newBookName) return;
    onCreateNotebook(
      newBookName,
      newBookFolderId,
      newBookSection,
      newBookColor,
      newBookStyle,
      newBookLabel
    );
    setNewBookName('');
    setShowNewBookModal(false);
  };

  const triggerCreateFolder = () => {
    if (!newFolderName) return;
    onCreateFolder(newFolderName, newFolderSection);
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#fdfbf7] p-6 overflow-y-auto vintage-scroll font-serif relative">
      {/* Header Dashboard section */}
      <div className="border-b border-[#ebdcb9] pb-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[#3e2723] uppercase tracking-wider flex items-center gap-2">
            <Library className="h-8 w-8 text-[#8c2522]" />
            <span>Filing Cabinet Vintage Workspace</span>
          </h1>
          <p className="text-xs text-[#5c4033] mt-1 italic">
            Unlock the archival index of all parchment, ledger volumes, and transcripts bound inside your study.
          </p>
        </div>

        {/* Dashboard tabs with sticky note adder */}
        <div className="flex items-center gap-3 self-stretch md:self-auto flex-wrap">
          <StickyNotesSectionLayer
            notes={workspace.dashboardStickyNotes}
            onAddNote={handleAddStickyNote}
            onUpdateNote={handleUpdateStickyNote}
            onDeleteNote={handleDeleteStickyNote}
            sectionLabel="Dashboard"
          />

          <div className="flex items-center gap-2 bg-[#fcf8f2] p-1.5 rounded border border-[#ebdcb9] text-xs">
            <button
              onClick={() => setActiveTab('cabinet')}
              className={`py-2 px-4 rounded font-bold transition-all ${
                activeTab === 'cabinet' 
                  ? 'bg-[#8c2522] text-[#fdfbf7] shadow' 
                  : 'text-[#5c4033] hover:bg-[#faf4eb]'
              }`}
            >
              📂 Filing Cabinets & Shelves
            </button>
            <button
              onClick={() => setActiveTab('all-files')}
              className={`py-2 px-4 rounded font-bold transition-all ${
                activeTab === 'all-files' 
                  ? 'bg-[#8c2522] text-[#fdfbf7] shadow' 
                  : 'text-[#5c4033] hover:bg-[#faf4eb]'
              }`}
            >
              📜 Unified Scribe Desktop
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'cabinet' ? (
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Cabinet view section */}
          {!selectedFolderId ? (
            <div className="space-y-6">
              {/* Wooden Cabinet Top */}
              <div className="bg-[#5c4033] rounded-t shadow-lg p-2.5 border-b-4 border-[#3e2723] flex justify-between items-center text-[#faf4eb]">
                <span className="text-xs font-bold font-sans tracking-widest uppercase text-amber-100/80">★ MAIN ARCHIVE VAULT</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setNewFolderSection('text');
                      setShowNewFolderModal(true);
                    }}
                    className="flex items-center gap-1 bg-[#8c2522] hover:bg-[#a32e2a] px-2 py-1 text-[11px] rounded transition-colors text-white font-sans"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Pocket Folder</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewBookFolderId(null);
                      setShowNewBookModal(true);
                    }}
                    className="flex items-center gap-1 bg-[#b5823c] hover:bg-[#c9954d] px-2 py-1 text-[11px] rounded transition-colors text-white font-sans"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Craft Notebook</span>
                  </button>
                </div>
              </div>

              {/* Wooden File Drawers Grid */}
              <div className="bg-[#4d3326] p-6 shadow-inner space-y-4">
                <h3 className="text-sm font-bold text-amber-100/90 tracking-wide select-none">GROUPING FOLDERS (CLICK DRAWER TO UNLOCK)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allFolders.map(folder => {
                    const documentCount = workspace.documents.filter(d => d.folderId === folder.id).length;
                    const notebookCount = workspace.notebooks.filter(n => n.folderId === folder.id).length;
                    const itemTotal = documentCount + notebookCount;

                    return (
                      <div 
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className="cursor-pointer bg-gradient-to-b from-[#7a5844] to-[#513627] hover:from-[#8d6954] hover:to-[#5e4130] rounded border-b-8 border-r-4 border-black/35 shadow-xl transition-all duration-300 p-5 transform hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between min-h-[140px] relative overflow-hidden group"
                      >
                        {/* Brass handle detail */}
                        <div className="absolute top-2 right-3 w-8 h-4 bg-[#cfa75e] shadow border border-[#a27e3d] rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                          <div className="w-5 h-1 bg-[#423114] rounded-full" />
                        </div>

                        {/* Top Hanging Folder Header */}
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-amber-50/15 group-hover:bg-[#faf4eb]/20 transition-all rounded text-amber-100">
                            <FolderOpen className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-amber-50 group-hover:text-white capitalize truncate">{folder.name}</h4>
                            <span className="text-[10px] uppercase font-sans tracking-widest px-1.5 py-0.5 bg-black/20 text-amber-200/90 rounded border border-amber-900/30">
                              Drawer - {folder.section}
                            </span>
                          </div>
                        </div>

                        {/* Folder Info Footer */}
                        <div className="mt-4 flex items-center justify-between text-xs text-amber-200/80 border-t border-amber-100/10 pt-2 font-sans">
                          <span>Contains {itemTotal} records</span>
                          <span className="flex items-center gap-1 group-hover:text-amber-100">
                            Pull Drawer <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Loose/Root Notebook Row */}
              <div className="p-4 bg-[#faf4eb] border border-[#ebdcb9] rounded shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-bold text-[#8c2522]">✨ UNASSIGNED SHELF BOOKS</h4>
                  <p className="text-[11px] text-[#5c4033] italic">Loose journals waiting to be placed in drawers</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {rootNotebooks.map(nb => (
                    <div 
                      key={nb.id}
                      onClick={() => {
                        setSelectedNotebookId(nb.id);
                        setSelectedFolderId(nb.folderId);
                      }}
                      className="cursor-pointer flex flex-col items-center group"
                    >
                      {/* Notebook cover widget rendering */}
                      <div 
                        className="w-24 h-32 rounded-r-lg border-l-4 shadow-md group-hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between p-2.5 overflow-hidden transform group-hover:-translate-y-2"
                        style={{ 
                          backgroundColor: nb.coverColor || '#8c2522',
                          borderLeftColor: 'rgba(0,0,0,0.45)',
                          boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.15)'
                        }}
                      >
                        {/* Cover pattern styling */}
                        <div className={`${coverStyleGradients[nb.coverStyle || 'leather']} absolute inset-0`} />
                        <div className={coverTextures[nb.coverStyle || 'leather']} />

                        {/* Brass Label */}
                        <div className={`mx-auto bg-amber-50/90 text-stone-800 rounded px-1 py-1 text-center font-serif text-[8px] leading-tight font-semibold border-b border-[#a27e3d] shadow ${
                          nb.coverLabel === 'brass_plate' ? 'border-2 border-stone-400 bg-stone-100 text-stone-900 rounded-sm py-0.5' : ''
                        } ${
                          nb.coverLabel === 'vintage' ? 'border border-[#8c2522] text-[#8c2522] italic' : ''
                        } ${
                          nb.coverLabel === 'minimal' ? 'border-0 bg-transparent text-white drop-shadow-md text-[9px]' : ''
                        }`}>
                          <span className="line-clamp-2">{nb.name}</span>
                        </div>

                        {/* Detail bookmark or ribbon */}
                        <div className="w-1.5 h-6 bg-red-600/80 rounded-b absolute bottom-0 right-2 shadow-sm" />
                        
                        <div className="text-[7px] text-white/50 select-none font-sans mt-auto">
                          {nb.section === 'text' ? '📝 TEXT' : '🎨 HANDWRITER'}
                        </div>
                      </div>
                      
                      <span className="text-[11px] font-bold text-[#5c4033] mt-2 text-center truncate w-full group-hover:text-[#8c2522]">
                        {nb.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Folder Breadcrumb */}
              <div className="flex items-center justify-between bg-[#fcf8f2] border border-[#ebdcb9] rounded p-3">
                <button 
                  onClick={() => {
                    setSelectedFolderId(null);
                    setSelectedNotebookId(null);
                  }}
                  className="text-xs text-[#8c2522] hover:underline font-bold flex items-center gap-1"
                >
                  ◀ Close Drawer & Return to Main Vault
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5c4033]">Active Pocket:</span>
                  <span className="text-sm font-bold text-[#3e2723]">{activeFolder?.name}</span>
                  <span className="text-[10px] bg-amber-100 text-[#5c4033] font-bold rounded px-2 py-0.5 font-sans">
                    {activeFolder?.section.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Wooden Bookshelf Layout */}
              <div className="bg-[#4a2e1d] rounded shadow-2xl p-6 relative overflow-hidden">
                <div className="absolute top-2 right-3 flex gap-2">
                  {activeFolder?.section !== 'documents' && (
                    <button
                      onClick={() => {
                        setNewBookFolderId(selectedFolderId);
                        setShowNewBookModal(true);
                      }}
                      className="flex items-center gap-1 bg-[#8c2522] hover:bg-[#a32e2a] px-3 py-1 text-xs rounded transition-colors text-white font-sans shadow"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Craft Notebook Inside</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (activeFolder) {
                        onDeleteNode(activeFolder.id, 'folder');
                        setSelectedFolderId(null);
                      }
                    }}
                    className="p-1 px-2 bg-red-800 hover:bg-red-700 text-white rounded text-xs transition-colors"
                    title="Archive this folder pouch"
                  >
                    Archive Folder
                  </button>
                </div>

                <h3 className="text-xs font-bold font-sans text-amber-100/70 uppercase tracking-widest mb-6">
                  {activeFolder?.section === 'documents' ? '📋 DOCUMENTS & FILES INSIDE PARCHED DRAWER' : '📚 SHELF OF VOLUMES INSIDE DRAWER'}
                </h3>

                {activeFolder?.section === 'documents' ? (
                  /* Documents pouch viewer */
                  docsInActiveFolder.length === 0 ? (
                    <div className="py-12 text-center rounded border-2 border-dashed border-amber-900/30 bg-[#352013]">
                      <p className="text-amber-100/60 text-sm">No documents imported in this cabinet pouch yet.</p>
                      <p className="text-stone-400 text-xs mt-1">Upload a PDF or image inside this folder via the sidebar to view and annotate.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-2 pb-6 border-b-8 border-[#301c0f] shadow-inner relative z-10">
                      {docsInActiveFolder.map(doc => (
                        <div
                          key={doc.id}
                          className="flex flex-col items-center cursor-pointer group"
                          onClick={() => {
                            onSelectItem(doc.id, 'document');
                            onSelectSection('documents');
                          }}
                        >
                          <div className="w-24 h-32 bg-[#faf4eb] rounded border border-amber-900/30 shadow-md group-hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between p-2.5 overflow-hidden transform group-hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-50/10 to-amber-100/30 pointer-events-none" />
                            <FileText className="h-8 w-8 text-[#8c2522] mx-auto mt-4" />
                            <div className="text-[8px] bg-[#8c2522]/10 text-[#8c2522] rounded px-1 py-0.5 text-center font-mono mt-auto uppercase">
                              {doc.fileType} FILE
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-amber-50 mt-2 text-center truncate w-full group-hover:text-amber-300">
                            {doc.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  /* Notebooks loop */
                  notebooksForSelectedFolder.length === 0 ? (
                    <div className="py-12 text-center rounded border-2 border-dashed border-amber-900/30 bg-[#352013]">
                      <p className="text-amber-100/60 text-sm">No notebooks crafted in this cabinet pocket yet.</p>
                      <p className="text-stone-400 text-xs mt-1">Scribe a notebook volume by clicking the creator button above.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pt-2 pb-6 border-b-8 border-[#301c0f] shadow-inner relative z-10">
                      {notebooksForSelectedFolder.map(nb => {
                        const isSelected = selectedNotebookId === nb.id;
                        return (
                          <div 
                            key={nb.id}
                            className="flex flex-col items-center cursor-pointer group relative"
                            onClick={() => setSelectedNotebookId(nb.id)}
                          >
                            {/* Book cover rendering widget */}
                            <div 
                              className={`w-28 h-36 rounded-r-lg border-l-4 shadow-lg group-hover:shadow-2xl transition-all duration-300 relative flex flex-col justify-between p-3 overflow-hidden transform group-hover:-translate-y-2 ${
                                isSelected ? 'ring-4 ring-amber-400 rotate-1' : ''
                              }`}
                              style={{ 
                                backgroundColor: nb.coverColor || '#8c2522',
                                borderLeftColor: 'rgba(0,0,0,0.45)',
                                boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.2), 0 6px 12px rgba(0,0,0,0.3)'
                              }}
                            >
                              {/* Texture styling overlay */}
                              <div className={`${coverStyleGradients[nb.coverStyle || 'leather']} absolute inset-0`} />
                              <div className={coverTextures[nb.coverStyle || 'leather']} />

                              {/* Label card options */}
                              <div className={`mx-auto bg-amber-50/95 text-stone-800 rounded px-1.5 py-1 text-center font-serif text-[9px] leading-snug font-bold border-b border-[#a27e3d] shadow ${
                                nb.coverLabel === 'brass_plate' ? 'border-2 border-stone-400 bg-stone-100 text-[#333] rounded-sm py-0.5 font-sans font-bold shadow-sm' : ''
                              } ${
                                nb.coverLabel === 'vintage' ? 'border border-[#8c2522] text-[#8c2522] italic' : ''
                              } ${
                                nb.coverLabel === 'minimal' ? 'border-0 bg-transparent text-white drop-shadow-md text-[10px]' : ''
                              }`}>
                                <span className="line-clamp-3">{nb.name}</span>
                              </div>

                              {/* Bookmark ribbon */}
                              <div className="w-2 h-8 bg-red-600/80 rounded-b absolute bottom-0 right-3 shadow-md" />

                              <div className="flex justify-between items-center text-[7px] text-white/50 select-none font-sans mt-auto">
                                <span>Modified: {new Date(nb.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}</span>
                              </div>
                            </div>

                            <div className="mt-2 text-center w-full">
                              <span className="block text-xs font-bold text-amber-50 group-hover:text-amber-300 truncate">
                                {nb.name}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}
                
                {/* Wood ledge shadowing */}
                <div className="h-6 w-full bg-gradient-to-b from-[#2a170d] to-[#1a0f08] border-t border-[#462817]" />
              </div>

              {/* Notebook Contents Detail & Settings */}
              {activeNotebook && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#faf4eb] border border-[#ebdcb9] rounded p-5 shadow">
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center border-b border-[#ebdcb9] pb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#8c2522]" />
                        <h4 className="text-base font-bold text-[#3e2723]">{activeNotebook.name}</h4>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-[#5c4033] font-bold rounded">
                        Active Chapter-Book Index
                      </span>
                    </div>

                    <div className="space-y-3">
                      {activeNotebookChapters.length === 0 ? (
                        <div className="py-6 text-center italic text-[#ebdcb9] text-xs">
                          No chapters or pages added. Click to load notebook on sidebar and start writing!
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {activeNotebookChapters.map(ch => {
                            const pages = workspace.notepapers.filter(p => p.chapterId === ch.id);
                            return (
                              <div key={ch.id} className="border border-[#ebdcb9]/40 rounded p-2 bg-[#fdfbf7]">
                                <h5 className="text-xs font-bold text-[#8c2522] uppercase tracking-wider">{ch.name}</h5>
                                {pages.length === 0 ? (
                                  <span className="text-[10px] text-gray-400 italic block pl-2 mt-1">Empty act</span>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
                                    {pages.map(page => (
                                      <div 
                                        key={page.id} 
                                        onClick={() => onSelectItem(page.id, 'page')}
                                        className="flex items-center gap-1.5 p-1 px-2 text-[11px] text-[#5c4033] hover:bg-[#ebdcb9]/20 rounded transition-colors cursor-pointer border border-[#ebdcb9]/15"
                                      >
                                        <FileText className="h-3 w-3 text-[#a1887f]" />
                                        <span className="truncate flex-1 font-semibold hover:underline">{page.title}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          // Find first page of active notebook
                          const firstCh = activeNotebookChapters[0];
                          if (firstCh) {
                            const firstPg = workspace.notepapers.find(p => p.chapterId === firstCh.id);
                            if (firstPg) {
                              onSelectItem(firstPg.id, 'page');
                              onSelectSection(activeNotebook.section);
                              return;
                            }
                          }
                          // Fallback select general section
                          onSelectSection(activeNotebook.section);
                        }}
                        className="flex-1 py-1 px-3 bg-[#8c2522] hover:bg-[#a32e2a] text-white text-xs font-bold rounded transition-colors text-center shadow"
                      >
                        📂 Open Journal to Write
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you absolutely sure you wish to dissolve and archive this notebook: ${activeNotebook.name}?`)) {
                            onDeleteNode(activeNotebook.id, 'notebook');
                            setSelectedNotebookId(null);
                          }
                        }}
                        className="py-1 px-3 bg-[#faf4eb] border border-red-800 text-red-800 hover:bg-red-50 text-xs font-semibold rounded transition-colors"
                      >
                        Archive
                      </button>
                    </div>
                  </div>

                  {/* Visual Cover Modifier (Real-time updates) */}
                  <div className="p-4 bg-[#fdfbf7] rounded border border-[#ebdcb9] space-y-3">
                    <h5 className="text-[11px] font-bold font-sans tracking-wide text-[#5c4033] uppercase flex items-center gap-1">
                      <Sliders className="h-3.5 w-3.5 text-[#8c2522]" />
                      <span>MODIFY BOOK COVER SKIN</span>
                    </h5>

                    {/* Preset color bubbles */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 block font-sans font-bold">Select Cover Color:</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {coverColors.map(col => {
                          const isColorSelected = (activeNotebook.coverColor || '#8c2522') === col.hex;
                          return (
                            <button
                              key={col.hex}
                              title={col.name}
                              className={`w-6 h-6 rounded-full border shadow transition-transform ${
                                isColorSelected ? 'scale-110 ring-2 ring-amber-500' : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: col.hex }}
                              onClick={() => {
                                onUpdateNotebook({
                                  ...activeNotebook,
                                  coverColor: col.hex
                                });
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    {/* Cover Material Customizer */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 block font-sans font-bold">Material Texture Style:</span>
                      <select
                        value={activeNotebook.coverStyle || 'leather'}
                        onChange={e => {
                          onUpdateNotebook({
                            ...activeNotebook,
                            coverStyle: e.target.value as any
                          });
                        }}
                        className="w-full text-xs p-1.5 bg-[#faf4eb] rounded border border-[#ebdcb9] text-[#5c4033] outline-none"
                      >
                        <option value="leather">Full-Grain Leather</option>
                        <option value="linen">Thread Linen Bond</option>
                        <option value="parchment">Aged Parchment</option>
                        <option value="marbled">Marbled Flourish</option>
                        <option value="velvet">Sheen Velvet Coat</option>
                      </select>
                    </div>

                    {/* Label/Label holder design */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 block font-sans font-bold">Spine Label Styling:</span>
                      <select
                        value={activeNotebook.coverLabel || 'classic'}
                        onChange={e => {
                          onUpdateNotebook({
                            ...activeNotebook,
                            coverLabel: e.target.value as any
                          });
                        }}
                        className="w-full text-xs p-1.5 bg-[#faf4eb] rounded border border-[#ebdcb9] text-[#5c4033] outline-none"
                      >
                        <option value="classic">Classic Scribe Label</option>
                        <option value="vintage">Italian Script Flourish</option>
                        <option value="minimal">Minimalist Gold Stamp</option>
                        <option value="brass_plate">Brass Nameplate Holder</option>
                      </select>
                    </div>

                    {/* Live renaming */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-500 block font-sans font-bold">Rename Notebook Title:</span>
                      <div className="flex gap-1">
                        <input
                          type="text"
                          value={activeNotebook.name}
                          onChange={e => {
                            onUpdateNotebook({
                              ...activeNotebook,
                              name: e.target.value
                            });
                          }}
                          className="flex-1 text-xs p-1 px-2 border border-[#ebdcb9] bg-white rounded outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Educational Scriptorium Capacity & Limits Guide Card */}
          <div className="mt-8 rounded-lg border border-[#ebdcb9] bg-[#ebdcb9]/15 p-6 font-serif">
            <div className="flex items-center gap-3 border-b border-[#ebdcb9]/40 pb-3 mb-4">
              <span className="text-2xl">🏛️</span>
              <div>
                <h4 className="font-display text-sm font-extrabold text-[#8c2522] uppercase tracking-wider">Archival Capacity & Sandbox Boundaries</h4>
                <p className="text-[10px] text-[#5c4033] uppercase tracking-wider font-mono font-bold">Scriptorium Storage Specification Ledger</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#5c4033] leading-relaxed">
              <div className="space-y-1.5 p-3.5 rounded bg-[#fdfbf7]/80 border border-[#ebdcb9]/20 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#8c2522] uppercase text-[10px]">
                  <span>📖</span>
                  <span>1000+ Page PDFs</span>
                </div>
                <p>
                  <strong>Fully Supported</strong>. PDFs are processed page-by-page on-demand, optimizing active memory. Snapping through 1,000+ pages is fast, clean, and has zero memory bloat.
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded bg-[#fdfbf7]/80 border border-[#ebdcb9]/20 shadow-2xs">
                <div className="flex items-center gap-1.5 font-[#8c2522] font-bold uppercase text-[10px]">
                  <span className="text-[#8c2522]">✍️</span>
                  <span className="text-[#8c2522]">Handwriting & Text Sheets</span>
                </div>
                <p>
                  <strong>Virtually Unlimited</strong>. High-fidelity handwriting vectors and textual logs are written directly to your browser's private Sandboxed <strong>IndexedDB</strong>, accommodating up to gigabytes of material.
                </p>
              </div>

              <div className="space-y-1.5 p-3.5 rounded bg-[#fdfbf7]/80 border border-[#ebdcb9]/20 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#8c2522] uppercase text-[10px]">
                  <span>📂</span>
                  <span>Folders & Journals</span>
                </div>
                <p>
                  <strong>No Structural Limits</strong>. Scribe and bind thousands of classification pockets, custom-skinned leather ledger books, chapters, and index tags safely with 100% data stability.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* Universal Scriptorium Desktop View */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="absolute top-2.5 left-3 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Query manuscript titles, transcripts, or notes..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded border border-[#ebdcb9] bg-white text-[#3e2723] outline-none focus:border-[#8c2522] focus:ring-1 focus:ring-[#8c2522] shadow-sm"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 flex items-center gap-1 font-bold">
                <Filter className="h-3 w-3" /> Filter:
              </span>
              <button
                onClick={() => setFileTypeFilter('all')}
                className={`p-1.5 px-3 rounded transition-colors ${
                  fileTypeFilter === 'all' ? 'bg-[#8c2522] text-white shadow-xs' : 'bg-[#fcf8f2] border border-[#ebdcb9] text-[#5c4033]'
                }`}
              >
                All Pages
              </button>
              <button
                onClick={() => setFileTypeFilter('document')}
                className={`p-1.5 px-3 rounded transition-colors ${
                  fileTypeFilter === 'document' ? 'bg-[#8c2522] text-white shadow-xs' : 'bg-[#fcf8f2] border border-[#ebdcb9] text-[#5c4033]'
                }`}
              >
                Documents
              </button>
              <button
                onClick={() => setFileTypeFilter('page')}
                className={`p-1.5 px-3 rounded transition-colors ${
                  fileTypeFilter === 'page' ? 'bg-[#8c2522] text-white shadow-xs' : 'bg-[#fcf8f2] border border-[#ebdcb9] text-[#5c4033]'
                }`}
              >
                Scribed sheets
              </button>
            </div>
            
            {/* Dashboard Quick Creator Button */}
            <button
              onClick={() => setShowNewBookModal(true)}
              className="py-2 px-3 bg-[#5c4033] hover:bg-[#4a3429] text-white font-bold text-xs rounded shadow transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Scribe New volume</span>
            </button>
          </div>

          {/* Unified list grid */}
          <div className="flex-1 overflow-x-auto border border-[#ebdcb9]/60 rounded shadow-sm bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#fcf8f2] border-b border-[#ebdcb9]/60 text-[#3e2723] uppercase text-[10px] tracking-wider select-none font-sans font-bold">
                  <th className="py-3 px-4">Title / Record Name</th>
                  <th className="py-3 px-4">Category Section</th>
                  <th className="py-3 px-4">File Folder Grouping</th>
                  <th className="py-3 px-4">Associated Book/Ledger</th>
                  <th className="py-3 px-4">Archived On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebdcb9]/30 text-[#3e2723]">
                {filteredSearchableFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-400 italic">
                      No manuscript match found inside Vintage Workspace logs.
                    </td>
                  </tr>
                ) : (
                  filteredSearchableFiles.map(file => {
                    const isTypeDoc = file.type === 'document';
                    return (
                      <tr key={file.id} className="hover:bg-[#faf4eb]/30 transition-colors">
                        {/* Title & Icon */}
                        <td className="py-3 px-4 font-semibold text-stone-800">
                          <div className="flex items-center gap-2">
                            {isTypeDoc ? (
                              <FileText className="h-4 w-4 text-[#8c2522] opacity-70" />
                            ) : file.section === 'handwriting' ? (
                              <PenTool className="h-4 w-4 text-[#a1887f]" />
                            ) : (
                              <Layers className="h-4 w-4 text-[#ebdcb9]" />
                            )}
                            <span className="truncate max-w-[280px]" title={file.title}>
                              {file.title}
                            </span>
                          </div>
                        </td>

                        {/* Section */}
                        <td className="py-3 px-4 capitalize font-sans text-[10px] font-bold">
                          <span className={`px-2 py-0.5 rounded ${
                            file.section === 'documents' ? 'bg-amber-100 text-amber-800' :
                            file.section === 'text' ? 'bg-indigo-100 text-[#3e2723]' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {file.section}
                          </span>
                        </td>

                        {/* Folder */}
                        <td className="py-3 px-4 italic text-stone-500">
                          <span>{file.folderName}</span>
                        </td>

                        {/* Book/Parent Name */}
                        <td className="py-3 px-4 text-stone-600">
                          <span>{file.parentName || 'N/A (Loose Doc)'}</span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-stone-400 font-sans font-medium">
                          {new Date(file.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-2 px-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => {
                                onSelectItem(file.id, file.type);
                                onSelectSection(file.section);
                              }}
                              className="p-1 px-2.5 bg-[#8c2522] text-white font-bold hover:bg-[#a32e2a] rounded transition-all text-[10px]"
                            >
                              Scribe open
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Confirm archiving this individual ${file.type} from index?`)) {
                                  onDeleteNode(file.id, file.type);
                                }
                              }}
                              className="p-1 text-red-700 hover:bg-red-50 rounded"
                              title="Archive Sheet"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW QUICK NOTEBOOK CREATION MODAL */}
      {showNewBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded border border-[#ebdcb9] bg-[#fdfbf7] shadow-2xl p-5 vintage-scroll">
            <div className="flex justify-between items-center border-b border-[#ebdcb9] pb-3 mb-4">
              <h3 className="font-display text-lg font-extrabold text-[#8c2522] uppercase tracking-wide">
                🎨 Craft New Ledger Volume
              </h3>
              <button onClick={() => setShowNewBookModal(false)} className="text-gray-500 hover:text-red-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#5c4033]">
              {/* Notebook Title */}
              <div>
                <label className="block text-[10px] font-sans font-bold uppercase text-[#3e2723] mb-1">
                  Volume Scribe Title
                </label>
                <input
                  type="text"
                  placeholder="E.g. Codex Gigas Philology"
                  value={newBookName}
                  onChange={e => setNewBookName(e.target.value)}
                  className="w-full p-2.5 rounded border border-[#ebdcb9] bg-white text-sm outline-none focus:border-[#8c2522]"
                />
              </div>

              {/* Destination Section */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase text-[#3e2723] mb-1">
                    Book Mode Section
                  </label>
                  <select
                    value={newBookSection}
                    onChange={e => setNewBookSection(e.target.value as any)}
                    className="w-full p-2 rounded border border-[#ebdcb9] bg-white outline-none"
                  >
                    <option value="text">Writing & Text notes</option>
                    <option value="handwriting">Sketches & Drawing pad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-sans font-bold uppercase text-[#3e2723] mb-1">
                    Cabinet Drawer Pocket
                  </label>
                  <select
                    value={newBookFolderId || ''}
                    onChange={e => setNewBookFolderId(e.target.value ? e.target.value : null)}
                    className="w-full p-2 rounded border border-[#ebdcb9] bg-white outline-none"
                  >
                    <option value="">Unassigned Floor Shelf</option>
                    {allFolders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* COVER SELECTION RIBBON */}
              <div className="border border-amber-900/10 p-3 rounded bg-[#fcf8f2] space-y-3">
                <div className="flex justify-between items-center bg-brown-100 p-1 rounded">
                  <span className="font-sans text-[10px] font-bold text-amber-900 uppercase">
                    📕 CUSTOM COVER DESIGNER (REALTIME)
                  </span>
                </div>

                {/* Cover Colors presets */}
                <div>
                  <span className="text-[10px] text-gray-500 block mb-1">Select Leather/Cloth Tint:</span>
                  <div className="grid grid-cols-8 gap-1.5">
                    {coverColors.map(col => {
                      const isColorSelected = newBookColor === col.hex;
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          className={`w-6 h-6 rounded-full border shadow transition-transform ${
                            isColorSelected ? 'scale-110 ring-2 ring-amber-500' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: col.hex }}
                          onClick={() => setNewBookColor(col.hex)}
                          title={col.name}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* material and label preset */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-500 block mb-1">Material Texture:</span>
                    <select
                      value={newBookStyle}
                      onChange={e => setNewBookStyle(e.target.value as any)}
                      className="w-full text-xs p-1.5 rounded border border-[#ebdcb9] bg-white outline-none"
                    >
                      <option value="leather">Premium Full Leather</option>
                      <option value="linen">Handwoven Canvas Linen</option>
                      <option value="parchment">Aged Parchment Skin</option>
                      <option value="marbled">Marbled Decal Paper</option>
                      <option value="velvet">Opulent Velveteen Coat</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block mb-1">Label Plate Style:</span>
                    <select
                      value={newBookLabel}
                      onChange={e => setNewBookLabel(e.target.value as any)}
                      className="w-full text-xs p-1.5 rounded border border-[#ebdcb9] bg-white outline-none"
                    >
                      <option value="classic">Standard Paper Label</option>
                      <option value="vintage">Italian Script Crest</option>
                      <option value="minimal">Gold Gilt Letterings</option>
                      <option value="brass_plate">Brass Plate Bracket</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowNewBookModal(false)}
                className="rounded border border-[#ebdcb9] px-4 py-2 text-[#5c4033]"
              >
                Back out
              </button>
              <button
                type="button"
                onClick={triggerCreateNotebook}
                className="rounded bg-[#8c2522] hover:bg-[#a32e2a] px-4 py-2 text-white font-bold shadow"
              >
                Bind & Place Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW QUICK FOLDER CREATION MODAL */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded border border-[#ebdcb9] bg-[#fdfbf7] shadow-xl p-5">
            <h3 className="font-display text-base font-bold text-[#8c2522] border-b border-[#ebdcb9] pb-2 mb-4">
              📂 Assemble Cabinet Drawer Folder
            </h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase text-[#5c4033] font-bold mb-1">Folder Name Tag</label>
                <input
                  type="text"
                  placeholder="E.g. 🏛️ Historical Chronicles"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full p-2 border border-[#ebdcb9] rounded outline-none focus:border-[#8c2522] text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-[#5c4033] font-bold mb-1">Section Home Location</label>
                <select
                  value={newFolderSection}
                  onChange={e => setNewFolderSection(e.target.value as any)}
                  className="w-full p-2 border border-[#ebdcb9] rounded outline-none bg-white font-serif"
                >
                  <option value="text">Text Notes drawer</option>
                  <option value="handwriting">Handwriting & Canvas drawer</option>
                  <option value="documents">Uploaded Documents pouch</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowNewFolderModal(false)}
                className="rounded border border-[#ebdcb9] px-3 py-1.5 text-stone-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerCreateFolder}
                className="rounded bg-[#8c2522] hover:bg-[#a32e2a] px-4 py-1.5 text-white font-bold"
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
