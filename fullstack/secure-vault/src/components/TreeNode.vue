<script setup>
// Recursive component: renders one row, then renders itself for each child while open.
import Icon from './Icon.vue'
import { useVault } from '../useVault'
const props = defineProps({ node: { type: Object, required: true }, depth: { type: Number, default: 0 } })
const v = useVault()
const isFolder = !!props.node.children
</script>

<template>
  <li v-if="v.isVisible(node)" role="none">
    <div
      class="row" role="treeitem"
      :data-id="node.id"
      :tabindex="v.state.focusedId === node.id ? 0 : -1"
      :aria-level="depth + 1"
      :aria-expanded="isFolder ? v.isOpen(node) : undefined"
      :aria-selected="!isFolder ? v.state.selectedId === node.id : undefined"
      :class="{ open: v.isOpen(node), selected: v.state.selectedId === node.id, folder: isFolder }"
      :style="{ paddingLeft: 8 + depth * 16 + 'px' }"
      @click="v.activate(node)"
      @focus="v.state.focusedId = node.id"
    >
      <span class="chev" :class="{ hidden: !isFolder }"><Icon name="chevron" /></span>
      <span class="kind"><Icon :name="isFolder ? 'folder' : 'file'" /></span>
      <span class="name">
        <template v-for="(p, i) in v.parts(node.name)" :key="i">
          <mark v-if="p.m">{{ p.t }}</mark><template v-else>{{ p.t }}</template>
        </template>
      </span>
      <span class="meta">{{ v.meta(node) }}</span>
    </div>
    <ul v-if="isFolder && v.isOpen(node)" role="group">
      <TreeNode v-for="c in node.children" :key="c.id" :node="c" :depth="depth + 1" />
    </ul>
  </li>
</template>
