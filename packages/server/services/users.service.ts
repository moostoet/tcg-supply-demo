import { Service, ServiceSchema } from "moleculer";
import { DbAdapter, DbServiceSettings, MoleculerDbMethods } from "moleculer-db";
import { connect, connection } from "mongoose";
import MongoDbAdapter from "moleculer-db-adapter-mongo";
import type { DbServiceMethods } from "../mixins/db.mixin";
import { omit } from "ramda";
import { find } from "../actions/user/find";
import { get } from "../actions/user/get";
import { Env } from '../lib/env';
import { create } from "../actions/user/create";

export type UserEntity = {
    id: string;
    email: string;
    password: string;
}

export type UserEntitySafe = Omit<UserEntity, "password">;

interface UserSettings extends DbServiceSettings {
    indexes?: Record<string, number>[];
}

interface UsersThis extends Service<UserSettings>, MoleculerDbMethods {
    adapter: DbAdapter | MongoDbAdapter;
}

const UsersService: ServiceSchema<UserSettings> & { methods: DbServiceMethods } = {
    name: "users",

    settings: {
        fields: ["id", "email", "password"],

        entityValidator: {
            email: "email",
            password: "string|min:8",
        },

        indexes: [{ email: 1 }],
    },

    hooks: {
        after: {
            '*': (ctx, res) => {
                if (ctx.meta.includePassword) {
                    return res;
                }
                return omit(['password'])(res);
            }
        }
    },

    actions: {
        find,
        get,
        create
    },

    methods: {
    },

    async started() {
        console.log('started');
        if (Env.MONGO_URI) connect(Env.MONGO_URI).
            catch(error => console.error(error));

        connection.on('connected', () => console.log(`${this.name} connected`));
    }
}

export default UsersService;

