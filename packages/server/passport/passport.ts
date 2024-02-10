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
            return done(new UserNotFoundError());
        }

        return done(null, foundUser);
    })
}