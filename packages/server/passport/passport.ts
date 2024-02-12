import { PassportStatic } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import Moleculer from "moleculer";
import { LoginUserResponse } from "../../shared/schemas/user/login";
import { GetUserResponse } from "../../shared/schemas/user/get";
import { UserNotFoundError } from "../lib/errors/UserNotFoundError";

export const setupPassportLocalStrategy = (broker: Moleculer.ServiceBroker, passport: PassportStatic) => {
    passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
    }, async (email, password, done) => {
        try {
            console.log("running local strategy");
            const loginSuccessful: LoginUserResponse | null = await broker.call("auth.login", { email, password });

            if (!loginSuccessful) {
                return done(null, false, { message: "Incorrect password" });
            }

            return done(null, loginSuccessful);
        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: any, done) => {
        const foundUser: GetUserResponse = await broker.call("users.get", { id });

        if (!foundUser) {
            console.log('I AM ERROR')
            return done(new UserNotFoundError());
        }

        return done(null, foundUser);
    })
}

const user = {
    email: 'ch@inmail.com',
    id: '123',
    password: 'secure'
}

const service = {
    get: (id: string) => {
        if (id !== user.id) throw new Error('Not Found')
        return structuredClone(user)
    },

    login(email: string, password: string) {
        if (email !== user.email) throw new Error('Not Found')
        if (password !== user.password) throw new Error('Wrong Password')
        return this.get(user.id)
    }
}

export const passportMinimalExample = (passport: PassportStatic) => {
    passport.use(new LocalStrategy((username, password, cb) => {
        console.log("USING LOCAL STRATEGY...")
        const user = service.get('123');

        if (!user) return cb("User Not Found");

        service.login(user.email, user.password);
    }));

    passport.serializeUser((user: any, cb) => {
        process.nextTick(() => {
            cb(null, { id: user.id, username: user.username });
        })
    })

    passport.deserializeUser((user: any, cb) => {
        process.nextTick(() => {
            return cb(null, user);
        })
    })
} 