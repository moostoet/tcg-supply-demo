<template>
  <v-app-bar flat class="d-flex justify-space-between px-16">
    <v-app-bar-nav-icon class="hidden-md-and-up"></v-app-bar-nav-icon>

    <div :class="{ 'justify-start': mdAndUp, 'justify-center': smAndDown }"
      class="d-flex align-center flex-grow-1 font-weight-bold text-h5">
      <!-- Flex-grow-1 ensures it takes available space -->
      <v-icon>mdi-circle-slice-4</v-icon> TCGSupply
    </div>

    <v-row class="ml-3 hidden-sm-and-down justify-center">
      <v-btn> Explore </v-btn>
      <v-btn> Sets </v-btn>
      <v-btn> Stock </v-btn>
      <v-btn> Showcase </v-btn>
      <v-btn> Auctions </v-btn>
    </v-row>
    <div class="v-app-bar-nav-icon hidden-md-and-up" style="visibility: hidden"></div>

    <div class="d-none d-md-flex flex-1-1 mb-1 ga-3 justify-end">
      <div class="d-flex align-center">
        <v-icon>mdi-currency-usd</v-icon>
        <v-btn append-icon="mdi-chevron-down">USD</v-btn>
      </div>
      <router-link to="/login">
        <v-btn variant="outlined" color="primary">Log In</v-btn>
      </router-link>
    </div>

    <div class="d-flex d-md-none">
      <v-btn icon="mdi-login"></v-btn>
    </div>
  </v-app-bar>
  <v-app-bar flat class="d-flex px-16 bg-blue-darken-3">
    <v-btn append-icon="mdi-chevron-right" prepend-icon="mdi-cards">{{ smAndUp ? 'Products' : '' }}</v-btn>
    <v-text-field class="h-50 mb-1" color="white" bg-color="white" density="compact" prepend-inner-icon="mdi-magnify"
      variant="outlined" placeholder="Search TCGSupply..." clearable>
    </v-text-field>
  </v-app-bar>
</template>

<script lang="ts" setup>
import { useDisplay } from 'vuetify';

const { smAndUp, smAndDown, mdAndUp } = useDisplay();
</script>
