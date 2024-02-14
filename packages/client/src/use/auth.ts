import { ref, computed, ComputedRef } from 'vue';
import { useLogin } from '../services/users/login';
import { LoginUserRequest, LoginUserResponse, loginUserResponseS } from '../../../shared/schemas/user/login';
import { useLogout } from '../services/users/logout';
import { createFetch, get, set } from '@vueuse/core';
import { T, __, always, applyTo, assoc, call, cond, converge, find, has, identity, ifElse, includes, isNotNil, map, pathEq, pipe, prop, propSatisfies, tap, unless, when } from 'ramda';
import { APIError, APIErrorS } from '../../../shared/schemas/error';

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

const toDataOrErrorRes: (res: unknown) => APIError | LoginUserResponse | null = pipe(
  (res: unknown) => map(fn => fn(res), [APIErrorS.safeParse, loginUserResponseS.safeParse]),
  find(prop('success')),
  (e) => e?.success ? e.data : null
)

type State = LoginUserResponse | APIError | null;

export const state = computed<State>(() => pipe(
    prop('value'),
    toDataOrErrorRes,
    tap(console.log),
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
