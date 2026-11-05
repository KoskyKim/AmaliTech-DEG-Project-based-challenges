<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Icon from './components/Icon.vue'
import TreeNode from './components/TreeNode.vue'
import QuickList from './components/QuickList.vue'
import PropertiesPanel from './components/PropertiesPanel.vue'
import { useVault } from './useVault'

const v = useVault()
const search = ref(null)
const toTree = () => v.activeId.value && v.focus(v.activeId.value)
const hints = [['↑ ↓', 'Navigate'], ['→', 'Expand'], ['←', 'Collapse'], ['Enter', 'Select'], ['P', 'Pin'], ['/', 'Search']]

function onGlobal(e) {
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault(); search.value?.focus()
  }
}
onMounted(() => window.addEventListener('keydown', onGlobal))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobal))
</script>

<template>
  <div class="app">
    <header class="topbar">
      <Icon name="shield" :size="20" class="logo" />
      <strong>SecureVault</strong>
      <span class="sep" /><span class="mono muted">ENTERPRISE VAULT</span>
      <span class="grow" />
      <span class="pill"><i class="dot" /> AES-256 · ENCRYPTED</span>
    </header>

    <div class="body">
      <aside class="explorer">
        <div class="explorer-head mono muted">
          <span>EXPLORER</span>
          <span v-if="v.state.query">{{ v.matchCount.value }} MATCHES</span>
        </div>
        <label class="search">
          <Icon name="search" />
          <input ref="search" v-model="v.state.query" type="text" placeholder="Search vault…"
                  aria-label="Search vault" @keydown.esc="v.state.query = ''" @keydown.down.prevent="toTree" />
          <kbd v-if="!v.state.query">/</kbd>
        </label>

        <template v-if="!v.state.query">
          <QuickList title="PINNED" icon="pin" :ids="v.state.pinned" :max="v.MAX_PINNED" />
          <QuickList title="RECENT" icon="clock" :ids="v.state.recent" />
        </template>

        <ul class="tree" role="tree" aria-label="Vault files" @keydown="v.onKey">
          <TreeNode v-for="n in v.data" :key="n.id" :node="n" />
        </ul>
        <p v-if="v.state.query && !v.rows.value.length" class="no-results">
          No files match “{{ v.state.query }}”. Try a shorter name.
        </p>
      </aside>
      <PropertiesPanel />
    </div>

    <footer class="statusbar">
      <span v-for="[k, l] in hints" :key="k" class="hint"><kbd>{{ k }}</kbd>{{ l }}</span>
      <span class="grow" />
      <span class="mono muted">{{ v.rows.value.length }} ITEMS VISIBLE</span>
    </footer>
  </div>
</template>
