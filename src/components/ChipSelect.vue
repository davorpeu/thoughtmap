<script setup>
import { ref, computed } from 'vue'
import { t } from '../i18n.js'

// A searchable multi-select over a list of canonical keys. Used three ways:
//   emotions    — intensity sliders, user can add their own
//   thoughts    — intensity sliders (belief %), user can add their own
//   distortions — plain chips, fixed list, each option carries a definition
const props = defineProps({
  // With `intensity`: array of { name, intensity }. Without: array of strings.
  modelValue: { type: Array, default: () => [] },
  // Built-in keys, plus the user's own (which can be deleted again).
  options: { type: Array, default: () => [] },
  customOptions: { type: Array, default: () => [] },
  // key -> label, and key -> one-line definition ('' for none).
  translate: { type: Function, required: true },
  describe: { type: Function, default: () => '' },
  placeholder: { type: String, default: '' },
  allowCustom: { type: Boolean, default: false },
  intensity: { type: Boolean, default: false },
  // Stack options one per row — right for sentences, wrong for short pills.
  stacked: { type: Boolean, default: false },
  // Sort options by translated label (single words); off keeps list order.
  sort: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'add-custom', 'delete-custom'])

const search = ref('')
const open = ref(false)

// The user's own entries come first — they are the ones they reach for.
const allOptions = computed(() => [...new Set([...props.customOptions, ...props.options])])

const selectedNames = computed(
  () => new Set(props.modelValue.map((e) => (props.intensity ? e.name : e))),
)

// Options are keys, but shown and filtered by their translated label.
const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = allOptions.value
    .filter((name) => !selectedNames.value.has(name))
    .filter(
      (name) =>
        props.translate(name).toLowerCase().includes(q) || name.toLowerCase().includes(q),
    )
  return props.sort
    ? [...list].sort((a, b) => props.translate(a).localeCompare(props.translate(b)))
    : list
})

// Whether the typed text is something new we could add to the library.
const canAddNew = computed(() => {
  if (!props.allowCustom) return false
  const q = search.value.trim()
  if (!q) return false
  return !allOptions.value.some(
    (n) =>
      n.toLowerCase() === q.toLowerCase() || props.translate(n).toLowerCase() === q.toLowerCase(),
  )
})

function add(name) {
  if (selectedNames.value.has(name)) return
  const item = props.intensity ? { name, intensity: 50 } : name
  emit('update:modelValue', [...props.modelValue, item])
  search.value = ''
}

function addNew() {
  const name = search.value.trim()
  if (!name) return
  emit('add-custom', name)
  add(name)
}

function remove(name) {
  emit(
    'update:modelValue',
    props.modelValue.filter((e) => (props.intensity ? e.name !== name : e !== name)),
  )
}

function setIntensity(name, value) {
  emit(
    'update:modelValue',
    props.modelValue.map((e) => (e.name === name ? { ...e, intensity: Number(value) } : e)),
  )
}

function onEnter() {
  if (canAddNew.value) addNew()
  else if (filtered.value[0]) add(filtered.value[0])
}

// Drop a user-added option from the library (already-saved entries keep it).
function deleteCustom(name, event) {
  event.stopPropagation()
  emit('delete-custom', name)
}
</script>

<template>
  <div class="chip-select">
    <!-- Selected, with an intensity slider each when this list uses them -->
    <div v-if="modelValue.length" class="selected">
      <template v-if="intensity">
        <div v-for="e in modelValue" :key="e.name" class="chip-row">
          <div class="chip-head">
            <span class="chip-name">{{ translate(e.name) }}</span>
            <span class="chip-pct">{{ e.intensity }}%</span>
            <button type="button" class="chip-x" @click="remove(e.name)" aria-label="Remove">
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
      </template>
      <div v-else class="picked">
        <button
          v-for="name in modelValue"
          :key="name"
          type="button"
          class="picked-chip"
          :title="describe(name)"
          @click="remove(name)"
        >
          {{ translate(name) }} <span class="picked-x">×</span>
        </button>
      </div>
    </div>

    <!-- Search box -->
    <input
      v-model="search"
      class="search"
      type="text"
      :placeholder="placeholder"
      @focus="open = true"
      @keydown.enter.prevent="onEnter"
    />

    <!-- Options -->
    <div v-if="open" class="options" :class="{ stacked }">
      <div v-for="name in filtered" :key="name" class="option-wrap">
        <button type="button" class="option" @click="add(name)">
          <span class="option-label">{{ translate(name) }}</span>
          <span v-if="describe(name)" class="option-desc">{{ describe(name) }}</span>
        </button>
        <button
          v-if="allowCustom && customOptions.includes(name)"
          type="button"
          class="option-del"
          :aria-label="`Remove ${translate(name)} from the list`"
          @click="deleteCustom(name, $event)"
        >
          ×
        </button>
      </div>
      <button v-if="canAddNew" type="button" class="option add-new" @click="addNew">
        + {{ t('add') }} “{{ search.trim() }}”
      </button>
      <p v-if="!filtered.length && !canAddNew" class="empty">{{ t('noMatches') }}</p>
    </div>
  </div>
</template>

<style scoped>
.chip-select {
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
  align-items: flex-start;
  gap: 0.5rem;
}
.chip-name {
  font-weight: 600;
  flex: 1;
  min-width: 0;
  overflow-wrap: anywhere;
}
.chip-pct {
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
.picked {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.picked-chip {
  background: var(--accent);
  border: 1px solid var(--accent);
  color: #fff;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  font-size: 0.9rem;
  text-align: start;
  cursor: pointer;
}
.picked-x {
  opacity: 0.75;
  margin-inline-start: 0.2rem;
}
.search {
  width: 100%;
}
.options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  max-height: 220px;
  overflow-y: auto;
  padding: 0.25rem 0;
}
.options.stacked {
  flex-direction: column;
  flex-wrap: nowrap;
}
.option-wrap {
  display: flex;
  align-items: stretch;
  gap: 0.25rem;
}
.options.stacked .option-wrap {
  width: 100%;
}
.option {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  text-align: start;
  cursor: pointer;
}
.options.stacked .option {
  flex: 1;
  min-width: 0;
  border-radius: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.75rem;
}
.option-label {
  overflow-wrap: anywhere;
}
.option-desc {
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.35;
}
.option:active {
  background: var(--accent);
  color: #fff;
}
.option:active .option-desc {
  color: rgba(255, 255, 255, 0.8);
}
.option-del {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 0.7rem;
  color: var(--muted);
  font-size: 1.1rem;
  line-height: 1;
  padding: 0 0.55rem;
  cursor: pointer;
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
