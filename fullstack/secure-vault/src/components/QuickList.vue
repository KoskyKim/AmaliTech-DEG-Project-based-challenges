<script setup>
import Icon from './Icon.vue'
import { useVault } from '../useVault'
defineProps({ title: String, icon: String, ids: Array })
const v = useVault()
</script>
<template>
  <section v-if="ids.length" class="quick">
    <h3><Icon :name="icon" :size="14" /> {{ title }}</h3>
    <ul>
      <li v-for="id in ids" :key="id">
        <button class="row quick-item" :class="{ selected: v.state.selectedId === id }" @click="v.reveal(id)">
          <span class="kind"><Icon name="file" /></span>
          <span class="name">{{ v.nodeOf(id).name }}</span>
          <span class="meta">{{ v.nodeOf(id).size }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>
