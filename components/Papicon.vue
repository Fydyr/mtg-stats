<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import * as PapiconsIcons from '../utils/papicons-icons.js'

const iconMap = new Map<string, (props: Record<string, any>) => any>()
for (const [key, val] of Object.entries(PapiconsIcons)) {
  if (typeof val === 'function') {
    iconMap.set(key, val as any)
    iconMap.set(key.toLowerCase(), val as any)
  }
}

const props = withDefaults(
  defineProps<{
    name: string
    size?: number | string
    color?: string
    opacity?: number | string
  }>(),
  {
    size: 18,
    color: 'currentColor',
    opacity: 1
  }
)

const attrs = useAttrs()

const vnode = computed(() => {
  const fn =
    iconMap.get(props.name) ||
    iconMap.get(props.name?.toLowerCase?.() || '') ||
    (PapiconsIcons as any).Placeholder
  if (!fn) return null
  return fn({
    size: Number(props.size) || props.size,
    color: props.color,
    opacity: Number(props.opacity),
    ...attrs
  })
})
</script>

<template>
  <component :is="() => vnode" class="papicon" />
</template>
