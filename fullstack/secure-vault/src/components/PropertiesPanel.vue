<script setup>
import { computed } from 'vue'
import Icon from './Icon.vue'
import { useVault } from '../useVault'
const v = useVault()
const file = computed(() => v.nodeOf(v.state.selectedId))
</script>
<template>
  <section class="props" aria-live="polite" aria-label="Properties">
    <div v-if="!file" class="empty">
      <Icon name="shield" :size="28" />
      <h2>No file selected</h2>
      <p>Pick a file in the explorer to see its details. Use the arrow keys and press Enter.</p>
    </div>
    <template v-else>
      <header class="file-head">
        <span class="file-badge"><Icon name="file" :size="28" /></span>
        <div><h2>{{ file.name }}</h2><p>{{ v.pathOf(file.id).slice(0, -1).join(' / ') || 'Vault root' }}</p></div>
      </header>
      <h3 class="props-title">Properties</h3>
      <dl>
        <div><dt>Name</dt><dd>{{ file.name }}</dd></div>
        <div><dt>Type</dt><dd>{{ v.fileType(file) }}</dd></div>
        <div><dt>Size</dt><dd>{{ file.size }}</dd></div>
      </dl>
      <div class="actions">
        <button class="btn primary">Open file</button>
        <button class="btn" :disabled="!v.canPin(file.id)" @click="v.togglePin(file.id)">
          <Icon name="pin" :size="14" /> {{ v.isPinned(file.id) ? 'Unpin' : 'Pin file' }}
        </button>
      </div>
      <p v-if="!v.canPin(file.id)" class="limit" role="status">Pin limit reached ({{ v.MAX_PINNED }}). Unpin a file to pin another.</p>
    </template>
  </section>
</template>
