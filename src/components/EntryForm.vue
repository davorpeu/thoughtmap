<script setup>
import { ref, watch } from 'vue'
import ChipSelect from './ChipSelect.vue'
import { DEFAULT_EMOTIONS } from '../emotions.js'
import { DEFAULT_THOUGHTS, DISTORTIONS } from '../thoughts.js'
import { t, tEmotion, tThought, tDistortion, tDistortionDesc } from '../i18n.js'
import { toDatetimeLocal, fromDatetimeLocal, newId } from '../utils.js'

const props = defineProps({
  customEmotions: { type: Array, default: () => [] },
  customThoughts: { type: Array, default: () => [] },
  editing: { type: Object, default: null },
})
const emit = defineEmits([
  'save',
  'add-custom-emotion',
  'add-custom-thought',
  'delete-custom-thought',
  'cancel',
])

function blank() {
  return {
    id: newId(),
    createdAtLocal: toDatetimeLocal(new Date().toISOString()),
    situation: '',
    thought: '',
    symptoms: '',
    thoughts: [],
    emotions: [],
    distortions: [],
    response: '',
  }
}

const form = ref(blank())

// When we get an entry to edit, load it into the form.
watch(
  () => props.editing,
  (e) => {
    if (!e) return
    form.value = {
      id: e.id,
      createdAtLocal: toDatetimeLocal(e.createdAt),
      situation: e.situation || '',
      thought: e.thought || '',
      symptoms: e.symptoms || '',
      thoughts: (e.thoughts || []).map((x) => ({ ...x })),
      emotions: (e.emotions || []).map((x) => ({ ...x })),
      distortions: [...(e.distortions || [])],
      response: e.response || '',
    }
  },
  { immediate: true },
)

function submit() {
  emit('save', {
    id: form.value.id,
    createdAt: fromDatetimeLocal(form.value.createdAtLocal),
    situation: form.value.situation.trim(),
    thought: form.value.thought.trim(),
    symptoms: form.value.symptoms.trim(),
    thoughts: form.value.thoughts,
    emotions: form.value.emotions,
    distortions: form.value.distortions,
    response: form.value.response.trim(),
  })
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

    <label class="field">
      <span class="label">{{ t('symptoms') }}</span>
      <textarea
        v-model="form.symptoms"
        rows="2"
        :placeholder="t('symptomsPlaceholder')"
      ></textarea>
    </label>

    <div class="field">
      <span class="label">{{ t('thoughts') }}</span>
      <p class="hint">{{ t('thoughtsHint') }}</p>
      <ChipSelect
        v-model="form.thoughts"
        :options="DEFAULT_THOUGHTS"
        :custom-options="customThoughts"
        :translate="tThought"
        :placeholder="t('thoughtSearchPlaceholder')"
        allow-custom
        intensity
        stacked
        @add-custom="$emit('add-custom-thought', $event)"
        @delete-custom="$emit('delete-custom-thought', $event)"
      />
    </div>

    <div class="field">
      <span class="label">{{ t('emotions') }}</span>
      <ChipSelect
        v-model="form.emotions"
        :options="DEFAULT_EMOTIONS"
        :custom-options="customEmotions"
        :translate="tEmotion"
        :placeholder="t('emotionSearchPlaceholder')"
        allow-custom
        intensity
        sort
        @add-custom="$emit('add-custom-emotion', $event)"
      />
    </div>

    <div class="field">
      <span class="label">{{ t('distortions') }}</span>
      <ChipSelect
        v-model="form.distortions"
        :options="DISTORTIONS"
        :translate="tDistortion"
        :describe="tDistortionDesc"
        :placeholder="t('distortionSearchPlaceholder')"
        stacked
      />
    </div>

    <label class="field">
      <span class="label">{{ t('response') }}</span>
      <textarea
        v-model="form.response"
        rows="3"
        :placeholder="t('responsePlaceholder')"
      ></textarea>
    </label>

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
.hint {
  margin: -0.15rem 0 0.1rem;
  font-size: 0.8rem;
  color: var(--muted);
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
