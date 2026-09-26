<script setup>
import { ref, watch } from 'vue'
import ChipSelect from './ChipSelect.vue'
import { DEFAULT_EMOTIONS } from '../emotions.js'
import { DISTORTIONS } from '../thoughts.js'
import { t, tEmotion, tDistortion, tDistortionDesc, tDistortionQuestion } from '../i18n.js'
import { toDatetimeLocal, fromDatetimeLocal, newId } from '../utils.js'

const props = defineProps({
  customEmotions: { type: Array, default: () => [] },
  editing: { type: Object, default: null },
})
const emit = defineEmits([
  'save',
  'add-custom-emotion',
  'cancel',
])

function blank() {
  return {
    id: newId(),
    createdAtLocal: toDatetimeLocal(new Date().toISOString()),
    situation: '',
    thought: '',
    // Belief in the thought (0–100), before and after the adaptive response.
    // null until the user moves the slider.
    belief: null,
    beliefAfter: null,
    symptoms: '',
    // Legacy: picked automatic thoughts from before 1.6. Not editable any more,
    // but carried through on save so editing an old entry doesn't drop them.
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
      belief: e.belief ?? null,
      beliefAfter: e.beliefAfter ?? null,
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
  const hasThought = !!form.value.thought.trim()
  emit('save', {
    id: form.value.id,
    createdAt: fromDatetimeLocal(form.value.createdAtLocal),
    situation: form.value.situation.trim(),
    thought: form.value.thought.trim(),
    belief: hasThought ? form.value.belief : null,
    beliefAfter: hasThought ? form.value.beliefAfter : null,
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
    <div v-if="form.thought.trim()" class="belief">
      <div class="belief-head">
        <span class="hint">{{ t('belief') }}</span>
        <span class="pct">{{ form.belief === null ? '—' : form.belief + '%' }}</span>
      </div>
      <input
        class="slider"
        type="range"
        min="0"
        max="100"
        step="5"
        :value="form.belief ?? 50"
        @input="form.belief = Number($event.target.value)"
      />
    </div>

    <label class="field">
      <span class="label">{{ t('symptoms') }}</span>
      <textarea
        v-model="form.symptoms"
        rows="2"
        :placeholder="t('symptomsPlaceholder')"
      ></textarea>
    </label>

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

    <div class="field">
      <label class="label" for="response">{{ t('response') }}</label>
      <details class="help">
        <summary>{{ t('helpToggle') }}</summary>
        <ol>
          <li v-for="q in t('helpQuestions')" :key="q">{{ q }}</li>
        </ol>
        <template v-if="form.distortions.length">
          <p class="help-sub">{{ t('helpDistortions') }}</p>
          <ul>
            <li v-for="d in form.distortions" :key="d">
              <b>{{ tDistortion(d) }}:</b> {{ tDistortionQuestion(d) }}
            </li>
          </ul>
        </template>
      </details>
      <textarea
        id="response"
        v-model="form.response"
        rows="3"
        :placeholder="t('responsePlaceholder')"
      ></textarea>
    </div>

    <div v-if="form.thought.trim()" class="belief">
      <div class="belief-head">
        <span class="hint">{{ t('beliefNow') }}</span>
        <span class="pct">{{ form.beliefAfter === null ? '—' : form.beliefAfter + '%' }}</span>
      </div>
      <input
        class="slider"
        type="range"
        min="0"
        max="100"
        step="5"
        :value="form.beliefAfter ?? 50"
        @input="form.beliefAfter = Number($event.target.value)"
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
.hint {
  margin: -0.15rem 0 0.1rem;
  font-size: 0.8rem;
  color: var(--muted);
}
.belief {
  margin-top: -0.6rem;
}
.belief-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}
.belief .hint {
  margin: 0;
}
.pct {
  font-variant-numeric: tabular-nums;
  color: var(--accent);
  font-weight: 600;
}
.slider {
  width: 100%;
  margin-top: 0.3rem;
  accent-color: var(--accent);
}
.help {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  padding: 0.5rem 0.8rem;
  font-size: 0.9rem;
}
.help summary {
  cursor: pointer;
  color: var(--accent);
  font-weight: 600;
}
.help ol,
.help ul {
  margin: 0.5rem 0 0;
  padding-inline-start: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.help-sub {
  margin: 0.8rem 0 0;
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
