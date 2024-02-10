<template>
  <v-app :style="{ background: backgroundColor }">
    <default-bar v-if="!isLoginOrRegister" />

    <default-view />
    <v-snackbar v-model="showSnackbar" :timeout="2000" color="blue-darken-2">
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import DefaultBar from './AppBar.vue'
import DefaultView from './View.vue'
import { useRouter } from 'vue-router';
import { useBackgroundColor } from '@/use/backgroundColor';
import { useEventBus } from '@vueuse/core';

const { on } = useEventBus<{text: string}>('showSnackbar');

const showSnackbar = ref(false);
const snackbarText = ref('');

on(event => {
  showSnackbar.value = true;
  snackbarText.value = event.text;
});

const { currentRoute } = useRouter();
const { backgroundColor } = useBackgroundColor();

const isLoginOrRegister = computed(() => {
  const name = currentRoute.value.name;
  return name === 'Login' || name === 'Register';
});



</script>
