import React, { useState } from 'react';
import { 
  Folder, FolderPlus, Book, BookOpen, Layers, FileText, PenTool, 
  Trash2, Plus, Edit3, ChevronDown, ChevronRight, Search, 
  FolderOpen, Archive, HelpCircle 
} from 'lucide-react';
import { VintageWorkspaceData, Folder as IFolder, Notebook, Chapter, Notepaper, ImportedDocument } from '../types';
import { Library } from 'lucide-react';

interface SidebarProps {
  workspace: VintageWorkspaceData;
  selectedSection: 'dashboard' | 'documents' | 'text' | 'handwriting';
  onSelectSection: (section: 'dashboard' | 'documents' | 'text' | 'handwriting') => void;
  activeItemId: string | null;
  onSelectItem: (id: string, type: 'document' | 'page') => void;

  // Mutators
  onCreateFolder: (name: string, section: 'documents' | 'text' | 'handwriting') => void;
  onCreateNotebook: (
    name: string, 
    folderId: string | null, 
    section: 'text' | 'handwriting',
    coverColor?: string,
    coverStyle?: 'leather' | 'linen' | 'parchment' | 'marbled' | 'velvet',
    coverLabel?: 'classic' | 'vintage' | 'minimal' | 'brass_plate'
  ) => void;
  onCreateChapter: (name: string, notebookId: string) => void;
  onCreateNotepaper: (title: string, chapterId: string) => void;
  onImportDocument: (title: string, content: string, type: 'txt' | 'image' | 'pdf', folderId: string | null) => void;
  onDeleteNode: (id: string, type: 'folder' | 'notebook' | 'chapter' | 'page' | 'document') => void;
  sidebarWidth: number;
}

