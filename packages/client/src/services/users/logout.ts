import { useApi } from "@/use/api"
import { logoutRequestS } from "../../../../shared/schemas/user/logout";

export const useLogout = () => {
    const { state, exec, isFetching } = useApi('auth', '/logout', logoutRequestS, undefined, 'POST', 
    { credentials: 'include' });

    return { logout: exec, data: state, isFetching }
}