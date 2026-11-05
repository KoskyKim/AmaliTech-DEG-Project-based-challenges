// Single shared store (module singleton): the tree is plain data, all UI state lives here.
import { reactive, computed, watch, nextTick } from 'vue'
import data from './data.json'

// ---- 1. Flat lookup index, built once: id -> { node, parent, path } ----
const index = new Map()
;(function walk(nodes, parent = null, path = []) {
  for (const n of nodes) {
    const p = [...path, n.name]
    index.set(n.id, { node: n, parent, path: p })
    if (n.children) walk(n.children, n.id, p)
  }
})(data)

const read = (k) => {
  try { return (JSON.parse(localStorage.getItem(k)) || []).filter((id) => index.has(id)) } catch { return [] }
}
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch {} }
const MAX_PINNED = 6

const state = reactive({
  expanded: new Set(),
  selectedId: null,
  focusedId: data[0].id,
  query: '',
  pinned: read('sv:pinned').slice(0, MAX_PINNED), // also trims lists saved before the cap existed
  recent: read('sv:recent'),
})
watch(() => state.pinned, (v) => write('sv:pinned', v), { deep: true })
watch(() => state.recent, (v) => write('sv:recent', v), { deep: true })

// ---- 2. Search: which ids stay visible, and which folders auto-expand ----
const q = computed(() => state.query.trim().toLowerCase())
const filter = computed(() => {
  if (!q.value) return null
  const show = new Set(), open = new Set()
  const visit = (n) => {
    const self = n.name.toLowerCase().includes(q.value)
    let child = false
    for (const c of n.children || []) if (visit(c)) child = true
    if (self || child) show.add(n.id)
    if (child) open.add(n.id)
    return self || child
  }
  data.forEach(visit)
  return { show, open }
})
const isVisible = (n) => !filter.value || filter.value.show.has(n.id)
const isOpen = (n) => !!n.children && (filter.value ? filter.value.open.has(n.id) : state.expanded.has(n.id))

// Visible rows in display order: used only for keyboard navigation.
const rows = computed(() => {
  const out = []
  const walk = (ns) => { for (const n of ns) { if (!isVisible(n)) continue; out.push(n); if (isOpen(n)) walk(n.children) } }
  walk(data)
  return out
})
const activeId = computed(() =>
  rows.value.some((n) => n.id === state.focusedId) ? state.focusedId : rows.value[0]?.id
)

// ---- 3. Actions ----
const nodeOf = (id) => index.get(id)?.node
function focus(id) {
  state.focusedId = id
  nextTick(() => document.querySelector(`[data-id="${id}"]`)?.focus())
}
function select(id) {
  state.selectedId = id
  state.recent = [id, ...state.recent.filter((x) => x !== id)].slice(0, 5)
}
function toggle(n) {
  if (filter.value) return // folders are forced open while filtering
  state.expanded.has(n.id) ? state.expanded.delete(n.id) : state.expanded.add(n.id)
}
function activate(n) {
  focus(n.id)
  n.type === 'file' ? select(n.id) : toggle(n)
}
function reveal(id) { // open every ancestor, then select + focus (used by Pinned / Recent)
  state.query = ''
  for (let p = index.get(id).parent; p; p = index.get(p).parent) state.expanded.add(p)
  select(id)
  focus(id)
}
const isPinned = (id) => state.pinned.includes(id)
const canPin = (id) => isPinned(id) || state.pinned.length < MAX_PINNED
function togglePin(id) {
  if (!canPin(id)) return // limit reached: unpinning is always allowed
  state.pinned = isPinned(id) ? state.pinned.filter((x) => x !== id) : [id, ...state.pinned]
}

function onKey(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  const list = rows.value
  const i = list.findIndex((n) => n.id === activeId.value)
  if (i < 0) return
  const n = list[i], open = isOpen(n)
  let handled = true
  switch (e.key) {
    case 'ArrowDown': focus(list[Math.min(i + 1, list.length - 1)].id); break
    case 'ArrowUp': focus(list[Math.max(i - 1, 0)].id); break
    case 'Home': focus(list[0].id); break
    case 'End': focus(list[list.length - 1].id); break
    case 'ArrowRight':
      if (n.children && !open) toggle(n)
      else if (open) { const c = n.children.find(isVisible); if (c) focus(c.id) }
      break
    case 'ArrowLeft':
      if (open && !filter.value) toggle(n)
      else { const p = index.get(n.id).parent; if (p) focus(p) }
      break
    case 'Enter': case ' ': activate(n); break
    case 'p': case 'P': if (n.type === 'file') togglePin(n.id); break
    default: handled = false
  }
  if (handled) e.preventDefault()
}

// ---- 4. Display helpers ----
const TYPES = { pdf: 'PDF Document', png: 'PNG Image', svg: 'SVG Image', docx: 'Word Document', xlsx: 'Excel Spreadsheet', txt: 'Text File', yaml: 'YAML Config', ttf: 'TrueType Font', gitignore: 'Git Ignore File' }
const fileType = (n) => TYPES[n.name.split('.').pop().toLowerCase()] || 'File'
const meta = (n) => n.type === 'file' ? n.size : n.children.length ? `${n.children.length} item${n.children.length > 1 ? 's' : ''}` : 'empty'
function parts(name) {
  if (!q.value) return [{ t: name, m: false }]
  const i = name.toLowerCase().indexOf(q.value)
  if (i < 0) return [{ t: name, m: false }]
  return [{ t: name.slice(0, i), m: false }, { t: name.slice(i, i + q.value.length), m: true }, { t: name.slice(i + q.value.length), m: false }]
}

export const useVault = () => ({
 data, state, rows, activeId, filter, nodeOf, isVisible, isOpen, activate, reveal, focus, select,
  onKey, isPinned, canPin, togglePin, MAX_PINNED, fileType, meta, parts,
  pathOf: (id) => index.get(id)?.path ?? [],
  matchCount: computed(() => (filter.value ? [...filter.value.show].filter((id) => index.get(id).node.type === 'file' || index.get(id).node.name.toLowerCase().includes(q.value)).length : 0)),
})
