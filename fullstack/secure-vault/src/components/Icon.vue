<script setup>
defineProps({ name: String, size: { type: Number, default: 16 } })
const P = {
  chevron: 'M6 4l4 4-4 4',
  folder: 'M2 4.5A1.5 1.5 0 0 1 3.5 3h2.8l1.4 1.5h4.8A1.5 1.5 0 0 1 14 6v5.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5v-7Z',
  file: 'M4 2h5l3 3v8.5a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5ZM9 2v3h3',
  search: 'M11.5 7a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10.5 10.5L14 14',
  pin: 'M9.5 2.5l4 4M10.5 3.5l-3.2 3.2-3 .6 5.4 5.4.6-3 3.2-3.2M6 10l-3.5 3.5',
  clock: 'M13.5 8a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0ZM8 5v3l2 1.5',
  shield: 'M8 1.5l5 2v4c0 3-2.2 5.4-5 6.5-2.8-1.1-5-3.5-5-6.5v-4l5-2ZM6 8l1.5 1.5L10 6.5',
}
</script>
<template>
  <svg :width="size" :height="size" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="P[name]" /></svg>
</template>
