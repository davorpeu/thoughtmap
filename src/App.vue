<script setup>
import { ref, onMounted } from 'vue'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import EntryForm from './components/EntryForm.vue'
import HistoryList from './components/HistoryList.vue'
import { t, locale, hasLocale, setLocale, applyDir, LANGUAGES } from './i18n.js'
import {
  getAllEntries,
  saveEntry,
  deleteEntry,
  getCustomEmotions,
  addCustomEmotion,
  getCustomThoughts,
  addCustomThought,
  deleteCustomThought,
  exportAll,
  importAll,
} from './db.js'

const tab = ref('new') // 'new' | 'history'
const entries = ref([])
const customEmotions = ref([])
const customThoughts = ref([])
const editing = ref(null)
const fileInput = ref(null)
const showLangPicker = ref(!hasLocale())

async function refresh() {
  entries.value = await getAllEntries()
  customEmotions.value = await getCustomEmotions()
  customThoughts.value = await getCustomThoughts()
}

onMounted(() => {
  applyDir(locale.value)
  refresh()
})

function chooseLanguage(code) {
  setLocale(code)
  showLangPicker.value = false
}

async function onSave(entry) {
  try {
    await saveEntry(entry)
    editing.value = null
    await refresh()
    tab.value = 'history'
  } catch (err) {
    alert(t('couldNotSave') + (err?.message || err))
  }
}

async function onAddCustomEmotion(name) {
  await addCustomEmotion(name)
  customEmotions.value = await getCustomEmotions()
}

async function onAddCustomThought(text) {
  await addCustomThought(text)
  customThoughts.value = await getCustomThoughts()
}

// Drops the thought from the reusable library; entries that used it keep it.
async function onDeleteCustomThought(text) {
  await deleteCustomThought(text)
  customThoughts.value = await getCustomThoughts()
}

function onEdit(entry) {
  editing.value = entry
  tab.value = 'new'
}

async function onDelete(entry) {
  if (!confirm(t('deleteConfirm'))) return
  await deleteEntry(entry.id)
  await refresh()
}

function cancelEdit() {
  editing.value = null
}

// ---- Backup / restore ----------------------------------------------------

async function doExport() {
  const data = await exportAll()
  const json = JSON.stringify(data, null, 2)
  const stamp = new Date().toISOString().slice(0, 10)
  const name = `thoughtmap-backup-${stamp}.json`

  // In the Android/iOS app a <a download> click is silently ignored by the
  // WebView, so write a real file and hand it to the system share sheet.
  if (Capacitor.isNativePlatform()) {
    let uri
    let inDocuments = true
    try {
      // The phone's shared Documents folder, so the file survives and is easy
      // to find. Android 11+ may refuse it, so fall back to app storage and let
      // the share sheet be the way the backup leaves the device.
      try {
        ;({ uri } = await Filesystem.writeFile({
          path: name,
          data: json,
          directory: Directory.Documents,
          encoding: Encoding.UTF8,
          recursive: true,
        }))
      } catch {
        inDocuments = false
        ;({ uri } = await Filesystem.writeFile({
          path: name,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        }))
      }
    } catch (err) {
      alert(t('exportError') + (err?.message || err))
      return
    }

    if (inDocuments) alert(t('exportSaved') + name)
    try {
      await Share.share({
        title: name,
        text: t('exportShareText'),
        url: uri,
        dialogTitle: t('export'),
      })
    } catch {
      // Share sheet dismissed — the file is already written, nothing to report.
    }
    return
  }

  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  fileInput.value?.click()
}

async function onImportFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    const replace = confirm(t('importReplacePrompt'))
    await importAll(data, { replace })
    await refresh()
    alert(t('importDone'))
  } catch (err) {
    alert(t('importError') + err.message)
  } finally {
    event.target.value = ''
  }
}
</script>

<template>
  <div class="app">
    <!-- First-run language picker (also reopened via the globe button) -->
    <div v-if="showLangPicker" class="lang-overlay">
      <div class="lang-box">
        <h2>{{ t('chooseLanguage') }}</h2>
        <p class="lang-sub">{{ t('chooseLanguageSub') }}</p>
        <div class="lang-grid">
          <button
            v-for="lang in LANGUAGES"
            :key="lang.code"
            class="lang-option"
            :class="{ active: locale === lang.code }"
            @click="chooseLanguage(lang.code)"
          >
            {{ lang.name }}
          </button>
        </div>
      </div>
    </div>

    <header class="topbar">
      <h1>ThoughtMap</h1>
      <div class="backup">
        <button class="ghost" @click="showLangPicker = true" :title="t('language')">🌐</button>
        <button class="ghost" @click="doExport" :title="t('export')">⭳ {{ t('export') }}</button>
        <button class="ghost" @click="triggerImport" :title="t('import')">
          ⭱ {{ t('import') }}
        </button>
        <input
          ref="fileInput"
          type="file"
          accept="application/json"
          hidden
          @change="onImportFile"
        />
      </div>
    </header>

    <nav class="tabs">
      <button :class="{ active: tab === 'new' }" @click="tab = 'new'">
        {{ editing ? t('tabEdit') : t('tabNew') }}
      </button>
      <button :class="{ active: tab === 'history' }" @click="tab = 'history'">
        {{ t('tabHistory') }} <span v-if="entries.length" class="count">{{ entries.length }}</span>
      </button>
    </nav>

    <main class="content">
      <EntryForm
        v-show="tab === 'new'"
        :custom-emotions="customEmotions"
        :custom-thoughts="customThoughts"
        :editing="editing"
        @save="onSave"
        @add-custom-emotion="onAddCustomEmotion"
        @add-custom-thought="onAddCustomThought"
        @delete-custom-thought="onDeleteCustomThought"
        @cancel="cancelEdit"
      />
      <HistoryList
        v-if="tab === 'history'"
        :entries="entries"
        @edit="onEdit"
        @delete="onDelete"
      />
    </main>
  </div>
</template>

<style scoped>
.app {
  max-width: 640px;
  margin: 0 auto;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem 0.5rem;
  padding-top: max(1rem, env(safe-area-inset-top));
}
.topbar h1 {
  font-size: 1.3rem;
  margin: 0;
}
.backup {
  display: flex;
  gap: 0.4rem;
}
.ghost {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 0.6rem;
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  cursor: pointer;
}
.tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 5;
}
.tabs button {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--muted);
  border-radius: 0.75rem;
  padding: 0.6rem;
  font-weight: 600;
  cursor: pointer;
}
.tabs button.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.count {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 0 0.4rem;
  font-size: 0.75rem;
  margin-left: 0.25rem;
}
.content {
  flex: 1;
  padding: 0.5rem 1rem calc(2rem + env(safe-area-inset-bottom));
}
.lang-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 50;
}
.lang-box {
  width: 100%;
  max-width: 420px;
}
.lang-box h2 {
  margin: 0 0 0.35rem;
  text-align: center;
}
.lang-sub {
  margin: 0 0 1.2rem;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
}
.lang-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
.lang-option {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 0.8rem;
  padding: 0.9rem;
  font-size: 1.05rem;
  cursor: pointer;
}
.lang-option.active {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}
</style>
