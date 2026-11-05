/**
 * ImageStore using IndexedDB
 * Menyimpan data gambar referensi otomotif dan keyframe di IndexedDB
 * agar LocalStorage tidak melebihi kuota 5MB.
 */

const DB_NAME = 'CarSceneEngineImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

interface StoredImageRecord {
  id: string;
  dataUrl: string;
  createdAt: number;
}

// In-memory cache for fast synchronous access in components
const memoryCache = new Map<string, string>();

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada browser ini'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      console.error('Gagal membuka IndexedDB ImageStore:', error);
      reject(error);
    };
  });

  return dbPromise;
}

export function isIdbRef(str?: string | null): boolean {
  return typeof str === 'string' && str.startsWith('idb:');
}

export function generateImageRef(prefix = 'img'): string {
  return `idb:${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Menyimpan base64 dataUrl ke IndexedDB dan mengembalikan ID referensi (idb:...)
 */
export async function saveImageToStore(dataUrl: string, preferredId?: string): Promise<string> {
  if (!dataUrl) return '';

  // Jika sudah berupa idb ref, langsung kembalikan
  if (isIdbRef(dataUrl)) return dataUrl;

  const id = preferredId || generateImageRef('ref');
  memoryCache.set(id, dataUrl);

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const record: StoredImageRecord = {
        id,
        dataUrl,
        createdAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    return id;
  } catch (err) {
    console.warn('Gagal menyimpan ke IndexedDB, tetap menggunakan memory cache:', err);
    return id;
  }
}

/**
 * Mengambil gambar berdasarkan id referensi atau dataUrl
 */
export async function getImageFromStore(idOrUrl: string): Promise<string | null> {
  if (!idOrUrl) return null;
  if (!isIdbRef(idOrUrl)) return idOrUrl; // already base64 or external url

  if (memoryCache.has(idOrUrl)) {
    return memoryCache.get(idOrUrl)!;
  }

  try {
    const db = await getDB();
    return await new Promise<string | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(idOrUrl);
      req.onsuccess = () => {
        const result = req.result as StoredImageRecord | undefined;
        if (result && result.dataUrl) {
          memoryCache.set(idOrUrl, result.dataUrl);
          resolve(result.dataUrl);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Gagal mengambil gambar dari IndexedDB:', err);
    return null;
  }
}

/**
 * Synchronous getter from cache if already loaded
 */
export function getCachedImageUrl(idOrUrl: string | undefined): string | null {
  if (!idOrUrl) return null;
  if (!isIdbRef(idOrUrl)) return idOrUrl;
  return memoryCache.get(idOrUrl) || null;
}

/**
 * Menghapus gambar dari IndexedDB
 */
export async function deleteImageFromStore(idOrUrl: string): Promise<void> {
  if (!idOrUrl || !isIdbRef(idOrUrl)) return;

  memoryCache.delete(idOrUrl);

  try {
    const db = await getDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(idOrUrl);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.error('Gagal menghapus gambar dari IndexedDB:', err);
  }
}

/**
 * Pre-load list of image ids into memory cache
 */
export async function preloadImages(refs: string[]): Promise<void> {
  const missing = refs.filter((r) => isIdbRef(r) && !memoryCache.has(r));
  if (missing.length === 0) return;

  try {
    const db = await getDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      let count = 0;
      for (const id of missing) {
        const req = store.get(id);
        req.onsuccess = () => {
          if (req.result?.dataUrl) {
            memoryCache.set(id, req.result.dataUrl);
          }
          count++;
          if (count === missing.length) resolve();
        };
        req.onerror = () => {
          count++;
          if (count === missing.length) resolve();
        };
      }
    });
  } catch (e) {
    console.warn('Gagal preload gambar IndexedDB:', e);
  }
}

/**
 * Menghapus banyak gambar sekaligus (misal saat scene / project dihapus)
 */
export async function deleteMultipleImages(refs: string[]): Promise<void> {
  for (const ref of refs) {
    if (isIdbRef(ref)) {
      await deleteImageFromStore(ref);
    }
  }
}

/**
 * Standard Helper: saveImage(file | base64) -> Promise<string>
 * Returns unique IDB reference key: idb:img_{timestamp}_{random}
 */
export async function saveImage(input: File | string): Promise<string> {
  if (!input) return '';

  let dataUrl = '';
  if (typeof input === 'string') {
    if (isIdbRef(input)) return input;
    dataUrl = input;
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(input);
    });
  }

  const uniqueKey = `idb:img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return await saveImageToStore(dataUrl, uniqueKey);
}

/**
 * Standard Helper: getImage(key) -> Promise<string>
 * Returns data URL string (from cache or IDB)
 */
export async function getImage(key: string): Promise<string> {
  if (!key) return '';
  const result = await getImageFromStore(key);
  return result || '';
}

/**
 * Standard Helper: deleteImage(key) -> Promise<void>
 */
export async function deleteImage(key: string): Promise<void> {
  await deleteImageFromStore(key);
}

/**
 * Automatic migration helper:
 * Scans projects array for any legacy raw base64 data URLs in vehicle photos,
 * character photos, and scene keyframes, moves them to IDB, and replaces them
 * with idb:img_* reference keys to relieve localStorage quota.
 */
export async function migrateProjectsImagesToIDB(
  projects: any[]
): Promise<{ projects: any[]; migratedCount: number }> {
  let migratedCount = 0;

  const migrateVal = async (val: any): Promise<string> => {
    if (typeof val === 'string' && val.startsWith('data:image/')) {
      const ref = await saveImage(val);
      migratedCount++;
      return ref;
    }
    return val;
  };

  const clonedProjects = JSON.parse(JSON.stringify(projects));

  for (const proj of clonedProjects) {
    if (!Array.isArray(proj.scenes)) continue;
    for (const sc of proj.scenes) {
      if (sc.imageUrl) {
        sc.imageUrl = await migrateVal(sc.imageUrl);
      }
      // Migrate vehicle photos
      if (sc.vehicle) {
        if (sc.vehicle.exteriorPhotos) {
          for (const k of Object.keys(sc.vehicle.exteriorPhotos)) {
            if (k === 'extraPhotos' && Array.isArray(sc.vehicle.exteriorPhotos.extraPhotos)) {
              for (const item of sc.vehicle.exteriorPhotos.extraPhotos) {
                if (item?.url) item.url = await migrateVal(item.url);
              }
            } else if (typeof sc.vehicle.exteriorPhotos[k] === 'string') {
              sc.vehicle.exteriorPhotos[k] = await migrateVal(sc.vehicle.exteriorPhotos[k]);
            }
          }
        }
        if (sc.vehicle.interiorPhotos) {
          for (const k of Object.keys(sc.vehicle.interiorPhotos)) {
            if (k === 'extraPhotos' && Array.isArray(sc.vehicle.interiorPhotos.extraPhotos)) {
              for (const item of sc.vehicle.interiorPhotos.extraPhotos) {
                if (item?.url) item.url = await migrateVal(item.url);
              }
            } else if (typeof sc.vehicle.interiorPhotos[k] === 'string') {
              sc.vehicle.interiorPhotos[k] = await migrateVal(sc.vehicle.interiorPhotos[k]);
            }
          }
        }
      }
      // Migrate characters
      if (Array.isArray(sc.characters)) {
        for (const char of sc.characters) {
          if (char.imageUrl) {
            char.imageUrl = await migrateVal(char.imageUrl);
          }
        }
      } else if (sc.character?.imageUrl) {
        sc.character.imageUrl = await migrateVal(sc.character.imageUrl);
      }
    }
  }

  return { projects: clonedProjects, migratedCount };
}

