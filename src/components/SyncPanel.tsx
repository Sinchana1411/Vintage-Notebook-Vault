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

  const handleExport = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      // Draw a nice vintage border
      pdf.setDrawColor(140, 37, 34); // #8c2522 antique red
      pdf.setLineWidth(2);
      pdf.rect(10, 10, 190, 277);
      pdf.setLineWidth(0.5);
      pdf.rect(12, 12, 186, 273);

      // Title
      pdf.setTextColor(62, 39, 35); // #3e2723 dark brown
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text('THE VINTAGE WORKSPACE', 105, 40, { align: 'center' });

      pdf.setDrawColor(235, 220, 185); // #ebdcb9
      pdf.line(30, 48, 180, 48);

      // Subtitle
      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(11);
      pdf.setTextColor(140, 37, 34);
      pdf.text('Official Archival Index & Synchronization Sync File', 105, 56, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(92, 64, 51); // #5c4033
      pdf.setFontSize(10);

      pdf.text('Date of Archival:', 30, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text(new Date().toLocaleString(), 85, 80);

      pdf.setFont('helvetica', 'normal');
      pdf.text('Author Email:', 30, 95);
      pdf.setFont('helvetica', 'bold');
      pdf.text('sinchanabshetty012@gmail.com', 85, 95);

      pdf.setFont('helvetica', 'normal');
      pdf.text('Scribed Folders count:', 30, 110);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(workspace.folders?.length || 0), 85, 110);

      pdf.setFont('helvetica', 'normal');
      pdf.text('Registers (Notebooks):', 30, 125);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(workspace.notebooks?.length || 0), 85, 125);

      pdf.setFont('helvetica', 'normal');
      pdf.text('Page Volumes (Notepapers):', 30, 140);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(workspace.notepapers?.length || 0), 85, 140);

      pdf.setFont('helvetica', 'normal');
      pdf.text('Annotated PDF Documents:', 30, 155);
      pdf.setFont('helvetica', 'bold');
      pdf.text(String(workspace.documents?.length || 0), 85, 155);

      // Notes section
      pdf.setDrawColor(235, 220, 185);
      pdf.line(30, 175, 180, 175);

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Instructions for Restoration:', 30, 190);
      pdf.text('1. Do not modify or edit the text of this PDF file manually.', 35, 202);
      pdf.text('2. Upload this PDF directly back into the Vintage Workspace Sync Panel.', 35, 212);
      pdf.text('3. All scribes, ink sheets, and canvas records will be perfectly restored.', 35, 222);

      pdf.text('Generated via Scriptorium Engine', 105, 260, { align: 'center' });

      // Encode workspace data to base64 safely
      const jsonStr = JSON.stringify(workspace);
      const bytes = new TextEncoder().encode(jsonStr);
      let binary = '';
      const len = bytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      // Embed backup payload under /Keywords property securely
      pdf.setProperties({
        title: 'Vintage Workspace Backup',
        subject: 'Workspace Sync Data',
        keywords: `VINTAGE_BACKUP:${base64}`
      });

      pdf.save('vintage_workspace_backup.pdf');
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF backup.');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isPdf = file.type === 'application/pdf' || file.name.slice(-4).toLowerCase() === '.pdf';
      
      fileReader.readAsText(file, "UTF-8");
      fileReader.onload = (event) => {
        try {
          const fileText = event.target?.result as string;
          let jsonStr = '';

          if (isPdf) {
            // Find vintage backup pattern inside the PDF raw text stream
            const match = fileText.match(/VINTAGE_BACKUP:([A-Za-z0-9+/=]+)/);
            if (match && match[1]) {
              const b64 = match[1];
              const binary = atob(b64);
              const len = binary.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              jsonStr = new TextDecoder().decode(bytes);
            } else {
              alert("The selected PDF file does not contain a valid Vintage Workspace Backup payload.");
              return;
            }
          } else {
            jsonStr = fileText;
          }

          const parsed = JSON.parse(jsonStr);
          if (parsed.version && (parsed.folders || parsed.notebooks)) {
            onImportWorkspace(parsed);
            setSyncState('synced');
            setLastSynced(new Date().toLocaleTimeString());
          } else {
            alert("Invalid Vintage Workspace Format. Please confirm this is a valid workspace backup.");
          }
        } catch (error) {
          alert("Error decoding file. Please ensure it is a valid format.");
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
          <h1 className="font-display text-lg font-bold text-[#3e2723]">The Vintage Workspace</h1>
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
          title="Backup Workspace strictly as PDF"
          className="flex items-center gap-1.5 rounded-sm border border-[#ebdcb9] bg-white px-3 py-1.5 text-xs font-medium text-[#5c4033] shadow-xs hover:bg-[#faf4eb] active:scale-95"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export Sync PDF</span>
        </button>

        {/* Import Backup */}
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Import Workspace PDF Sync File"
          className="flex items-center gap-1.5 rounded-sm bg-[#5c4033] px-3 py-1.5 text-xs font-medium text-[#fdfbf7] shadow-xs hover:bg-[#3e2723] active:scale-95"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Import Sync PDF</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept="application/pdf"
          className="hidden"
        />
      </div>
    </div>
  );
}

