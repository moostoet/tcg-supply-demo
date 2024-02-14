import { ref, computed } from 'vue';
import { useLogin } from '../services/users/login';
import { LoginUserRequest, LoginUserResponse, loginUserResponseS } from '../../../shared/schemas/user/login';
import { useLogout } from '../services/users/logout';
import { createFetch, get, set } from '@vueuse/core';
import { T, always, assoc, cond, find, has, identity, ifElse, includes, isNotNil, pathEq, pipe, prop, propSatisfies, tap, unless, when } from 'ramda';
import { APIError, APIErrorS } from './api';

export const Mutations = Object.freeze({
    logout: 'auth/logout',
    login: 'auth/login',
    register: 'auth/register',
    init: 'api/users/me'
});

const creds = ref<LoginUserRequest | undefined>(undefined);

type AuthMutation = typeof Mutations[keyof typeof Mutations];

export const useAuthFetch = createFetch({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    fetchOptions: {
        mode: 'cors',
        credentials: 'include',
    },
    options: {
        immediate: true,
        refetch: true,
        updateDataOnError: true,
    },
});

const url = ref<string>(Mutations.init);

const { data, error, execute, isFetching } = useAuthFetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
}, {
    beforeFetch(ctx) {
        console.log('beforeFetch', ctx);
        when(
            includes('/me'),
            () => ctx.options.method = 'GET'
        )(ctx.url);

        unless(
            includes('/me'),
            () => ctx.options.body = JSON.stringify(creds.value)
        )(ctx.url);

        return ctx;
    },
}).json();

const propIsNotNil = propSatisfies(isNotNil);

// handleResponse should run logic e.g. setErrorState/setDataState based on which prop is available
// this should be done using zod parsing (schema.parse). look at: https://github.com/causaly/zod-validation-error

const dataOfSuccessElement = pipe(
    find(prop('success')),
    prop('data')
);

const transformResponse = (response: LoginUserResponse) => cond([
    [has('error'), identity],
    [T, (resp) => ({
        data: resp,
        error: undefined
    })]
])(response);

const handleAuthResponse = ifElse(
    propIsNotNil('error'),
    prop('error'),
    cond([
        [isNotNil, pipe(
            transformResponse,
        )],
        [T, always({ data: undefined, error: undefined })]
    ])
);

export const state = computed(() => pipe(
    prop('value'),
    handleAuthResponse,
)(data))

export const fetching = computed(() => get(isFetching));

type Mutation = typeof Mutations[keyof typeof Mutations]
type MutationsWithCredentials = typeof Mutations['login' | 'register']
type MutationsWithoutCreds = Exclude<Mutation, MutationsWithCredentials>

export function apply(mut: MutationsWithoutCreds): void;
export function apply(mut: MutationsWithCredentials, credentials: LoginUserRequest): void;
export function apply(mut: Mutation, credentials?: LoginUserRequest) {
    console.log('apply ', mut, credentials);
    if (credentials) set(creds, credentials);
    set(url, mut);
}