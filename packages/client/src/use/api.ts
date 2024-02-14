import { createFetch, get, set } from "@vueuse/core";
import { reactive, ref } from "vue";
import { ZodTypeAny, z } from "zod";
import { isNotNil } from "ramda";


const APIErrorS = z.object({
    code: z.number(),
    type: z.string(),
    retryable: z.boolean(),
})

export type APIError = z.infer<typeof APIErrorS>

type Response<T> = {
    data?: T;
    error?: APIError;
};

type FetchOptions = {
    credentials?: 'include' | 'same-origin' | 'omit',
}

export const useAPIFetch = createFetch({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    fetchOptions: {
        mode: 'cors',
    },
    options: {
        immediate: false,
        updateDataOnError: true,
    },
});

export const useApi = <RequestSchema extends ZodTypeAny = ZodTypeAny, ResponseSchema extends ZodTypeAny = ZodTypeAny>(
    type: 'api' | 'auth',
    path: string,
    responseSchema: ResponseSchema,
    requestSchema?: RequestSchema,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    additionalOptions?: FetchOptions
) => {
    type RequestSchemaType = RequestSchema extends ZodTypeAny ? z.infer<RequestSchema> : any;
    type ResponseSchemaType = ResponseSchema extends ZodTypeAny ? z.infer<ResponseSchema> : any;
    const body = ref<RequestSchemaType | undefined>(undefined);

    const fullPath = `${type}${path}`;

    const { data, error, execute, isFetching } = useAPIFetch(fullPath, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        ...additionalOptions,
    }, {
        beforeFetch({ options }) {
            if (body.value && requestSchema) {
                options.body = JSON.stringify(requestSchema.parse(body.value));
            } else if (body.value) {
                options.body = JSON.stringify(body.value);
            }

            return { options };
        }
    }).json();

    const state: Response<ResponseSchemaType> = reactive({
        data: undefined,
        error: undefined,
    });

    const setErrorState = (error: APIError) => {
        state.data = undefined;
        state.error = error;
    };

    const setDataState = (data: ResponseSchemaType) => {
        state.data = data;
        state.error = undefined;
    };

    const exec = async (requestBody?: RequestSchemaType) => {
        if (requestBody) {
            body.value = requestBody;
        }

        await execute();

        return isNotNil(get(error)) ? setErrorState(APIErrorS.parse(data.value)) : setDataState(responseSchema.parse(data.value));
    };

    return { exec, state, isFetching };
};