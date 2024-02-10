<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <p>{{ data }}</p>
    </v-responsive>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const data = ref('Hello World');


onMounted(() => {
})

</script>
