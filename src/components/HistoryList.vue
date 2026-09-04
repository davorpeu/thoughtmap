<script setup>
import { formatDateTime, formatDDMMYYYY } from '../utils.js'
import { t, tEmotion } from '../i18n.js'

defineProps({
  entries: { type: Array, default: () => [] },
})
defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="history">
    <p v-if="!entries.length" class="empty">
      {{ t('noEntries') }}
    </p>

    <article v-for="entry in entries" :key="entry.id" class="card">
      <header class="card-head">
        <div class="dates">
          <span class="dd">{{ formatDDMMYYYY(entry.createdAt) }}</span>
          <span class="dt">{{ formatDateTime(entry.createdAt) }}</span>
        </div>
        <div class="card-actions">
          <button class="icon" @click="$emit('edit', entry)" aria-label="Edit">✎</button>
          <button class="icon danger" @click="$emit('delete', entry)" aria-label="Delete">
            🗑
          </button>
        </div>
      </header>

      <div v-if="entry.situation" class="block">
        <span class="block-label">{{ t('situation') }}</span>
        <p>{{ entry.situation }}</p>
      </div>
      <div v-if="entry.thought" class="block">
        <span class="block-label">{{ t('thought') }}</span>
        <p>{{ entry.thought }}</p>
      </div>

      <div v-if="entry.emotions.length" class="emotions">
        <span
          v-for="e in [...entry.emotions].sort((a, b) => b.intensity - a.intensity)"
          :key="e.name"
          class="etag"
        >
          {{ tEmotion(e.name) }} <b>{{ e.intensity }}%</b>
        </span>
      </div>
    </article>
  </div>
</template>

<style scoped>
.history {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}
.empty {
  color: var(--muted);
  text-align: center;
  padding: 2rem 1rem;
}
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}
.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.dates {
  display: flex;
  flex-direction: column;
}
.dd {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.dt {
  font-size: 0.8rem;
  color: var(--muted);
}
.card-actions {
  display: flex;
  gap: 0.3rem;
}
.icon {
  background: var(--surface-2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 0.6rem;
  width: 2.2rem;
  height: 2.2rem;
  font-size: 1rem;
  cursor: pointer;
}
.icon.danger:active {
  background: #7f1d1d;
}
.block {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.block-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted);
  font-weight: 600;
}
.block p {
  margin: 0;
  white-space: pre-wrap;
}
.emotions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.etag {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 0.25rem 0.7rem;
  font-size: 0.85rem;
}
.etag b {
  color: var(--accent);
}
</style>
