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

    <div class="d-none d-md-flex flex-1-1 mb-1 ga-3 justify-end align-center">
      <div class="d-flex align-center">
        <v-icon>mdi-currency-usd</v-icon>
        <v-btn append-icon="mdi-chevron-down">USD</v-btn>
      </div>

      <router-link v-if="!state.data?.email" to="/login">
        <v-btn variant="outlined" color="primary">Log In</v-btn>
      </router-link>
      <div v-else>
        <v-menu v-if="lgAndUp">
          <template #activator="{ props }">
            <v-btn variant="outlined" v-bind="props">
              {{ state.data.email }}<v-icon>mdi-chevron-down</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item v-for="(item, index) in logInMenuItems" :key="index" :value="index" @click="itemAction(item)">
              <v-list-item-title><v-icon>{{ item.icon }}</v-icon> {{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
        <v-menu v-if="mdAndDown">
          <template #activator="{ props }">
            <v-btn variant="outlined" density="comfortable" icon="mdi-account" v-bind="props">
            </v-btn>
          </template>

          <v-list>
            <v-list-item v-for="(item, index) in logInMenuItems" :key="index" :value="index" @click="itemAction(item)">
              <v-list-item-title><v-icon>{{ item.icon }}</v-icon> {{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <div class="d-flex d-md-none">
      <v-btn icon="mdi-account"></v-btn>
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
import { useEventBus } from '@vueuse/core';
import { ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import * as Auth from '@/use/auth';

const { smAndUp, smAndDown, mdAndUp, lgAndUp, mdAndDown } = useDisplay();

const { state, fetching } = Auth;

const { emit } = useEventBus<{ text: string }>('showSnackbar');

type MenuItem = {
  title: string;
  icon: string;
  action?: () => void;
};

const logOut = () => {
  Auth.apply(Auth.Mutations.logout);
  emit({ text: 'Logged out' });
};

const logInMenuItems = ref([
  { title: 'Profile', icon: 'mdi-account' },
  { title: 'Settings', icon: 'mdi-cog' },
  { title: 'Log Out', icon: 'mdi-logout', action: logOut },
]);

const itemAction = (item: MenuItem) => {
  if (item.action) {
    item.action();
  } else {
    console.error('No action defined for ', item);
  }
}

watch(state, (newVal) => {
  console.log('new State', newVal);
})
</script>
