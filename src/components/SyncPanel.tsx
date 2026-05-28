import React, { useState, useRef, useEffect } from 'react';
import { 
  Cloud, CloudLightning, Download, Upload, RefreshCw, 
  Check, AlertCircle, Search, FileText, PenTool, Book, Folder 
} from 'lucide-react';
import { VintageWorkspaceData } from '../types';

interface SearchResult {
  id: string;
  title: string;
  type: 'page' | 'document' | 'notebook' | 'chapter' | 'folder';
  section: 'dashboard' | 'documents' | 'text' | 'handwriting';
  subText?: string;
  snippet?: string;
  hasItem?: boolean;
}

interface SyncPanelProps {
  workspace: VintageWorkspaceData;
  onImportWorkspace: (data: VintageWorkspaceData) => void;
  onSelectSection: (section: 'dashboard' | 'documents' | 'text' | 'handwriting') => void;
  onSelectItem: (id: string, type: 'document' | 'page') => void;
}

export default function SyncPanel({ 
  workspace, 
  onImportWorkspace,
  onSelectSection,
  onSelectItem
}: SyncPanelProps) {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced' | 'error'>('synced');
  const [lastSynced, setLastSynced] = useState<string>(new Date().toLocaleTimeString());
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(workspace, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `scriptorium_workspace_backup.vnote`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.version && (parsed.folders || parsed.notebooks)) {
            onImportWorkspace(parsed);
            setSyncState('synced');
            setLastSynced(new Date().toLocaleTimeString());
          } else {
            alert("Invalid Scriptorium Format. Please confirm this is a valid .vnote workspace backup.");
          }
        } catch (error) {
          alert("Error decoding file. Please ensure it is a JSON format workspace.");
        }
      };
    }
  };

  const triggerSync = () => {
    setSyncState('syncing');
    setTimeout(() => {
      setSyncState('synced');
      setLastSynced(new Date().toLocaleTimeString());
    }, 1500);
  };

  // Build search results
  const getSearchResults = (): SearchResult[] => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // 1. Search Notepapers (Pages)
    workspace.notepapers.forEach(page => {
      const chapter = workspace.chapters.find(ch => ch.id === page.chapterId);
      const notebook = chapter ? workspace.notebooks.find(nb => nb.id === chapter.notebookId) : null;
      const section = notebook ? notebook.section : 'text';
      
      const parentPath = notebook && chapter ? `${notebook.name} ➔ ${chapter.name}` : chapter ? chapter.name : '';
      
      const titleMatch = page.title.toLowerCase().includes(query);
      
      // Clean HTML formatting to do semantic match on content
      const pageText = page.rawText || '';
      const htmlText = page.formattedHtml ? page.formattedHtml.replace(/<[^>]*>/g, ' ') : '';
      const bodyText = `${pageText} ${htmlText}`;
      const bodyMatchIndex = bodyText.toLowerCase().indexOf(query);
      
      if (titleMatch || bodyMatchIndex !== -1 || parentPath.toLowerCase().includes(query)) {
        let snippet = '';
        if (bodyMatchIndex !== -1 && !titleMatch) {
          const start = Math.max(0, bodyMatchIndex - 35);
          const end = Math.min(bodyText.length, bodyMatchIndex + query.length + 45);
          snippet = `...${bodyText.slice(start, end).replace(/\s+/g, ' ')}...`;
        }
        
        results.push({
          id: page.id,
          title: page.title,
          type: 'page',
          section: section as 'text' | 'handwriting',
          subText: parentPath,
          snippet: snippet || undefined
        });
      }
    });

    // 2. Search Documents
    workspace.documents.forEach(doc => {
      const folder = workspace.folders.find(f => f.id === doc.folderId);
      const folderPath = folder ? `Folder: ${folder.name}` : 'Unassigned Doc';
      
      const titleMatch = doc.title.toLowerCase().includes(query);
      
      // Search file raw text
      const docText = doc.fileType === 'txt' ? doc.fileUrl : '';
      const docMatchIndex = docText.toLowerCase().indexOf(query);
      
      if (titleMatch || docMatchIndex !== -1 || folderPath.toLowerCase().includes(query)) {
        let snippet = '';
        if (docMatchIndex !== -1 && !titleMatch) {
          const start = Math.max(0, docMatchIndex - 35);
          const end = Math.min(docText.length, docMatchIndex + query.length + 45);
          snippet = `...${docText.slice(start, end).replace(/\s+/g, ' ')}...`;
        }
        
        results.push({
          id: doc.id,
          title: doc.title,
          type: 'document',
          section: 'documents',
          subText: folderPath,
          snippet: snippet || undefined
        });
      }
    });

    // 3. Search Notebooks
    workspace.notebooks.forEach(nb => {
      if (nb.name.toLowerCase().includes(query)) {
        const firstCh = workspace.chapters.find(ch => ch.notebookId === nb.id);
        const firstPg = firstCh ? workspace.notepapers.find(p => p.chapterId === firstCh.id) : null;
        
        results.push({
          id: firstPg ? firstPg.id : nb.id,
          title: nb.name,
          type: 'notebook',
          section: nb.section,
          subText: `Notebook in ${nb.section === 'text' ? 'Text' : 'Handwriting'} Scribing`,
          hasItem: firstPg != null
        });
      }
    });

    // 4. Search Chapters
    workspace.chapters.forEach(ch => {
      if (ch.name.toLowerCase().includes(query)) {
        const notebook = workspace.notebooks.find(nb => nb.id === ch.notebookId);
        if (notebook) {
          const firstPg = workspace.notepapers.find(p => p.chapterId === ch.id);
          results.push({
            id: firstPg ? firstPg.id : ch.id,
            title: ch.name,
            type: 'chapter',
            section: notebook.section,
            subText: `Chapter in Notebook: ${notebook.name}`,
            hasItem: firstPg != null
          });
        }
      }
    });

    // 5. Search Folders
    workspace.folders.forEach(f => {
      if (f.name.toLowerCase().includes(query)) {
        results.push({
          id: f.id,
          title: f.name,
          type: 'folder',
          section: f.section,
          subText: `Filing Cabinet Drawer (${f.section})`
        });
      }
    });

    return results;
  };

  const searchResults = getSearchResults();

  // Grouped search results for polished display
  const groupedResults = searchResults.reduce(
    (acc, curr) => {
      if (curr.type === 'page') {
        acc.pages.push(curr);
      } else if (curr.type === 'document') {
        acc.documents.push(curr);
      } else {
        acc.hierarchy.push(curr);
      }
      return acc;
    },
    { pages: [] as SearchResult[], documents: [] as SearchResult[], hierarchy: [] as SearchResult[] }
  );

  const handleResultClick = (res: SearchResult) => {
    setSearchQuery('');
    setIsFocused(false);
    
    if (res.type === 'folder') {
      onSelectSection(res.section);
    } else if (res.type === 'notebook' || res.type === 'chapter') {
      onSelectSection(res.section);
      if (res.hasItem) {
        onSelectItem(res.id, 'page');
      }
    } else if (res.type === 'page') {
      onSelectSection(res.section);
      onSelectItem(res.id, 'page');
    } else if (res.type === 'document') {
      onSelectSection('documents');
      onSelectItem(res.id, 'document');
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <mark key={i} className="bg-amber-250 text-[#3e2723] font-semibold rounded-xs px-0.5">{part}</mark>
            : part
        )}
      </span>
    );
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ebdcb9] bg-[#fcf8f2] px-6 py-3 font-serif shadow-xs">
      {/* Brand Profile section */}
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-[#8c2522]/10 p-2 text-[#8c2522]">
          <Cloud className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-lg font-bold text-[#3e2723]">The Scriptorium Workspace</h1>
          <div className="flex items-center gap-2 text-xs text-[#5c4033]">
            <span className="inline-block h-2/2 w-2 rounded-full bg-emerald-600">●</span>
            <span>Cloud-Synced Archive</span>
            <span className="opacity-60">|</span>
            <span>User: <strong className="font-mono text-[11px] font-medium bg-[#8c2522]/5 px-1 py-0.5 rounded text-[#8c2522]">sinchanabshetty012@gmail.com</strong></span>
          </div>
        </div>
      </div>

      {/* Center - Universal Global Search Bar */}
      <div ref={searchContainerRef} className="relative flex-1 max-w-sm md:max-w-md mx-4 min-w-[240px]">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-[#8c2522]" />
          <input
            type="text"
            placeholder="Search scribed pages, documents, books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-sm border border-[#ebdcb9] bg-[#fdfbf7] text-[#3e2723] focus:outline-none focus:ring-1 focus:ring-[#8c2522] focus:border-[#8c2522] placeholder:text-stone-400 font-serif shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-stone-400 hover:text-[#8c2522] text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Floating Intelligent Dropdown Search Results Overlay */}
        {isFocused && searchQuery.trim() && (
          <div className="absolute left-0 right-0 mt-1.5 max-h-[380px] overflow-y-auto rounded-md border border-[#ebdcb9] bg-[#fdfbf7] shadow-xl z-[90] font-sans scrollbar-thin">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#5c4033] italic">
                No matching scrolls, documents, or notebooks found in archive.
              </div>
            ) : (
              <div className="p-1">
                {/* 1. Pages/Notepapers matches */}
                {groupedResults.pages.length > 0 && (
                  <div>
                    <div className="bg-[#8c2522]/5 text-[#8c2522] font-semibold text-[10px] uppercase tracking-wider px-2 py-1 select-none flex items-center gap-1 rounded-xs">
                      <PenTool className="h-3 w-3" />
                      <span>Scribed Pages</span>
                    </div>
                    {groupedResults.pages.map(res => (
                      <button
                        key={res.id}
                        onClick={() => handleResultClick(res)}
                        className="w-full text-left p-2 hover:bg-[#faf4eb] rounded-xs transition-colors flex flex-col border-b border-stone-100 last:border-none"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-medium text-[#3e2723] truncate">
                            {highlightMatch(res.title, searchQuery)}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {res.section === 'handwriting' ? 'Handwritten' : 'Text'}
                          </span>
                        </div>
                        {res.subText && (
                          <span className="text-[10px] text-[#5c4033]/70 font-serif italic truncate mt-0.5">
                            {res.subText}
                          </span>
                        )}
                        {res.snippet && (
                          <span className="text-[10px] text-stone-500 font-mono mt-1 bg-stone-100/50 p-1 rounded-sm border border-stone-200/40 line-clamp-2">
                            {highlightMatch(res.snippet, searchQuery)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. Imported Documents Matches */}
                {groupedResults.documents.length > 0 && (
                  <div className="mt-2">
                    <div className="bg-stone-100 text-stone-700 font-semibold text-[10px] uppercase tracking-wider px-2 py-1 select-none flex items-center gap-1 rounded-xs">
                      <FileText className="h-3 w-3" />
                      <span>Imported Documents</span>
                    </div>
                    {groupedResults.documents.map(res => (
                      <button
                        key={res.id}
                        onClick={() => handleResultClick(res)}
                        className="w-full text-left p-2 hover:bg-[#faf4eb] rounded-xs transition-colors flex flex-col border-b border-stone-100 last:border-none"
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="text-xs font-medium text-[#3e2723] truncate">
                            {highlightMatch(res.title, searchQuery)}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">Document</span>
                        </div>
                        {res.subText && (
                          <span className="text-[10px] text-[#5c4033]/70 font-serif italic truncate mt-0.5">
                            {res.subText}
                          </span>
                        )}
                        {res.snippet && (
                          <span className="text-[10px] text-stone-500 font-mono mt-1 bg-stone-100/50 p-1 rounded-sm border border-stone-200/40 line-clamp-2">
                            {highlightMatch(res.snippet, searchQuery)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. Notebooks/Chapters/Folders Structural matches */}
                {groupedResults.hierarchy.length > 0 && (
                  <div className="mt-2">
                    <div className="bg-amber-900/5 text-[#5c4033] font-semibold text-[10px] uppercase tracking-wider px-2 py-1 select-none flex items-center gap-1 rounded-xs">
                      <Book className="h-3 w-3" />
                      <span>Registers & Cabinets</span>
                    </div>
                    {groupedResults.hierarchy.map(res => (
                      <button
                        key={res.id}
                        onClick={() => handleResultClick(res)}
                        className="w-full text-left p-2 hover:bg-[#faf4eb] rounded-xs transition-colors flex flex-col border-b border-stone-100 last:border-none"
                      >
                        <div className="flex items-center gap-2">
                          {res.type === 'folder' ? (
                            <Folder className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                          ) : (
                            <Book className="h-3.5 w-3.5 text-[#8c2522] shrink-0" />
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-[#3e2723] truncate">
                              {highlightMatch(res.title, searchQuery)}
                            </span>
                            {res.subText && (
                              <span className="text-[10px] text-[#5c4033]/70 font-serif italic truncate mt-0.5">
                                {res.subText}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Sync Status Button */}
        <button
          onClick={triggerSync}
          disabled={syncState === 'syncing'}
          className="flex items-center gap-1.5 rounded-sm border border-[#ebdcb9] bg-white px-3 py-1.5 text-xs font-medium text-[#5c4033] shadow-xs transition-all hover:bg-[#faf4eb] active:scale-95 disabled:pointer-events-none"
        >
          {syncState === 'syncing' ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#8c2522]" />
          ) : syncState === 'synced' ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
          )}
          <span>
            {syncState === 'syncing' ? 'Publishing Updates...' : `Synced: ${lastSynced}`}
          </span>
        </button>

        {/* Export Backup */}
        <button
          onClick={handleExport}
          title="Backup Workspace as .vnote"
          className="flex items-center gap-1.5 rounded-sm border border-[#ebdcb9] bg-white px-3 py-1.5 text-xs font-medium text-[#5c4033] shadow-xs hover:bg-[#faf4eb] active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export Sync File</span>
        </button>

        {/* Import Backup */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import .vnote Workspace File"
          className="flex items-center gap-1.5 rounded-sm bg-[#5c4033] px-3 py-1.5 text-xs font-medium text-[#fdfbf7] shadow-xs hover:bg-[#3e2723] active:scale-95"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Import Sync File</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".vnote,.json"
          className="hidden"
        />
      </div>
    </div>
  );
}

