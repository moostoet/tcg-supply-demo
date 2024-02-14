import { useApi } from "@/use/api";
import { loginUserRequestS, loginUserResponseS } from "../../../../shared/schemas/user/login";

export const useLogin = () => {
    const { state, exec, isFetching } = useApi('auth', '/login', loginUserResponseS, loginUserRequestS,
        'POST', { credentials: 'include' })
    return { login: exec, data: state, isFetching }
}