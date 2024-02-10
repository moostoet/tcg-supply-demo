import { ServiceSchema } from "moleculer";
import { connect, connection } from "mongoose";
import { authenticate } from "../actions/auth/authenticate";
import { login } from "../actions/auth/login";
import { register } from "../actions/auth/register";

const AuthService: ServiceSchema = {
    name: "auth",

    dependencies: [
        'users'
    ],

    settings: {
        routes: []
    },

    actions: {
        authenticate,
        login,
        register,
    },

    methods: {},

    async started() {
        if (process.env.MONGO_URI) connect(process.env.MONGO_URI)
            .catch(error => console.error(error))

        connection.on('connected', () => console.log(`${this.name} connected`))
    }
}

export default AuthService;