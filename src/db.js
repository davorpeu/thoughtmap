import { openDB } from 'idb'

const DB_NAME = 'thoughtmap'
const DB_VERSION = 1
const ENTRIES = 'entries'
const CUSTOM_EMOTIONS = 'customEmotions'

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(ENTRIES)) {
      const store = db.createObjectStore(ENTRIES, { keyPath: 'id' })
      store.createIndex('createdAt', 'createdAt')
    }
    if (!db.objectStoreNames.contains(CUSTOM_EMOTIONS)) {
      db.createObjectStore(CUSTOM_EMOTIONS, { keyPath: 'name' })
    }
  },
})

// ---- Entries -------------------------------------------------------------

export async function getAllEntries() {
  const db = await dbPromise
  const all = await db.getAllFromIndex(ENTRIES, 'createdAt')
  // Newest first.
  return all.reverse()
}

// Strip Vue reactivity / proxies so IndexedDB can structured-clone the value.
function toPlain(value) {
  return JSON.parse(JSON.stringify(value))
}

export async function saveEntry(entry) {
  const db = await dbPromise
  const plain = toPlain(entry)
  await db.put(ENTRIES, plain)
  return plain
}

export async function deleteEntry(id) {
  const db = await dbPromise
  await db.delete(ENTRIES, id)
}

// ---- Custom emotions -----------------------------------------------------

export async function getCustomEmotions() {
  const db = await dbPromise
  const rows = await db.getAll(CUSTOM_EMOTIONS)
  return rows.map((r) => r.name)
}

export async function addCustomEmotion(name) {
  const db = await dbPromise
  await db.put(CUSTOM_EMOTIONS, { name })
}

// ---- Backup / restore ----------------------------------------------------

export async function exportAll() {
  const db = await dbPromise
  const entries = await db.getAll(ENTRIES)
  const customEmotions = await db.getAll(CUSTOM_EMOTIONS)
  return {
    app: 'thoughtmap',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    entries,
    customEmotions,
  }
}

export async function importAll(data, { replace = false } = {}) {
  const db = await dbPromise
  const tx = db.transaction([ENTRIES, CUSTOM_EMOTIONS], 'readwrite')
  if (replace) {
    await tx.objectStore(ENTRIES).clear()
    await tx.objectStore(CUSTOM_EMOTIONS).clear()
  }
  for (const entry of data.entries || []) {
    await tx.objectStore(ENTRIES).put(entry)
  }
  for (const em of data.customEmotions || []) {
    await tx.objectStore(CUSTOM_EMOTIONS).put(em)
  }
  await tx.done
}
