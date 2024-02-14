import { useApi } from "@/use/api";
import { getMeResponseS } from "../../../../shared/schemas/user/me";

export const useAuthenticate = () => {
    const { state, exec, isFetching } = useApi('api', '/users/me', getMeResponseS, undefined,
        'GET', { credentials: 'include' })
    return { authenticate: exec, data: state, isFetching }
}