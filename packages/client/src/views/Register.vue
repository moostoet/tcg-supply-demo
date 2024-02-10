<template>
    <v-container class="fill-height">
        <v-responsive class="align-center fill-height" color="primary">
            <div class="">
                <div class="text-white font-weight-bold text-h4 d-flex flex-row ga-3 justify-center align-center">
                    <v-icon>mdi-circle-slice-4</v-icon>
                    <p>TCGSupply</p>
                </div>
                <v-card class="mx-auto pa-8 d-flex flex-column ga-3 mt-3" max-width="448">
                    <p class="font-weight-bold text-h5">Register a new account</p>

                    <v-alert v-show="data.data" type="success" text="Your account has successfully been registered.">
                    </v-alert>

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
                                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" prepend-inner-icon="mdi-lock"
                                placeholder="Password" :type="visible ? 'text' : 'password'"
                                @click:append-inner="visible = !visible">
                            </v-text-field>

                        </div>

                        <div>
                            <div class="text-subtitle-1 text-medium-emphasis">Confirm Password</div>
                            <v-text-field v-model="form.confirmPassword" :rules="confirmRules" variant="outlined"
                                :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'" prepend-inner-icon="mdi-lock"
                                placeholder="Password" :type="visible ? 'text' : 'password'"
                                @click:append-inner="visible = !visible">
                            </v-text-field>
                        </div>

                        <v-btn block class="mt-3" variant="outlined" type="submit" :loading="isFetching">Register</v-btn>
                    </v-form>

                    <p class="text-caption">Already have an account? <router-link class="text-blue font-weight-bold"
                            to="/login">Log in.</router-link></p>
                </v-card>
            </div>
        </v-responsive>
    </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRegisterUser } from '../services/users/register'

const { registerUser, data, isFetching } = useRegisterUser();

const formRef = ref();

const visible = ref(false);

const errorMessage = computed(() => {
    switch(data.error?.code) {
        case 422:
            return 'The e-mail address you have entered is already in use.';
        default:
            return 'Something went wrong during the creation of your account. Please try again later.';
    }
})

const form = reactive({
    email: '',
    password: '',
    confirmPassword: ''
});

const emailRules = [
    (v: string) => !!v || 'E-mail is required',
    (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
];

const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 8 || 'Password must be at least 8 characters'
];

const confirmRules = [
    (v: string) => !!v || 'Password confirmation is required',
    (v: string) => v === form.password || 'Passwords do not match'

]

const onSubmit = async () => {
    const { valid } = await formRef.value.validate();

    if (!valid) return;

    const formData = {
        email: form.email,
        password: form.password
    };

    await registerUser(formData);

    formRef.value.reset();
};

</script>