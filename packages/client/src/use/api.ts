import { createFetch, get, set } from "@vueuse/core";
import { reactive, ref } from "vue";
import { ZodTypeAny, z } from "zod";
import { isNotNil } from "ramda";


const APIErrorS = z.object({
    code: z.number(),
    message: z.string(),
    type: z.string(),
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

export const useApi = <RequestSchema extends ZodTypeAny, ResponseSchema extends ZodTypeAny>
    (path: string, requestSchema: RequestSchema, responseSchema: ResponseSchema,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
        additionalOptions?: FetchOptions) => {
    type RequestSchemaType = z.infer<typeof requestSchema>;
    type ResponseSchemaType = z.infer<typeof responseSchema>;
    const body = ref<RequestSchemaType | undefined>(undefined);

    const { data, error, execute, isFetching } = useAPIFetch(path, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        ...additionalOptions,
    }, {
        beforeFetch({ options }) {
            if (body.value) {
                options.body = JSON.stringify(body.value)
            }

            return { options };
        }
    }).json();

    const state: Response<ResponseSchemaType> = reactive({
        data: undefined,
        error: undefined,
    });

    const setErrorState = (error: APIError) => {
        state.data = undefined
        state.error = error
    }

    const setDataState = (data: ResponseSchemaType) => {
        state.data = data
        state.error = undefined
    }

    const exec = async (requestBody?: RequestSchemaType) => {

        console.log("REQUEST BODY IS: ", requestBody);

        if (requestBody) set(body, requestBody);

        await execute();

        return isNotNil(get(error)) ? setErrorState(APIErrorS.parse(data.value)) : setDataState(responseSchema.parse(data.value));
    }

    return { exec, state, isFetching }
}