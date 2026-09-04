<script setup>
import { ref, computed } from 'vue'
import { DEFAULT_EMOTIONS } from '../emotions.js'
import { t, tEmotion } from '../i18n.js'

const props = defineProps({
  // Array of { name, intensity } — `name` is the canonical (English) key.
  modelValue: { type: Array, default: () => [] },
  customEmotions: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue', 'add-custom'])

const search = ref('')
const open = ref(false)

// Canonical keys (defaults + user's custom emotions).
const allEmotions = computed(() => {
  const set = new Set([...DEFAULT_EMOTIONS, ...props.customEmotions])
  return [...set]
})

const selectedNames = computed(() => new Set(props.modelValue.map((e) => e.name)))

// Options are keys, but shown/filtered by their translated label.
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return allEmotions.value
    .filter((name) => !selectedNames.value.has(name))
    .filter((name) => tEmotion(name).toLowerCase().includes(q) || name.toLowerCase().includes(q))
    .sort((a, b) => tEmotion(a).localeCompare(tEmotion(b)))
})

// Whether the typed text is a brand-new emotion we could add.
const canAddNew = computed(() => {
  const q = search.value.trim()
  if (!q) return false
  const exists = allEmotions.value.some(
    (n) => n.toLowerCase() === q.toLowerCase() || tEmotion(n).toLowerCase() === q.toLowerCase(),
  )
  return !exists
})

function addEmotion(name) {
  if (selectedNames.value.has(name)) return
  const next = [...props.modelValue, { name, intensity: 50 }]
  emit('update:modelValue', next)
  search.value = ''
}

function addNew() {
  const name = search.value.trim()
  if (!name) return
  emit('add-custom', name)
  addEmotion(name)
}

function removeEmotion(name) {
  emit(
    'update:modelValue',
    props.modelValue.filter((e) => e.name !== name),
  )
}

function setIntensity(name, value) {
  const next = props.modelValue.map((e) =>
    e.name === name ? { ...e, intensity: Number(value) } : e,
  )
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="emotion-select">
    <!-- Selected emotions with intensity sliders -->
    <div v-if="modelValue.length" class="selected">
      <div v-for="e in modelValue" :key="e.name" class="chip-row">
        <div class="chip-head">
          <span class="chip-name">{{ tEmotion(e.name) }}</span>
          <span class="chip-pct">{{ e.intensity }}%</span>
          <button type="button" class="chip-x" @click="removeEmotion(e.name)" aria-label="Remove">
            ×
          </button>
        </div>
        <input
          class="slider"
          type="range"
          min="0"
          max="100"
          step="5"
          :value="e.intensity"
          @input="setIntensity(e.name, $event.target.value)"
        />
      </div>
    </div>

    <!-- Search box -->
    <div class="search-wrap">
      <input
        v-model="search"
        class="search"
        type="text"
        :placeholder="t('emotionSearchPlaceholder')"
        @focus="open = true"
        @keydown.enter.prevent="canAddNew ? addNew() : (filtered[0] && addEmotion(filtered[0]))"
      />
    </div>

    <!-- Options -->
    <div v-if="open" class="options">
      <button
        v-for="name in filtered"
        :key="name"
        type="button"
        class="option"
        @click="addEmotion(name)"
      >
        {{ tEmotion(name) }}
      </button>
      <button v-if="canAddNew" type="button" class="option add-new" @click="addNew">
        + {{ t('add') }} “{{ search.trim() }}”
      </button>
      <p v-if="!filtered.length && !canAddNew" class="empty">{{ t('noMatches') }}</p>
    </div>
  </div>
</template>

<style scoped>
.emotion-select {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.selected {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.chip-row {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.6rem 0.75rem;
}
.chip-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.chip-name {
  font-weight: 600;
}
.chip-pct {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  font-weight: 600;
}
.chip-x {
  background: transparent;
  border: none;
  color: var(--muted);
  font-size: 1.3rem;
  line-height: 1;
  padding: 0 0.25rem;
  cursor: pointer;
}
.slider {
  width: 100%;
  margin-top: 0.5rem;
  accent-color: var(--accent);
}
.search {
  width: 100%;
}
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-height: 180px;
  overflow-y: auto;
  padding: 0.25rem 0;
}
.option {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
}
.option:active {
  background: var(--accent);
  color: #fff;
}
.add-new {
  border-color: var(--accent);
  color: var(--accent);
}
.empty {
  color: var(--muted);
  font-size: 0.9rem;
  padding: 0.25rem;
}
</style>
