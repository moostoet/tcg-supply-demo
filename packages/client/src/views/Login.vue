<template>
    <v-container class="fill-height">
        <v-responsive class="align-center fill-height" color="primary">
            <div class="">
                <div class="text-white font-weight-bold text-h4 d-flex flex-row ga-3 justify-center align-center">
                    <v-icon>mdi-circle-slice-4</v-icon>
                    <p>TCGSupply</p>
                </div>
                <v-card class="mx-auto pa-8 d-flex flex-column ga-3 mt-3" max-width="448">
                    <p class="font-weight-bold text-h5">Sign in to your account</p>

                    <v-alert v-show="Auth.state.value.error" type="error" :text="errorMessage">
                    </v-alert>
                    <v-form @submit.prevent="onSubmit" ref="formRef">
                        <div>
                            <div class="text-subtitle-1 text-medium-emphasis mt-3">E-mail</div>
                            <v-text-field v-model="form.email" :rules="emailRules" variant="outlined"
                                prepend-inner-icon="mdi-email" placeholder="E-mail address">
                            </v-text-field>
                        </div>


                        <div>
                            <div class="text-subtitle-1 text-medium-emphasis">Password</div>
                            <v-text-field v-model="form.password" :rules="passwordRules" variant="outlined"
                                prepend-inner-icon="mdi-lock" placeholder="Password"
                                @click:append-inner="visible = !visible" :type="visible ? 'text' : 'password'"
                                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'">
                            </v-text-field>
                        </div>

                        <div class="d-flex items-center justify-space-between">
                            <p></p>
                            <a class="text-caption text-decoration-none text-blue mt-n5">Forgot password?</a>
                        </div>

                        <v-btn block class="mt-3" variant="outlined" type="submit" :loading="Auth.fetching.value">Sign in</v-btn>
                    </v-form>

                    <p class="text-caption">No account yet? <router-link to="/register"
                            class="text-blue font-weight-bold">Register
                            now.</router-link></p>
                </v-card>
            </div>
        </v-responsive>
    </v-container>
</template>

<script setup lang="ts">
import router from '@/router';
import { get, useEventBus } from '@vueuse/core';
import { computed, reactive, ref, watch } from 'vue';
import * as Auth from "../use/auth";

const { emit } = useEventBus<{ text: string }>('showSnackbar');

const formRef = ref();

const visible = ref(false);

const form = reactive({
    email: '',
    password: ''
});

const errorMessage = computed(() => {
    switch (get(Auth.state).error?.code) {
        case 422:
            return 'The e-mail address you have entered is already in use.';
        default:
            return 'Something went wrong. Please check your credentials and try again.';
    }
})

const emailRules = [
    (v: string) => !!v || 'E-mail is required',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
];

const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 8 || 'Password must be at least 8 characters'
];

const onSubmit = async () => {
    const { valid } = await formRef.value.validate();

    if (!valid) return;

    const formData = {
        email: form.email,
        password: form.password
    }

    Auth.apply(Auth.Mutations.login, formData);

    formRef.value.reset();
}

watch(Auth.state, (newState) => {
    console.log(newState);
    if (newState.data.email) {
        emit({ text: 'You have successfully logged in.' });
        router.push('/');
    }
})

</script>