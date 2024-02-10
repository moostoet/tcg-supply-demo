import { useApi } from "@/use/api";
import { createUserRequestS, createUserResponseS } from "../../../../shared/schemas/user/register";

export const useRegisterUser = () => {
    const { state, exec, isFetching } = useApi('/register', createUserRequestS, createUserResponseS, 'POST')
    return { registerUser: exec, data: state, isFetching }
}