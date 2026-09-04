<script setup>
import { ref, watch } from 'vue'
import EmotionSelect from './EmotionSelect.vue'
import { t } from '../i18n.js'
import { toDatetimeLocal, fromDatetimeLocal, newId } from '../utils.js'

const props = defineProps({
  customEmotions: { type: Array, default: () => [] },
  editing: { type: Object, default: null },
})
const emit = defineEmits(['save', 'add-custom', 'cancel'])

function blank() {
  return {
    id: newId(),
    createdAtLocal: toDatetimeLocal(new Date().toISOString()),
    situation: '',
    thought: '',
    emotions: [],
  }
}

const form = ref(blank())

// When we get an entry to edit, load it into the form.
watch(
  () => props.editing,
  (e) => {
    if (e) {
      form.value = {
        id: e.id,
        createdAtLocal: toDatetimeLocal(e.createdAt),
        situation: e.situation,
        thought: e.thought,
        emotions: e.emotions.map((x) => ({ ...x })),
      }
    }
  },
  { immediate: true },
)

function submit() {
  const entry = {
    id: form.value.id,
    createdAt: fromDatetimeLocal(form.value.createdAtLocal),
    situation: form.value.situation.trim(),
    thought: form.value.thought.trim(),
    emotions: form.value.emotions,
  }
  emit('save', entry)
  form.value = blank()
}

function resetNow() {
  form.value.createdAtLocal = toDatetimeLocal(new Date().toISOString())
}
</script>

<template>
  <form class="entry-form" @submit.prevent="submit">
    <label class="field">
      <span class="label">{{ t('when') }}</span>
      <div class="datetime-row">
        <input v-model="form.createdAtLocal" type="datetime-local" required />
        <button type="button" class="mini" @click="resetNow">{{ t('now') }}</button>
      </div>
    </label>

    <label class="field">
      <span class="label">{{ t('situation') }}</span>
      <textarea
        v-model="form.situation"
        rows="3"
        :placeholder="t('situationPlaceholder')"
      ></textarea>
    </label>

    <label class="field">
      <span class="label">{{ t('thought') }}</span>
      <textarea
        v-model="form.thought"
        rows="3"
        :placeholder="t('thoughtPlaceholder')"
      ></textarea>
    </label>

    <div class="field">
      <span class="label">{{ t('emotions') }}</span>
      <EmotionSelect
        v-model="form.emotions"
        :custom-emotions="customEmotions"
        @add-custom="$emit('add-custom', $event)"
      />
    </div>

    <div class="actions">
      <button v-if="editing" type="button" class="secondary" @click="$emit('cancel')">
        {{ t('cancel') }}
      </button>
      <button type="submit" class="primary">
        {{ editing ? t('update') : t('saveEntry') }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.entry-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  font-weight: 600;
}
.datetime-row {
  display: flex;
  gap: 0.5rem;
}
.datetime-row input {
  flex: 1;
}
.mini {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 0.6rem;
  padding: 0 0.9rem;
  cursor: pointer;
}
.actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.3rem;
}
.actions button {
  flex: 1;
}
</style>
