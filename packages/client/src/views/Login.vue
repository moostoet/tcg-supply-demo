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

                    <v-alert v-show="data.error" type="error"
                        :text="errorMessage">
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

                        <v-btn block class="mt-3" variant="outlined" type="submit" :loading="isFetching">Sign in</v-btn>
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
import { useLogin } from '@/services/users/login';
import { useEventBus } from '@vueuse/core';
import { computed, reactive, ref, watch } from 'vue';

const { emit } = useEventBus<{text: string}>('showSnackbar');

const { login, data, isFetching } = useLogin();

const formRef = ref();

const visible = ref(false);

const form = reactive({
    email: '',
    password: ''
});

const errorMessage = computed(() => {
    switch(data.error?.code) {
        case 422:
            return 'The e-mail address you have entered is already in use.';
        default:
            return 'Something went wrong during the creation of your account. Please try again later.';
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

    await login(formData);

    if (data.data?.email) {
        console.log("Emitting...");
        emit({ text: 'Logged in successfully' });
        router.push('/');
    }

    formRef.value.reset();
}

watch(data, (newData) => {
    console.log(newData);
})

</script>