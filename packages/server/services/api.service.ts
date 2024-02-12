import { promisify } from "node:util"
import BetterSqlite3 from "better-sqlite3";
import express from 'express';
import session from "express-session";
import type { Context, ServiceSchema } from "moleculer";
import type { ApiSettingsSchema, GatewayResponse, IncomingRequest, Route } from "moleculer-web";
import apiGateway from "moleculer-web";
import passport from "passport";
import { isNil, pipe, prop, when } from "ramda";
import { setupPassportLocalStrategy } from "../passport/passport";
import { Server } from 'node:http';
const betterSQLiteStore = require('better-sqlite3-session-store')(session);

const respondTo = (res: GatewayResponse) => (status: number) => (body: Record<keyof any, any>) => {
	console.log("RESPONDING WITH: ", body);
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end('ok');
	//res.write(JSON.stringify(body))
}

interface Meta {
	userAgent?: string | null;
	user?: object | null;
}

const ApiService: ServiceSchema<ApiSettingsSchema> = {
	name: "api",
	mixins: [apiGateway],

	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		server: false,
		// Global Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
		use: [

		],

		cors: {
			origin: ["http://localhost:3000"],
			methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
			exposedHeaders: [],
			maxAge: 3600,
		},

		routes: [
			{
				path: "/",

				whitelist: [
					"auth.register",
					"auth.login"
				],

				// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
				use: [],

				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: true,

				// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
				authentication: false,

				// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
				authorization: false,

				// The auto-alias feature allows you to declare your route alias directly in your services.
				// The gateway will dynamically build the full routes from service schema.
				autoAliases: false,

				aliases: {
					'POST auth/login': [
						passport.authenticate("local"),
						"auth.login"
					],
					'POST auth/logout': async (req: Express.Request, res: GatewayResponse) => [
						passport.authenticate("local"),
						req.logout(() => respondTo(res)(200)({ message: 'OK' }))
					],
					'POST auth/register': 'auth.register'
				},
				/**
				 * Before call hook. You can check the request.
				 *
				onBeforeCall(
					ctx: Context<unknown, Meta>,
					route: Route,
					req: IncomingRequest,
					res: GatewayResponse,
				): void {
					// Set request headers to context meta
					ctx.meta.userAgent = req.headers["user-agent"];
				}, */

				/**
				 * After call hook. You can modify the data.
				 *
				onAfterCall(
					ctx: Context,
					route: Route,
					req: IncomingRequest,
					res: GatewayResponse,
					data: unknown,
				): unknown {
					// Async function which return with Promise
					// return this.doSomething(ctx, res, data);
					return data;
				}, */

				// Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
				callOptions: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: "1MB",
					},
					urlencoded: {
						extended: true,
						limit: "1MB",
					},
				},

				// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
				mappingPolicy: "all", // Available values: "all", "restrict"

				// Enable/disable logging
				logging: true,
			},
			{
				path: "/api",

				whitelist: [
					"users.*",
				],

				use: [
					passport.authenticate("local"),
				],

				mergeParams: true,

				autoAliases: true,

				aliases: {
					"GET users/sup": (req, res) => res.end('ok'),
					"GET users/me" : (req: Express.Request, res: GatewayResponse) => respondTo(res)(200)({ message: 'ok' }) /*pipe(
						prop('user'),
						when(isNil, () => {
							throw new Error('Unauthorized')
						}),
						respondTo(res)(200)
					)(req),*/

				},

				onError(req, res, err) {
					res.setHeader("Content-Type", "application/json; charset=utf-8");
					res.writeHead(500);
					 /*
					  *TODO: Moos, please don't send the error directly.
					  * Write an error pipeline. Yes. Cond is a good choice here.
					  */
					res.end(JSON.stringify(err));
				},

			mappingPolicy: "all", // Available values: "all", "restrict"

			// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
			authentication: false,

			// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
			authorization: false,

			callOptions: {},

			bodyParsers: {
				json: {
					strict: false,
					limit: "1MB",
				},
				urlencoded: {
					extended: true,
					limit: "1MB",
				},
			},

			logging: true,
		}],

		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: null,
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,

		// Serve assets from "public" folder. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Serve-static-files
		assets: {
			folder: "public",

			// Options to `server-static` module
			options: {},
		},
	},

	dependencies: [
		'auth',
		'users'
	],

	methods: {
		/**
		 * Authenticate the request. It check the `Authorization` token value in the request header.
		 * Check the token value & resolve the user by the token.
		 * The resolved user will be available in `ctx.meta.user`
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 */
		authenticate(
			ctx: Context,
			route: Route,
			req: IncomingRequest,
		): Record<string, unknown> | null {
			// Read the token from header
			const auth = req.headers.authorization;

			if (auth && auth.startsWith("Bearer")) {
				const token = auth.slice(7);

				// Check the token. Tip: call a service which verify the token. E.g. `accounts.resolveToken`
				if (token === "123456") {
					// Returns the resolved user. It will be set to the `ctx.meta.user`
					return { id: 1, name: "John Doe" };
				}
				// Invalid token
				throw new apiGateway.Errors.UnAuthorizedError(
					apiGateway.Errors.ERR_INVALID_TOKEN,
					null,
				);
			} else {
				// No token. Throw an error or do nothing if anonymous access is allowed.
				// throw new E.UnAuthorizedError(E.ERR_NO_TOKEN);
				return null;
			}
		},

		/**
		 * Authorize the request. Check that the authenticated user has right to access the resource.
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 */
		authorize(ctx: Context<null, Meta>, route: Route, req: IncomingRequest) {
			// Get the authenticated user.
			const { user } = ctx.meta;

			// It check the `auth` property in action schema.
			if (req.$action.auth === "required" && !user) {
				throw new apiGateway.Errors.UnAuthorizedError("NO_RIGHTS", null);
			}
		},
	},

	async created () {
		this.logger.info('Created');
		const db = new BetterSqlite3('session.db', { verbose: console.log });

		setupPassportLocalStrategy(this.broker, passport);
		const app = express()
		app.use(session({
			secret: process.env.COOKIE_SECRET ?? "supersecret",
			resave: false,
			saveUninitialized: false,
			store: new betterSQLiteStore({
				client: db,
				expired: {
					clear: true,
					interval: 60 * 60 * 1000,
				}
			}),
			cookie: {
				httpOnly: true,
				maxAge: 24 * 60 * 60 * 1000,
			}
		}))

		app.use(
			passport.initialize(),
			passport.session(),
		)
		app.use(this.express())

		this.server = app.listen(8080)

	},
	stopped () {
		(this.server as Server).close()
	}
};

export default ApiService;
