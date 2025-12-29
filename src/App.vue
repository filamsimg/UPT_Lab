<template>
  <!-- Root app: render router dan AppShell -->
  <div>
    <router-view v-slot="{ Component, route }">
      <component
        v-if="standaloneLayouts.includes(route.meta?.layout)"
        :is="Component"
        :key="route.fullPath"
      />
            <AppShell
              v-else
            >
        <component :is="Component" :key="route.fullPath" />
      </AppShell>
    </router-view>
  </div>
</template>

<script setup>
import AppShell from '@/components/layout/AppShell.vue'

const standaloneLayouts = ['auth', 'print', 'public']
</script>


