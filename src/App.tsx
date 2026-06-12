import React, { useState, useEffect, useMemo } from 'react';
import { 
  Folder, Book, Layers, FileText, PenTool, Search, 
  HelpCircle, Menu, ChevronLeft, RefreshCw 
} from 'lucide-react';
import { 
  VintageWorkspaceData, Folder as IFolder, Notebook, 
  Chapter, Notepaper, ImportedDocument 
} from './types';
import { INITIAL_WORKSPACE } from './utils/initialData';
import Sidebar from './components/Sidebar';
import DocumentAnnotator from './components/DocumentAnnotator';
import TextNotesSection from './components/TextNotesSection';
import HandwrittenSection from './components/HandwrittenSection';
import SyncPanel from './components/SyncPanel';
import CabinetDashboard from './components/CabinetDashboard';

export default function App() {
  const [workspace, setWorkspace] = useState<VintageWorkspaceData>(() => {
    const local = localStorage.getItem('scriptorium_workspace');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.version && parsed.folders) {
          return parsed;
        }
      } catch (err) {
        console.error('Failed to parse local Scriptorium workspace: ', err);
      }
    }
    return INITIAL_WORKSPACE;
  });

  const [selectedSection, setSelectedSection] = useState<'dashboard' | 'documents' | 'text' | 'handwriting'>('dashboard');
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [activeItemType, setActiveItemType] = useState<'document' | 'page' | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDbLoading, setIsDbLoading] = useState(true);

  // Drag-resizable sidebar functionality
  const [sidebarWidth, setSidebarWidth] = useState<number>(320);
  const [isDraggingSidebar, setIsDraggingSidebar] = useState<boolean>(false);

  // Load from IndexedDB on startup
  useEffect(() => {
    let active = true;
    import('./utils/dbService').then(m => {
      m.loadWorkspaceFromIndexedDB().then(dbWorkspace => {
        if (active && dbWorkspace) {
          setWorkspace(dbWorkspace);
        }
        if (active) {
          setIsDbLoading(false);
        }
      }).catch(err => {
        console.error('Failed to load initially from IndexedDB:', err);
        if (active) {
          setIsDbLoading(false);
        }
      });
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isDraggingSidebar) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(240, Math.min(window.innerWidth, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDraggingSidebar(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSidebar]);

  // Auto-save to IndexedDB/LocalStorage on changes
  useEffect(() => {
    if (!isDbLoading) {
      import('./utils/dbService').then(m => {
        m.saveWorkspaceToIndexedDB(workspace);
      });
    }
  }, [workspace, isDbLoading]);

  // Keep track of the last active item per section to remember where the user left off
  const [sectionActiveItems, setSectionActiveItems] = useState<Record<string, { id: string; type: 'document' | 'page' }>>(() => {
    const local = localStorage.getItem('scriptorium_section_active_items');
    if (local) {
      try {
        return JSON.parse(local);
      } catch (err) {
        console.error('Failed to parse local Scriptorium active items: ', err);
      }
    }
    return {};
  });

  const pageBelongsToSection = (pageId: string, sect: 'text' | 'handwriting') => {
    const page = workspace.notepapers.find(p => p.id === pageId);
    if (!page) return false;
    const chap = workspace.chapters.find(c => c.id === page.chapterId);
    if (!chap) return false;
    const nb = workspace.notebooks.find(n => n.id === chap.notebookId);
    if (!nb) return false;
    return nb.section === sect;
  };

  const isValidItem = (id: string, type: 'document' | 'page', sect: 'dashboard' | 'documents' | 'text' | 'handwriting') => {
    if (sect === 'dashboard') return false;
    if (sect === 'documents') {
      return type === 'document' && workspace.documents.some(d => d.id === id);
    }
    if (sect === 'text' || sect === 'handwriting') {
      return type === 'page' && workspace.notepapers.some(p => p.id === id) && pageBelongsToSection(id, sect);
    }
    return false;
  };

  // Update sectionActiveItems in localStorage and when active selection changes
  useEffect(() => {
    if (activeItemId && activeItemType && selectedSection !== 'dashboard') {
      setSectionActiveItems(prev => {
        const next = {
          ...prev,
          [selectedSection]: { id: activeItemId, type: activeItemType }
        };
        localStorage.setItem('scriptorium_section_active_items', JSON.stringify(next));
        return next;
      });
    }
  }, [activeItemId, activeItemType, selectedSection]);

  // Restore section-specific active item if needed on section switch
  useEffect(() => {
    if (selectedSection === 'dashboard') {
      return;
    }
    
    // If the currently active item is NOT valid for the current section, restore the last known active item
    if (!activeItemId || !activeItemType || !isValidItem(activeItemId, activeItemType, selectedSection)) {
      const saved = sectionActiveItems[selectedSection];
      if (saved && isValidItem(saved.id, saved.type, selectedSection)) {
        setActiveItemId(saved.id);
        setActiveItemType(saved.type);
      } else {
        setActiveItemId(null);
        setActiveItemType(null);
      }
    }
  }, [selectedSection, workspace]);

  // Set default selected leaf on load/section switch
  useEffect(() => {
    if (selectedSection === 'dashboard') {
      return;
    }
    if (activeItemId === null) {
      if (selectedSection === 'documents') {
        const doc = workspace.documents[0];
        if (doc) {
          setActiveItemId(doc.id);
          setActiveItemType('document');
        }
      } else {
        // Find first page of this section
        const notebookIds = workspace.notebooks
          .filter(n => n.section === selectedSection)
          .map(n => n.id);
        const chapterIds = workspace.chapters
          .filter(ch => notebookIds.includes(ch.notebookId))
          .map(ch => ch.id);
        const firstPage = workspace.notepapers.find(p => chapterIds.includes(p.chapterId));
        if (firstPage) {
          setActiveItemId(firstPage.id);
          setActiveItemType('page');
        } else {
          setActiveItemId(null);
          setActiveItemType(null);
        }
      }
    }
  }, [selectedSection, workspace, activeItemId]);

  // Handler for section navigation swaps
  const handleSelectSection = (sect: 'dashboard' | 'documents' | 'text' | 'handwriting') => {
    setSelectedSection(sect);
    if (sect === 'dashboard') {
      setActiveItemId(null);
      setActiveItemType(null);
    }
  };

  const handleSelectItem = (id: string, type: 'document' | 'page') => {
    setActiveItemId(id);
    setActiveItemType(type);
  };

  // MUTATORS
  const handleCreateFolder = (name: string, section: 'documents' | 'text' | 'handwriting') => {
    const newF: IFolder = {
      id: `f-${section === 'documents' ? 'doc' : section === 'text' ? 'txt' : 'hw'}-${Date.now()}`,
      name,
      section,
      createdAt: Date.now()
    };
    setWorkspace(prev => ({
      ...prev,
      folders: [...prev.folders, newF]
    }));
  };

  const handleCreateNotebook = (
    name: string, 
    folderId: string | null, 
    section: 'text' | 'handwriting',
    coverColor?: string,
    coverStyle?: 'leather' | 'linen' | 'parchment' | 'marbled' | 'velvet',
    coverLabel?: 'classic' | 'vintage' | 'minimal' | 'brass_plate'
  ) => {
    const newNB: Notebook = {
      id: `nb-${section === 'text' ? 'txt' : 'hw'}-${Date.now()}`,
      folderId,
      name,
      section,
      createdAt: Date.now(),
      coverColor: coverColor || '#8c2522',
      coverStyle: coverStyle || 'leather',
      coverLabel: coverLabel || 'brass_plate'
    };
    setWorkspace(prev => ({
      ...prev,
      notebooks: [...prev.notebooks, newNB]
    }));
  };

  const handleCreateChapter = (name: string, notebookId: string) => {
    const newCh: Chapter = {
      id: `ch-${Date.now()}`,
      notebookId,
      name,
      createdAt: Date.now(),
      order: workspace.chapters.filter(c => c.notebookId === notebookId).length + 1
    };
    setWorkspace(prev => ({
      ...prev,
      chapters: [...prev.chapters, newCh]
    }));
  };

  const handleCreateNotepaper = (title: string, chapterId: string) => {
    const newP: Notepaper = {
      id: `p-${Date.now()}`,
      chapterId,
      title,
      createdAt: Date.now(),
      paperStyle: 'ruled',
      pageSize: 'Portrait',
      hasMargin: true,
      formattedHtml: '<p style="font-family: Georgia, serif; font-size: 16px; color: #333; line-height: 1.8;">Begin scribing here...</p>',
      tables: [],
      charts: [],
      shapes: [],
      drawingsData: ''
    };
    setWorkspace(prev => ({
      ...prev,
      notepapers: [...prev.notepapers, newP]
    }));
    setActiveItemId(newP.id);
    setActiveItemType('page');
  };

  const handleImportDocument = (title: string, content: string, type: 'txt' | 'image' | 'pdf', folderId: string | null) => {
    let resolvedFolderId = folderId;

    if (type === 'pdf' && !resolvedFolderId) {
      let importedFolder = workspace.folders.find(
        f => f.name.toLowerCase() === 'imported documents' && f.section === 'documents'
      );
      
      if (!importedFolder) {
        importedFolder = {
          id: `f-doc-imported-${Date.now()}`,
          name: 'Imported documents',
          section: 'documents',
          createdAt: Date.now()
        };
        // Add folder immediately
        setWorkspace(prev => ({
          ...prev,
          folders: [...prev.folders, importedFolder!]
        }));
      }
      resolvedFolderId = importedFolder.id;
    }

    const newDoc: ImportedDocument = {
      id: `doc-${Date.now()}`,
      folderId: resolvedFolderId,
      title,
      createdAt: Date.now(),
      fileType: type,
      fileUrl: content,
      annotations: '',
      pageSize: 'Portrait',
      paperStyle: 'ruled',
      hasMargin: true,
      stickyNotes: []
    };
    setWorkspace(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
    setActiveItemId(newDoc.id);
    setActiveItemType('document');
    setSelectedSection('documents');
  };

  const handleDeleteNode = (id: string, type: 'folder' | 'notebook' | 'chapter' | 'page' | 'document') => {
    if (!confirm(`Are you sure you wish to archive this ${type} and all its linked sheets?`)) return;

    setWorkspace(prev => {
      let folders = [...prev.folders];
      let notebooks = [...prev.notebooks];
      let chapters = [...prev.chapters];
      let notepapers = [...prev.notepapers];
      let documents = [...prev.documents];

      if (type === 'folder') {
        folders = folders.filter(f => f.id !== id);
        // Cascade null folder reference or delete child items
        notebooks = notebooks.map(nb => nb.folderId === id ? { ...nb, folderId: null } : nb);
        documents = documents.map(d => d.folderId === id ? { ...d, folderId: null } : d);
      } else if (type === 'notebook') {
        notebooks = notebooks.filter(nb => nb.id !== id);
        const childChIds = chapters.filter(ch => ch.notebookId === id).map(ch => ch.id);
        chapters = chapters.filter(ch => ch.notebookId !== id);
        notepapers = notepapers.filter(p => !childChIds.includes(p.chapterId));
      } else if (type === 'chapter') {
        chapters = chapters.filter(ch => ch.id !== id);
        notepapers = notepapers.filter(p => p.chapterId !== id);
      } else if (type === 'page') {
        notepapers = notepapers.filter(p => p.id !== id);
      } else if (type === 'document') {
        documents = documents.filter(d => d.id !== id);
      }

      return {
        ...prev,
        folders,
        notebooks,
        chapters,
        notepapers,
        documents
      };
    });

    if (activeItemId === id) {
      setActiveItemId(null);
      setActiveItemType(null);
    }
  };

  // Full replaces workspace for JSON file imports
  const handleImportWorkspace = (data: VintageWorkspaceData) => {
    setWorkspace(data);
    setActiveItemId(null);
    setActiveItemType(null);
  };

  const handleUpdateDocument = (updated: ImportedDocument) => {
    setWorkspace(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === updated.id ? updated : d)
    }));
  };

  const handleUpdatePage = (updated: Notepaper) => {
    setWorkspace(prev => ({
      ...prev,
      notepapers: prev.notepapers.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const handleUpdateNotebook = (updated: Notebook) => {
    setWorkspace(prev => ({
      ...prev,
      notebooks: prev.notebooks.map(nb => nb.id === updated.id ? updated : nb)
    }));
  };

  // Find active items
  const activeDoc = activeItemType === 'document' 
    ? workspace.documents.find(d => d.id === activeItemId) || null 
    : null;

  const activePage = activeItemType === 'page'
    ? workspace.notepapers.find(p => p.id === activeItemId) || null
    : null;

  // Get all notepapers belonging strictly to the currently opened notebook in logical order
  const activeNotebookNotepapersOrdered = useMemo(() => {
    if (!activePage) return [];
    const activeChapter = workspace.chapters.find(c => c.id === activePage.chapterId);
    if (!activeChapter) return [];
    const activeNotebookId = activeChapter.notebookId;
    if (!activeNotebookId) return [];

    // 1. Get all chapters of this notebook and sort by order
    const nbChapters = [...workspace.chapters].filter(ch => ch.notebookId === activeNotebookId);
    nbChapters.sort((a, b) => (a.order || 0) - (b.order || 0));

    // 2. Collect pages under each chapter of this notebook
    const orderedPages: Notepaper[] = [];
    nbChapters.forEach(ch => {
      const chPages = [...workspace.notepapers].filter(p => p.chapterId === ch.id);
      chPages.sort((a, b) => a.createdAt - b.createdAt);
      orderedPages.push(...chPages);
    });

    return orderedPages;
  }, [workspace, activePage]);

  // Determine prev/next pages specifically within this notebook
  const activePageIndex = useMemo(() => {
    if (!activeItemId || activeItemType !== 'page') return -1;
    return activeNotebookNotepapersOrdered.findIndex(p => p.id === activeItemId);
  }, [activeItemId, activeItemType, activeNotebookNotepapersOrdered]);

  const prevPage = activePageIndex > 0 ? activeNotebookNotepapersOrdered[activePageIndex - 1] : null;
  const nextPage = activePageIndex >= 0 && activePageIndex < activeNotebookNotepapersOrdered.length - 1 
    ? activeNotebookNotepapersOrdered[activePageIndex + 1] 
    : null;

  const pageIndexInfo = activePageIndex >= 0 && activeNotebookNotepapersOrdered.length > 0
    ? `Page ${activePageIndex + 1} of ${activeNotebookNotepapersOrdered.length}`
    : '';

  const currentChapterName = useMemo(() => {
    if (!activePage) return undefined;
    const ch = workspace.chapters.find(c => c.id === activePage.chapterId);
    return ch ? ch.title : undefined;
  }, [workspace.chapters, activePage]);

  const handlePrevPage = () => {
    if (prevPage) {
      handleSelectItem(prevPage.id, 'page');
    }
  };

  const handleNextPage = () => {
    if (nextPage) {
      handleSelectItem(nextPage.id, 'page');
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#faf4eb] text-[#333333]">
      
      {/* Cloud-Sync header */}
      <SyncPanel 
        workspace={workspace} 
        onImportWorkspace={handleImportWorkspace} 
        onSelectSection={handleSelectSection}
        onSelectItem={handleSelectItem}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Toggle sidebar button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute bottom-6 left-6 z-50 rounded-full border border-[#ebdcb9] bg-[#3e2723] p-3 text-[#fdfbf7] shadow-lg transition-transform hover:scale-105 active:scale-95"
          title="Toggle filing drawer"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Sidebar Component */}
        <div 
          className="h-full relative flex shrink-0 border-r border-[#ebdcb9] overflow-hidden"
          style={{
            width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
            opacity: isSidebarOpen ? 1 : 0,
            transition: isDraggingSidebar ? 'none' : 'width 300ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms'
          }}
        >
          <div className="flex-1 h-full overflow-hidden">
            <Sidebar
              workspace={workspace}
              selectedSection={selectedSection}
              onSelectSection={handleSelectSection}
              activeItemId={activeItemId}
              onSelectItem={handleSelectItem}
              onCreateFolder={handleCreateFolder}
              onCreateNotebook={handleCreateNotebook}
              onCreateChapter={handleCreateChapter}
              onCreateNotepaper={handleCreateNotepaper}
              onImportDocument={handleImportDocument}
              onDeleteNode={handleDeleteNode}
              sidebarWidth={sidebarWidth}
            />
          </div>

          {/* Draggable Resizer border handle */}
          <div 
            id="sidebar-resize-handle"
            className={`absolute top-0 right-0 w-[5px] h-full cursor-col-resize z-40 transition-colors ${
              isDraggingSidebar ? 'bg-[#8c2522]' : 'bg-transparent hover:bg-[#8c2522]/30'
            }`}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsDraggingSidebar(true);
            }}
            onDoubleClick={() => {
              // Double click toggles between standard 320px and nearly full screen folder explorer!
              setSidebarWidth(prev => prev > 500 ? 320 : Math.round(window.innerWidth * 0.95));
            }}
            title="Drag to resize filing drawer / Double-click to toggle folder explorer view"
          />
        </div>

        {/* Dynamic Workbench Workspace View */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#faf4eb]">
          {selectedSection === 'dashboard' ? (
            <CabinetDashboard
              workspace={workspace}
              onSelectItem={handleSelectItem}
              onSelectSection={handleSelectSection}
              onCreateFolder={handleCreateFolder}
              onCreateNotebook={handleCreateNotebook}
              onUpdateNotebook={handleUpdateNotebook}
              onDeleteNode={handleDeleteNode}
              onUpdateWorkspace={setWorkspace}
            />
          ) : selectedSection === 'documents' ? (
            <DocumentAnnotator
              documentItem={activeDoc}
              onUpdateDocument={handleUpdateDocument}
            />
          ) : selectedSection === 'text' ? (
            <TextNotesSection
              pageItem={activePage}
              onUpdatePage={handleUpdatePage}
              onCreateNotepaper={handleCreateNotepaper}
              allNotepapers={workspace.notepapers}
              onPrevPage={prevPage ? handlePrevPage : undefined}
              onNextPage={nextPage ? handleNextPage : undefined}
              pageIndexInfo={pageIndexInfo || undefined}
              prevPageTitle={prevPage?.title || undefined}
              nextPageTitle={nextPage?.title || undefined}
              chapterName={currentChapterName}
            />
          ) : (
            <HandwrittenSection
              pageItem={activePage}
              onUpdatePage={handleUpdatePage}
              onCreateNotepaper={handleCreateNotepaper}
              allNotepapers={workspace.notepapers}
              onPrevPage={prevPage ? handlePrevPage : undefined}
              onNextPage={nextPage ? handleNextPage : undefined}
              pageIndexInfo={pageIndexInfo || undefined}
              prevPageTitle={prevPage?.title || undefined}
              nextPageTitle={nextPage?.title || undefined}
              chapterName={currentChapterName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
