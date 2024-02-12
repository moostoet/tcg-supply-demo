import BetterSqlite3 from "better-sqlite3";
import express from 'express';
import session from "express-session";
import type { Context, ServiceSchema, Service } from "moleculer";
import type { ApiSettingsSchema, GatewayResponse, IncomingRequest, Route } from "moleculer-web";
import apiGateway from "moleculer-web";
import passport from "passport";
import { isNil, pipe, prop, when } from "ramda";
import { setupPassportLocalStrategy } from "../passport/passport";
import { Server } from 'node:http';

const betterSQLiteStore = require('better-sqlite3-session-store')(session);

const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
	if (res.headersSent) {
		return next(err)
	}
	res.status(500)
	res.json({ error: err.message })
}

const respondTo = (res: GatewayResponse) => (status: number) => (body: Record<keyof any, any>) => {
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(JSON.stringify(body));
}

interface Meta {
	userAgent?: string | null;
	user?: object | null;
}

type GWService = Service & { server?: Server }
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
				path: "/api",

				whitelist: [],

				// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
				use: [],

				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: true,

				// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
				authentication: true,

				// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
				authorization: true,

				// The auto-alias feature allows you to declare your route alias directly in your services.
				// The gateway will dynamically build the full routes from service schema.
				autoAliases: false,

				aliases: {
					"GET users/me": (req: Express.Request, res: GatewayResponse) =>
						pipe(
							prop('user'),
							when(isNil, () => {
								throw new Error('Unauthorized')
							}),
							respondTo(res)(200)
						)(req),
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
				path: "/auth",

				whitelist: [],

				use: [],

				mergeParams: true,

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
					'POST auth/register': 'auth.register',
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
		log4XXResponses: true,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: 'debug',
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: 'debug',

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


		/**
		 * Authorize the request. Check that the authenticated user has right to access the resource.
		 *
		 * PLEASE NOTE, IT'S JUST AN EXAMPLE IMPLEMENTATION. DO NOT USE IN PRODUCTION!
		 */
		authenticate(
			ctx: Context<null, Meta>,
			route: Route,
			req: Express.Request,
		): Express.User | null {
			return req.user ?? null
		},

		authorize(ctx: Context<null, Meta>, route: Route, req: IncomingRequest) {
			const { user } = ctx.meta;

			if (req.$action.auth && !user) {
				throw new apiGateway.Errors.UnAuthorizedError("NO_RIGHTS", null);
			}
		},
	},

	async created(this: GWService) {
		this.logger.info('Created');
		const db = new BetterSqlite3('session.db', { verbose: this.logger.debug });

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

		app.use(errorHandler);

		this.server = app.listen(
			8080,
			() => this.logger.debug('Server listening.')
		)

	},
	stopped(this: GWService) {
		this.server?.close(
			() => this.logger.debug('Server closed.')
		)
	}
};

export default ApiService;
