import { Server } from 'node:http';
import BetterSqlite3 from "better-sqlite3";
import express from 'express';
import session from "express-session";
import passport from "passport";
import type { Context, ServiceSchema, Service, } from "moleculer";
import { Errors } from 'moleculer'
import type { ApiSettingsSchema, GatewayResponse, IncomingRequest, Route } from "moleculer-web";
import apiGateway from "moleculer-web";
import { T, __, always, cond, curry, ifElse, is, isNil, pipe, prop, unless, when } from "ramda";
import { setupPassportLocalStrategy } from "../passport/passport";
import { Env } from '../lib/env';
import { APIError, APIErrorS } from '../../shared/schemas/error'
import * as F from '../lib/functions'
import { UnauthorizedError } from '../lib/errors/UnauthorizedError';

const betterSQLiteStore = require('better-sqlite3-session-store')(session);

const respondTo = (res: GatewayResponse) => (status: number) => (body: Record<keyof any, any>) => ifElse(
	() => res.headersSent,
	T,
	() => {
		res.writeHead(status, { "Content-Type": "application/json" })
		res.end(JSON.stringify(body))
    }
)()

const respondWithErrorTo = (res: express.Response) => (error: APIError) => res.status(error.code).json(error)

const isMoleculerError = is(Errors.MoleculerError)
const parseUnhandled = cond([
	// maybe a 500 error but whatever for now
	[T, pipe(always('Something went wrong'), curry(F.create(apiGateway.Errors.BadRequestError))(__, 'null'))]
])
const parseError = pipe(
	unless(isMoleculerError, parseUnhandled),
	APIErrorS.parse,
)
const errorHandler: express.ErrorRequestHandler = (err, req, res, next) => ifElse(
	(e) => res.headersSent,
	next,
	pipe(
		parseError,
		respondWithErrorTo(res)
	)
)(err)

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
			// consider adding it to *app* instead.
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
					"GET users/me": (req: IncomingRequest, res: GatewayResponse) =>
						pipe(
							prop('user'),
							ifElse(
								isNil,
								() => pipe(
									F.create(apiGateway.Errors.UnAuthorizedError),
									req.$next
								)("NO_RIGHTS", null),
								respondTo(res)(200)
							)
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
				mergeParams: true,
				autoAliases: false,
				aliases: {
					'POST login': [
						passport.authenticate("local"),
						"auth.login"
					],
					'POST logout': async (req: Express.Request, res: GatewayResponse) => [
						passport.authenticate("local"),
						req.logout(() => respondTo(res)(200)({ message: 'OK' }))
					],
					'POST register': 'auth.register',
				},



				mappingPolicy: "all", // Available values: "all", "restrict"
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
		 * Authenticate the request.
		 * Get user from session.
		 * The resolved user will be available in `ctx.meta.user`
		 */

		authenticate(
			ctx: Context<null, Meta>,
			route: Route,
			req: Express.Request,
		): Express.User | null {
			return req.user ?? null
		},
		/**
		 * Authorize the request. Check that the authenticated user has right to access the resource.
		 *
				 */
		authorize(ctx: Context<null, Meta>, route: Route, req: IncomingRequest) {
			const { user } = ctx.meta;
			if (!req.$action) {
				return this.logger.trace('Action-less call')
			}
			if (req.$action.auth && !user) {
				// TODO: Consider changing this. NO_RIGHTS is not standardised, maybe consider alternative.
				throw new apiGateway.Errors.UnAuthorizedError("NO_RIGHTS", null);
			}
		},
	},

	async created(this: GWService) {
		this.logger.info('Created')

		const app = express()
		const db = new BetterSqlite3('session.db', { verbose: this.logger.debug })

		setupPassportLocalStrategy(this.broker, passport)

		app.use(session({
			secret: Env.COOKIE_SECRET,
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
