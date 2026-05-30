import { VintageWorkspaceData } from '../types';

const DB_NAME = 'ScriptoriumWorkspaceDB';
const DB_VERSION = 1;
const STORE_NAME = 'WorkspaceStore';
const KEY_NAME = 'current_workspace';

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    
    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event: any) => {
      reject(event.target.error || new Error('Failed to open IndexedDB'));
    };
  });
}

export function saveWorkspaceToIndexedDB(data: VintageWorkspaceData): Promise<void> {
  return openDatabase()
    .then(db => {
      return new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(data, KEY_NAME);
        
        request.onsuccess = () => resolve();
        request.onerror = (event: any) => reject(event.target.error);
      });
    })
    .catch(err => {
      console.warn('IndexedDB write failed, falling back to LocalStorage:', err);
      try {
        localStorage.setItem('scriptorium_workspace', JSON.stringify(data));
      } catch (f) {
        console.error('LocalStorage backup save also failed:', f);
      }
    });
}

export function loadWorkspaceFromIndexedDB(): Promise<VintageWorkspaceData | null> {
  return openDatabase()
    .then(db => {
      return new Promise<VintageWorkspaceData | null>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(KEY_NAME);
        
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = (event: any) => {
          reject(event.target.error);
        };
      });
    })
    .catch(err => {
      console.warn('IndexedDB read failed, falling back to LocalStorage:', err);
      const local = localStorage.getItem('scriptorium_workspace');
      if (local) {
        try {
          return JSON.parse(local);
        } catch (_) {}
      }
      return null;
    });
}