export default function Sidebar({
  workspace,
  selectedSection,
  onSelectSection,
  activeItemId,
  onSelectItem,
  onCreateFolder,
  onCreateNotebook,
  onCreateChapter,
  onCreateNotepaper,
  onImportDocument,
  onDeleteNode,
  sidebarWidth
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'f-doc-1': true,
    'f-txt-1': true,
    'f-hw-1': true,
  });
  const [expandedNotebooks, setExpandedNotebooks] = useState<Record<string, boolean>>({
    'nb-txt-1': true,
    'nb-hw-1': true,
  });
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    'ch-txt-1': true,
    'ch-hw-1': true,
  });

  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  
  const [newNotebookName, setNewNotebookName] = useState('');
  const [selectedFolderForNotebook, setSelectedFolderForNotebook] = useState<string | null>(null);
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);
  const [newNotebookColor, setNewNotebookColor] = useState('#8c2522');
  const [newNotebookStyle, setNewNotebookStyle] = useState<'leather' | 'linen' | 'parchment' | 'marbled' | 'velvet'>('leather');
  const [newNotebookLabel, setNewNotebookLabel] = useState<'classic' | 'vintage' | 'minimal' | 'brass_plate'>('brass_plate');

  const [newChapterName, setNewChapterName] = useState('');
  const [selectedNotebookForChapter, setSelectedNotebookForChapter] = useState<string | null>(null);
  const [showNewChapterModal, setShowNewChapterModal] = useState(false);

  const [newPageName, setNewPageName] = useState('');
  const [selectedChapterForPage, setSelectedChapterForPage] = useState<string | null>(null);
  const [showNewPageModal, setShowNewPageModal] = useState(false);

  const [quickImportText, setQuickImportText] = useState('');
  const [quickImportTitle, setQuickImportTitle] = useState('');
  const [selectedFolderForImport, setSelectedFolderForImport] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNotebook = (id: string) => {
    setExpandedNotebooks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter items in active section
  const currentFolders = workspace.folders.filter(f => f.section === (selectedSection === 'dashboard' ? 'text' : selectedSection));
  const currentNotebooks = workspace.notebooks.filter(n => n.section === (selectedSection === 'documents' ? 'text' : selectedSection === 'dashboard' ? 'text' : selectedSection));

  const filteredDocuments = workspace.documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotepapers = workspace.notepapers.filter(paper =>
    paper.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderNotebookNode = (nb: Notebook) => {
    const isNbExpanded = expandedNotebooks[nb.id];
    const chapters = workspace.chapters.filter(ch => ch.notebookId === nb.id);
    
    return (
      <div key={nb.id} className="group/nb border-l border-amber-900/10 pl-1">
        <div className="flex items-center justify-between rounded-xs px-1 py-1 hover:bg-[#faf4eb]">
          <button
            onClick={() => toggleNotebook(nb.id)}
            className="flex flex-1 items-center gap-1 text-start text-xs font-medium text-[#4e342e]"
          >
            {isNbExpanded ? (
              <ChevronDown className="h-3 w-3 text-[#ebdcb9]" />
            ) : (
              <ChevronRight className="h-3 w-3 text-[#ebdcb9]" />
            )}
            <Book className="h-3.5 w-3.5 text-[#a1887f] shrink-0" />
            <span className="truncate">{nb.name}</span>
          </button>
          <div className="flex items-center gap-1 opacity-0 group-hover/nb:opacity-100 transition-opacity">
            <button
              onClick={() => {
                setSelectedNotebookForChapter(nb.id);
                setShowNewChapterModal(true);
              }}
              title="Add Chapter/Section"
              className="rounded-xs p-0.5 text-[#5c4033] hover:bg-[#ebdcb9]"
            >
              <Plus className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDeleteNode(nb.id, 'notebook')}
              className="rounded-xs p-0.5 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Chapters inside Notebook */}
        {isNbExpanded && (
          <div className="ml-3 border-l-2 border-[#8c2522]/10 pl-2 space-y-2 pt-1 font-serif">
            {chapters.length === 0 ? (
              <div className="py-2 pl-2 text-[10px] italic text-[#ebdcb9]">No Chapters added</div>
            ) : (
              chapters.map(ch => {
                const isChExpanded = expandedChapters[ch.id];
                const pages = workspace.notepapers.filter(p => p.chapterId === ch.id);

                return (
                  <div key={ch.id} className="group/ch">
                    <div className="flex items-center justify-between rounded-xs px-1 py-0.5 hover:bg-[#faf4eb]/80">
                      <button
                        onClick={() => toggleChapter(ch.id)}
                        className="flex flex-1 items-center gap-1 text-start text-[11px] font-semibold text-[#5d4037] uppercase tracking-wider"
                      >
                        {isChExpanded ? (
                          <ChevronDown className="h-2.5 w-2.5 text-[#8c2522]" />
                        ) : (
                          <ChevronRight className="h-2.5 w-2.5 text-[#8c2522]" />
                        )}
                        <Layers className="h-3 w-3 text-[#8c2522]/60 shrink-0" />
                        <span className="truncate">{ch.name}</span>
                      </button>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/ch:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedChapterForPage(ch.id);
                            setShowNewPageModal(true);
                          }}
                          title="Add Notepaper Page"
                          className="rounded-xs p-0.5 text-[#5c4033] hover:bg-[#ebdcb9]"
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </button>
                        <button
                          onClick={() => onDeleteNode(ch.id, 'chapter')}
                          className="rounded-xs p-0.5 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Page (Notepaper) items */}
                    {isChExpanded && (
                      <div className="ml-2 pl-1 space-y-0.5 pt-0.5">
                        {pages.length === 0 ? (
                          <div className="py-1 pl-3 text-[10px] italic text-[#ebdcb9]">Empty section</div>
                        ) : (
                          pages.map(page => (
                            <div
                              key={page.id}
                              className={`group/paper flex items-center justify-between rounded-xs px-2 py-0.5 text-xs transition-colors ${
                                activeItemId === page.id
                                  ? 'bg-[#ebdcb9] font-semibold text-[#3e2723]'
                                  : 'text-[#5c4033] hover:bg-[#fcf8f2]'
                              }`}
                            >
                              <button
                                onClick={() => onSelectItem(page.id, 'page')}
                                className="flex flex-1 items-center gap-1 text-start truncate"
                              >
                                <FileText className="h-3 w-3 text-[#a1887f] shrink-0" />
                                <span className="truncate">{page.title}</span>
                              </button>
                              <button
                                onClick={() => onDeleteNode(page.id, 'page')}
                                className="opacity-0 group-hover/paper:opacity-100 p-0.5 text-red-700 transition-opacity rounded"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  if (sidebarWidth > 520) {
    return (
      <div id="full-page-folder-system" className="flex h-full w-full flex-col bg-[#fdfbf7] font-serif border-r border-[#ebdcb9] overflow-hidden">
        {/* Header Ribbon bar */}
        <div className="flex items-center justify-between border-b border-[#ebdcb9] bg-[#fcf8f2] px-6 py-4 shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xl">💼</span>
            <div>
              <h2 className="text-base font-extrabold text-[#3e2723] leading-none uppercase tracking-wider">CA Professional Notes Vintage Workspace</h2>
              <p className="text-[10px] text-[#8c2522] uppercase tracking-wider mt-1 font-extrabold font-mono">Subject-Wise Folders & Ledger Chapter Explorer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-wide-scribe-desktop"
              onClick={() => onSelectSection('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded bg-[#8c2522] text-[#fdfbf7] hover:bg-[#6c1a18] transition-all uppercase tracking-wide cursor-pointer"
            >
              <Library className="h-4 w-4" />
              <span>Scribe Desktop</span>
            </button>
            <span className="text-[11px] text-[#5c4033] bg-[#faf4eb] border border-[#ebdcb9] font-mono px-3 py-1 rounded font-bold uppercase select-none">
              Width: {sidebarWidth}px
            </span>
          </div>
        </div>

        {/* Core Multi-Column Explorer area */}
        <div className="flex-1 overflow-auto p-6 bg-[#faf4eb]/50 vintage-scroll">
          {/* Main folder grids */}
          <div className="mb-6">
            <div className="flex justify-between items-center border-b border-[#ebdcb9]/80 pb-2 mb-4">
              <h3 className="text-xs font-extrabold text-[#5c4033] uppercase tracking-widest flex items-center gap-2 font-mono">
                <span>📁</span> Subject-wise Folders ({workspace.folders.length})
              </h3>
              <button
                id="btn-add-subject-folder"
                onClick={() => {
                  const name = prompt('Enter name of new subject folder:');
                  if (name) onCreateFolder(name, 'text');
                }}
                className="text-xs text-[#8c2522] font-black hover:underline cursor-pointer"
              >
                + Add Subject Folder
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspace.folders.map(folder => {
                const folderNotebooks = workspace.notebooks.filter(nb => nb.folderId === folder.id);
                const folderDocs = workspace.documents.filter(doc => doc.folderId === folder.id);
                const totalChaptersCount = folderNotebooks.reduce((acc, nb) => {
                  return acc + workspace.chapters.filter(ch => ch.notebookId === nb.id).length;
                }, 0);

                return (
                  <div
                    key={folder.id}
                    id={`folder-${folder.id}`}
                    className="border border-[#ebdcb9] bg-[#fcf8f2] rounded p-4 hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-2xl select-none">📁</span>
                        <button
                          onClick={() => {
                            if (confirm('Delete this folder and all nested notebooks?')) onDeleteNode(folder.id, 'folder');
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#8c2522] hover:text-[#5a1311] transition-opacity uppercase text-[9px] font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                      <h4 className="font-extrabold text-[#3e2723] text-sm leading-snug mb-2">{folder.name}</h4>
                      <p className="text-[11px] text-[#5c4033] font-mono font-medium">
                        {folder.section === 'documents' 
                          ? `Contains ${folderDocs.length} Docs` 
                          : `Contains ${folderNotebooks.length} Ledgers ${folderDocs.length > 0 ? `& ${folderDocs.length} Docs` : ''} (${totalChaptersCount} chapters)`
                        }
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#ebdcb9]/40 flex flex-wrap gap-1.5 leading-none">
                      {folder.section !== 'documents' && (
                        <button
                          onClick={() => {
                            const name = prompt('Enter ledger title:');
                            if (name) {
                              onCreateNotebook(name, folder.id, folder.section === 'handwriting' ? 'handwriting' : 'text', '#8c2522', 'leather', 'brass_plate');
                            }
                          }}
                          className="bg-[#5c4033] text-white hover:bg-[#3e2723] rounded px-2 py-1 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          + Create Ledger
                        </button>
                      )}
                      {folder.section === 'documents' && (
                        <button
                          onClick={() => {
                            const name = prompt('Document Title:');
                            const content = prompt('Document Plain Content:');
                            if (name) onImportDocument(name, content || '', 'txt', folder.id);
                          }}
                          className="bg-[#1e3557] text-white hover:bg-[#112138] rounded px-2 py-1 text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          + Add Doc
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEDGER BOOKS & SHELF GRID */}
          <div className="mb-6">
            <div className="flex justify-between items-center border-b border-[#ebdcb9]/80 pb-2 mb-4">
              <h3 className="text-xs font-extrabold text-[#5c4033] uppercase tracking-widest flex items-center gap-2 font-mono">
                <span>📚</span> Study Volumes & Master Ledgers ({workspace.notebooks.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {workspace.notebooks.map(notebook => {
                const notebookChapters = workspace.chapters.filter(ch => ch.notebookId === notebook.id);
                const parentFolder = workspace.folders.find(f => f.id === notebook.folderId);

                return (
                  <div
                    key={notebook.id}
                    id={`notebook-${notebook.id}`}
                    className="border border-[#ebdcb9] bg-[#fcf8f2] rounded-r-md rounded-l shadow hover:shadow-lg transition-all duration-300 relative group flex flex-col justify-between border-l-4"
                    style={{ borderLeftColor: notebook.coverColor || '#8c2522' }}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] bg-[#ebdcb9]/40 text-[#5c4033] px-2 py-0.5 rounded-full uppercase font-extrabold font-mono">
                          {notebook.coverLabel || 'classic'} · {notebook.coverStyle || 'leather'}
                        </span>
                        <button
                          onClick={() => onDeleteNode(notebook.id, 'notebook')}
                          className="opacity-0 group-hover:opacity-100 text-[#8c2522] hover:text-[#5a1311] transition-opacity uppercase text-[9px] font-bold cursor-pointer"
                        >
                          Burn Book
                        </button>
                      </div>

                      <h4 className="font-extrabold text-[#2e1c0c] text-sm mb-1 leading-snug">{notebook.name}</h4>
                      {parentFolder && (
                        <p className="text-[10px] text-[#8c2522] font-black uppercase mb-3 font-mono">
                          📁 {parentFolder.name.replace(/[^a-zA-Z0-9\s:()-]/g, '')}
                        </p>
                      )}

                      {/* Chapters listing inside book */}
                      <div className="space-y-2 mt-3 max-h-[160px] overflow-y-auto pr-1">
                        {notebookChapters.length === 0 ? (
                          <p className="text-[10px] text-[#8c2522] italic">No chapters in this volume yet.</p>
                        ) : (
                          notebookChapters.map(chapter => {
                            const papers = workspace.notepapers.filter(p => p.chapterId === chapter.id);

                            return (
                              <div key={chapter.id} className="border-b border-[#ebdcb9]/20 pb-2">
                                <div className="flex justify-between items-center gap-1">
                                  <span className="text-[11px] font-extrabold text-[#5c4033] truncate max-w-[150px]">
                                    Book {chapter.order || ''}: {chapter.name}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const title = prompt('Enter page title:');
                                      if (title) onCreateNotepaper(title, chapter.id);
                                    }}
                                    className="text-[9px] text-[#8c2522] font-black whitespace-nowrap cursor-pointer"
                                    title="Add New Writing Page"
                                  >
                                    + Add Page
                                  </button>
                                </div>
                                <div className="pl-3 space-y-1 mt-1">
                                  {papers.map(p => (
                                    <div
                                      key={p.id}
                                      onClick={() => {
                                        onSelectItem(p.id, 'page');
                                        // Set corresponding section dynamically
                                        if (notebook.section === 'handwriting') {
                                          onSelectSection('handwriting');
                                        } else {
                                          onSelectSection('text');
                                        }
                                      }}
                                      className={`text-[11px] font-semibold leading-normal truncate cursor-pointer py-1 px-1.5 rounded transition-all ${
                                        activeItemId === p.id
                                          ? 'bg-[#8c2522] text-[#fdfbf7] font-extrabold'
                                          : 'text-[#3e2723] hover:bg-[#ebdcb9]/25 hover:underline'
                                      }`}
                                    >
                                      📄 {p.title}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="p-3 bg-[#faf4eb] border-t border-[#ebdcb9]/40 text-right">
                      <button
                        onClick={() => {
                          const chapName = prompt('Enter new chapter title:');
                          if (chapName) onCreateChapter(chapName, notebook.id);
                        }}
                        className="bg-[#ebdcb9]/60 hover:bg-[#ebdcb9] text-[#5c4033] px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer"
                      >
                        + Create Chapter
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ALL DOCUMENTS */}
          <div className="mb-4">
            <div className="flex justify-between items-center border-b border-[#ebdcb9]/80 pb-2 mb-4">
              <h3 className="text-xs font-extrabold text-[#5c4033] uppercase tracking-widest flex items-center gap-2 font-mono">
                <span>📜</span> Text Annexures & Case Study Papers ({workspace.documents.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workspace.documents.map(doc => (
                <div
                  key={doc.id}
                  onClick={() => {
                    onSelectItem(doc.id, 'document');
                    onSelectSection('documents');
                  }}
                  className={`border p-4 rounded cursor-pointer hover:shadow-md transition-all duration-300 relative group flex justify-between items-start ${
                    activeItemId === doc.id
                      ? 'bg-[#efebd8] border-[#8c2522] shadow'
                      : 'border-[#ebdcb9]/80 bg-[#fdfbf7] hover:bg-[#fcf8f2]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl select-none">📄</span>
                      <span className="text-[9px] uppercase font-bold text-[#8c2522] tracking-wider px-1.5 bg-amber-100 rounded font-mono">
                        {doc.fileType || 'txt'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-[#3e2723] text-xs truncate">{doc.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1.5 leading-relaxed italic">
                      {doc.fileUrl ? doc.fileUrl.substring(0, 150) : 'Empty text file content.'}...
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this source document?')) onDeleteNode(doc.id, 'document');
                    }}
                    className="opacity-0 group-hover:opacity-100 text-[#8c2522] hover:text-[#5a1311] ml-2 text-[9px] font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop grid footer */}
        <div className="border-t border-[#ebdcb9] bg-[#fcf8f2] px-6 py-2.5 text-[10px] text-[#5c4033] uppercase flex justify-between shrink-0 font-extrabold font-mono select-none">
          <span>Cabinet Desk Mode: Active</span>
          <span>Double-click border to Collapse Explorer</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col border-r border-[#ebdcb9] bg-[#fdfbf7] font-serif @container">
      {/* Drawer Section Selectors */}
      <button
        onClick={() => onSelectSection('dashboard')}
        className={`m-2 mx-3 p-2 rounded border border-[#ebdcb9]/60 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
          selectedSection === 'dashboard'
            ? 'bg-[#8c2522] text-[#fdfbf7] shadow border-[#5a1311]'
            : 'bg-[#faf4eb]/50 text-[#5c4033] hover:bg-[#ebdcb9]/30'
        }`}
      >
        <Library className="h-4 w-4 shrink-0" />
        <span>🏛️ Cabinet Dashboard</span>
      </button>

      <div className="grid grid-cols-3 gap-1 border-b border-[#ebdcb9]/50 bg-[#fcf8f2] p-2 text-[11px]">
        <button
          onClick={() => onSelectSection('documents')}
          className={`flex flex-col items-center gap-1 rounded-xs py-1.5 text-center font-medium transition-all duration-200 ${
            selectedSection === 'documents'
              ? 'bg-[#5c4033] text-[#fdfbf7] shadow-sm'
              : 'text-[#5c4033] hover:bg-[#faf4eb]'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span className="scale-90 select-none">Documents</span>
        </button>
        <button
          onClick={() => onSelectSection('text')}
          className={`flex flex-col items-center gap-1 rounded-xs py-1.5 text-center font-medium transition-all duration-200 ${
            selectedSection === 'text'
              ? 'bg-[#5c4033] text-[#fdfbf7] shadow-sm'
              : 'text-[#5c4033] hover:bg-[#faf4eb]'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span className="scale-90 select-none">Text Notes</span>
        </button>
        <button
          onClick={() => onSelectSection('handwriting')}
          className={`flex flex-col items-center gap-1 rounded-xs py-1.5 text-center font-medium transition-all duration-200 ${
            selectedSection === 'handwriting'
              ? 'bg-[#5c4033] text-[#fdfbf7] shadow-sm'
              : 'text-[#5c4033] hover:bg-[#faf4eb]'
          }`}
        >
          <PenTool className="h-4 w-4" />
          <span className="scale-90 select-none">Handwrite</span>
        </button>
      </div>

      {/* Directory Search */}
      <div className="relative border-b border-[#e2d6c5] p-3">
        <Search className="absolute top-5.5 left-5.5 h-4 w-4 text-[#ebdcb9]" />
        <input
          type="text"
          placeholder="Lookup parchment..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full rounded-sm border border-[#ebdcb9] bg-white py-1.5 pr-3 pl-8 text-xs text-[#3e2723] shadow-xs outline-none focus:border-[#8c2522] focus:ring-1 focus:ring-[#8c2522]"
        />
      </div>

      {/* Action Drawer Tool Buttons */}
      <div className="flex items-center justify-between border-b border-[#e2d6c5] bg-[#faf4eb]/40 px-3 py-2">
        <span className="text-[11px] font-bold tracking-wider text-[#8c2522] uppercase">Filing Cabinet</span>
        <div className="flex gap-2">
          {selectedSection === 'documents' ? (
            <>
              <button
                onClick={() => {
                  setSelectedFolderForImport(null);
                  setShowImportModal(true);
                }}
                className="flex items-center gap-1 rounded-xs bg-[#5c4033]/10 px-2 py-1 text-xs text-[#5c4033] transition-all hover:bg-[#5c4033] hover:text-[#fdfbf7]"
              >
                <Plus className="h-3 w-3" />
                <span>Import Doc</span>
              </button>
              <button
                onClick={() => setShowNewFolderModal(true)}
                title="Create Folder for Documents"
                className="rounded-xs bg-[#5c4033]/10 p-1 text-[#5c4033] transition-all hover:bg-[#5c4033] hover:text-[#fdfbf7]"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setSelectedFolderForNotebook(null);
                  setShowNewNotebookModal(true);
                }}
                title="Assemble New Notebook"
                className="flex items-center gap-1 rounded-xs bg-[#8c2522]/10 px-2 py-1 text-xs text-[#8c2522] font-semibold transition-all hover:bg-[#8c2522] hover:text-[#fdfbf7]"
              >
                <Plus className="h-3 w-3" />
                <span>Notebook</span>
              </button>
              <button
                onClick={() => setShowNewFolderModal(true)}
                title="Create Grouping Folder"
                className="rounded-xs bg-[#5c4033]/10 p-1 text-[#5c4033] transition-all hover:bg-[#5c4033] hover:text-[#fdfbf7]"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Directory Tree Node View */}
      <div className="flex-1 overflow-y-auto px-2 py-3 vintage-scroll bg-[#fdfbf7]">
        {/* Folders & Documents Tree for Section 'Documents' */}
        {selectedSection === 'documents' && (
          <div className="space-y-3">
            {/* Folder Loop */}
            {currentFolders.map(folder => {
              const isExpanded = expandedFolders[folder.id];
              const docsInFolder = filteredDocuments.filter(d => d.folderId === folder.id);

              return (
                <div key={folder.id} className="group/folder">
                  <div className="flex items-center justify-between rounded-sm px-2 py-1 hover:bg-[#fcf8f2] transition-colors">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="flex flex-1 items-center gap-2 text-start text-xs font-semibold text-[#5c4033]"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5 text-[#ebdcb9]" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-[#ebdcb9]" />
                      )}
                      {isExpanded ? (
                        <FolderOpen className="h-4.5 w-4.5 text-[#8c2522] opacity-80" />
                      ) : (
                        <Folder className="h-4.5 w-4.5 text-[#5c4033] opacity-80" />
                      )}
                      <span className="truncate">{folder.name}</span>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover/folder:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedFolderForImport(folder.id);
                          setShowImportModal(true);
                        }}
                        title="Import Document to Folder"
                        className="rounded-xs p-1 text-[#5c4033] hover:bg-[#ebdcb9]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDeleteNode(folder.id, 'folder')}
                        title="Archive Folder"
                        className="rounded-xs p-1 text-red-700 hover:bg-[#e5a2a2]/30"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Children Documents */}
                  {isExpanded && (
                    <div className="ml-5 border-l border-[#e2d6c5] pl-2 mr-1 space-y-1">
                      {docsInFolder.length === 0 ? (
                        <div className="py-2 pl-3 text-[11px] italic text-[#ebdcb9]">Empty parchment pouch</div>
                      ) : (
                        docsInFolder.map(doc => (
                          <div
                            key={doc.id}
                            className={`group/doc flex items-center justify-between rounded-xs px-2 py-1 text-xs transition-all ${
                              activeItemId === doc.id
                                ? 'bg-[#ebdcb9] font-semibold text-[#3e2723]'
                                : 'text-[#3e2723] hover:bg-[#faf4eb]'
                            }`}
                          >
                            <button
                              onClick={() => onSelectItem(doc.id, 'document')}
                              className="flex flex-1 items-center gap-2 text-start truncate"
                            >
                              <FileText className="h-3.5 w-3.5 shrink-0 opacity-60 text-[#8c2522]" />
                              <span className="truncate">{doc.title}</span>
                            </button>
                            <button
                              onClick={() => onDeleteNode(doc.id, 'document')}
                              className="opacity-0 group-hover/doc:opacity-100 p-0.5 text-red-700 transition-opacity hover:bg-red-50 rounded"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loose Root Documents */}
            {filteredDocuments.filter(d => !d.folderId).map(doc => (
              <div
                key={doc.id}
                className={`group/doc flex items-center justify-between rounded-xs px-2 py-1 text-xs transition-all ${
                  activeItemId === doc.id
                    ? 'bg-[#ebdcb9]/80 font-semibold text-[#3e2723]'
                    : 'text-[#3e2723] hover:bg-[#faf4eb]'
                }`}
              >
                <button
                  onClick={() => onSelectItem(doc.id, 'document')}
                  className="flex flex-1 items-center gap-2 text-start truncate"
                >
                  <FileText className="h-3.5 w-3.5 shrink-0 text-[#8c2522] opacity-70" />
                  <span className="truncate font-medium">{doc.title}</span>
                </button>
                <button
                  onClick={() => onDeleteNode(doc.id, 'document')}
                  className="opacity-0 group-hover/doc:opacity-100 p-0.5 text-red-700 transition-opacity hover:bg-[#e5a2a2]/20 rounded"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notebooks & Chapters Tree for Section 'Text' & 'Handwriting' */}
        {selectedSection !== 'documents' && (
          <div className="space-y-3">
            {/* Folders with Notebooks */}
            {currentFolders.map(folder => {
              const isExpanded = expandedFolders[folder.id];
              const notebooksInFolder = currentNotebooks.filter(nb => nb.folderId === folder.id);

              return (
                <div key={folder.id} className="group/folder">
                  <div className="flex items-center justify-between rounded-sm px-1 py-1 hover:bg-[#fcf8f2] transition-colors">
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="flex flex-1 items-center gap-1.5 text-start text-xs font-semibold text-[#5c4033]"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-[#ebdcb9]" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-[#ebdcb9]" />
                      )}
                      <FolderOpen className="h-4 w-4 text-[#8c2522] opacity-70" />
                      <span className="truncate">{folder.name}</span>
                    </button>
                    <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover/folder:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedFolderForNotebook(folder.id);
                          setShowNewNotebookModal(true);
                        }}
                        title="Assemble Notebook in Folder"
                        className="rounded-xs p-1 text-[#5c4033] hover:bg-[#ebdcb9]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDeleteNode(folder.id, 'folder')}
                        className="rounded-xs p-1 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Notebooks under this folder */}
                  {isExpanded && (
                    <div className="ml-4 border-l border-[#ebdcb9] pl-2 space-y-2 py-1">
                      {notebooksInFolder.length === 0 ? (
                        <div className="py-2 pl-3 text-[11px] italic text-[#ebdcb9]">Empty Folder</div>
                      ) : (
                        notebooksInFolder.map(nb => renderNotebookNode(nb))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loose Root Notebooks */}
            {currentNotebooks.filter(nb => !nb.folderId).map(nb => renderNotebookNode(nb))}
          </div>
        )}
      </div>

      {/* RENDER NOTEBOOK ITEM NODES (COMPLETED) */}

      {/* MINI MODAL OVERLAYS */}
      {showNewFolderModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-sm rounded-sm border border-[#ebdcb9] bg-[#fdfbf7] p-4 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#8c2522] border-b border-[#ebdcb9] pb-2 mb-3">Assemble Cabinet Pouch</h3>
            <input
              type="text"
              placeholder="E.g. Antique Manuscripts"
              value={newFolderName}
              onChange={e => setNewFolderName(e.target.value)}
              className="w-full rounded-xs border border-[#ebdcb9] bg-white p-2 text-sm outline-none focus:border-[#8c2522]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowNewFolderModal(false)}
                className="rounded-xs border border-[#ebdcb9] px-3 py-1.5 text-xs text-[#5c4033]"
              >
                Retreat
              </button>
              <button
                onClick={() => {
                  if (newFolderName) {
                    onCreateFolder(newFolderName, selectedSection === 'dashboard' ? 'text' : selectedSection);
                    setNewFolderName('');
                    setShowNewFolderModal(false);
                  }
                }}
                className="rounded-xs bg-[#8c2522] px-3 py-1.5 text-xs text-[#fdfbf7]"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewNotebookModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-3">
          <div className="w-full max-w-sm rounded border border-[#ebdcb9] bg-[#fdfbf7] p-5 shadow-2xl">
            <h3 className="font-display text-base font-extrabold text-[#8c2522] border-b border-[#ebdcb9] pb-2 mb-3 uppercase tracking-wide">
              📚 Craft New Notebook
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#5c4033] mb-1">Notebook Title</label>
                <input
                  type="text"
                  placeholder="E.g. Field Ledger Vol. I"
                  value={newNotebookName}
                  onChange={e => setNewNotebookName(e.target.value)}
                  className="w-full rounded border border-[#ebdcb9] bg-white p-2 text-sm outline-none focus:border-[#8c2522]"
                />
              </div>

              {/* Cover Color Picker */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#5c4033] mb-1">Cover Leather Color</label>
                <div className="flex gap-1.5 flex-wrap">
                  {[
                    { hex: '#8c2522', name: 'Burgundy' },
                    { hex: '#2e4f3f', name: 'Emerald' },
                    { hex: '#1e3557', name: 'Royal' },
                    { hex: '#1a1a1a', name: 'Obsidian' },
                    { hex: '#b5823c', name: 'Ochre' },
                    { hex: '#4f5d65', name: 'Slate' }
                  ].map(c => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewNotebookColor(c.hex)}
                      className={`w-5.5 h-5.5 rounded-full border shadow transition-transform ${
                        newNotebookColor === c.hex ? 'scale-110 ring-2 ring-amber-500' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Style Choices */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#5c4033] mb-1">Material</label>
                  <select
                    value={newNotebookStyle}
                    onChange={e => setNewNotebookStyle(e.target.value as any)}
                    className="w-full p-1.5 rounded border border-[#ebdcb9] bg-white outline-none"
                  >
                    <option value="leather">Leather</option>
                    <option value="linen">Canvas Linen</option>
                    <option value="parchment">Parchment</option>
                    <option value="marbled">Marbled Paper</option>
                    <option value="velvet">Velvet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-[#5c4033] mb-1">Spine Label</label>
                  <select
                    value={newNotebookLabel}
                    onChange={e => setNewNotebookLabel(e.target.value as any)}
                    className="w-full p-1.5 rounded border border-[#ebdcb9] bg-white outline-none"
                  >
                    <option value="classic">Scribe Paper</option>
                    <option value="vintage">Italian Script</option>
                    <option value="minimal">Gold Stamp</option>
                    <option value="brass_plate">Brass Plate</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowNewNotebookModal(false)}
                className="rounded border border-[#ebdcb9] px-3 py-1.5 text-xs text-[#5c4033]"
              >
                Retreat
              </button>
              <button
                onClick={() => {
                  if (newNotebookName) {
                    onCreateNotebook(
                      newNotebookName,
                      selectedFolderForNotebook,
                      selectedSection === 'documents' ? 'text' : (selectedSection === 'dashboard' ? 'text' : selectedSection),
                      newNotebookColor,
                      newNotebookStyle,
                      newNotebookLabel
                    );
                    setNewNotebookName('');
                    setShowNewNotebookModal(false);
                  }
                }}
                className="rounded bg-[#8c2522] px-4 py-1.5 text-xs text-[#fdfbf7] font-bold shadow"
              >
                Bind & Scribe
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewChapterModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-sm rounded-sm border border-[#ebdcb9] bg-[#fdfbf7] p-4 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#8c2522] border-b border-[#ebdcb9] pb-2 mb-3">Add Chapter / Act</h3>
            <input
              type="text"
              placeholder="E.g. Chapter II: Alchemy"
              value={newChapterName}
              onChange={e => setNewChapterName(e.target.value)}
              className="w-full rounded-xs border border-[#ebdcb9] bg-white p-2 text-sm outline-none focus:border-[#8c2522]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowNewChapterModal(false)}
                className="rounded-xs border border-[#ebdcb9] px-3 py-1.5 text-xs text-[#5c4033]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newChapterName && selectedNotebookForChapter) {
                    onCreateChapter(newChapterName, selectedNotebookForChapter);
                    setNewChapterName('');
                    setShowNewChapterModal(false);
                  }
                }}
                className="rounded-xs bg-[#5c4033] px-3 py-1.5 text-xs text-[#fdfbf7]"
              >
                Add Chapter
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewPageModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-sm rounded-sm border border-[#ebdcb9] bg-[#fdfbf7] p-4 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#8c2522] border-b border-[#ebdcb9] pb-2 mb-3">Insert Notepaper Page</h3>
            <input
              type="text"
              placeholder="E.g. Daily Logs"
              value={newPageName}
              onChange={e => setNewPageName(e.target.value)}
              className="w-full rounded-xs border border-[#ebdcb9] bg-white p-2 text-sm outline-none focus:border-[#8c2522]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowNewPageModal(false)}
                className="rounded-xs border border-[#ebdcb9] px-3 py-1.5 text-xs text-[#5c4033]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPageName && selectedChapterForPage) {
                    onCreateNotepaper(newPageName, selectedChapterForPage);
                    setNewPageName('');
                    setShowNewPageModal(false);
                  }
                }}
                className="rounded-xs bg-[#8c2522] px-3 py-1.5 text-xs text-[#fdfbf7]"
              >
                Insert Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT DOCUMENT MODAL */}
      {showImportModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 px-3">
          <div className="w-full max-w-sm rounded-sm border border-[#ebdcb9] bg-[#fdfbf7] p-4 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#8c2522] border-b border-[#ebdcb9] pb-2 mb-3">Import PDF Document</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#5c4033] uppercase">Select PDF Document</label>
                <div 
                  className="mt-1 border-2 border-dashed border-[#ebdcb9] p-6 text-center bg-[#fcf8f2] rounded hover:bg-[#ebdcb9]/15 transition-all cursor-pointer relative"
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        if (file.type !== "application/pdf" && file.name.slice(-4).toLowerCase() !== '.pdf') {
                          alert("Only standard PDF documents are allowed.");
                          return;
                        }
                        setQuickImportTitle(file.name);
                        
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setQuickImportText(event.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <span className="text-2xl">📄</span>
                    <span className="text-xs font-bold text-[#3e2723]">
                      {quickImportTitle ? quickImportTitle : "Click or Drag PDF file here"}
                    </span>
                    <span className="text-[10px] text-[#8c2522] uppercase tracking-wider font-extrabold font-mono">
                      Strictly .pdf format only
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setQuickImportTitle('');
                  setQuickImportText('');
                  setShowImportModal(false);
                }}
                className="rounded-xs border border-[#ebdcb9] px-3 py-1.5 text-xs text-[#5c4033]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (quickImportTitle && quickImportText) {
                    onImportDocument(quickImportTitle, quickImportText, 'pdf', selectedFolderForImport);
                    setQuickImportTitle('');
                    setQuickImportText('');
                    setShowImportModal(false);
                  } else {
                    alert("Please select a valid PDF file to import.");
                  }
                }}
                disabled={!quickImportText}
                className="rounded-xs bg-[#8c2522] px-3 py-1.5 text-xs text-[#fdfbf7] disabled:opacity-50"
              >
                Import PDF Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
