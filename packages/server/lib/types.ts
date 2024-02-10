import type { ActionSchema, Context, Service } from 'moleculer';
import type { Collection, Db, Document, MongoClient, ObjectId } from 'mongodb';
import type {
  infer as ZodInfer,
  ZodRawShape,
  ZodTypeAny,
  objectInputType,
  objectOutputType,
} from 'zod';

import type { PostSchema } from './entities/post';
import type { countryCode } from './constants';
import { UserSchema } from './entities/user';

export type CountryCode = (typeof countryCode)[number];

export type Meta = {
  $statusCode?: number;
  $responseType?: string;
  $responseHeaders?: {
    [key: string]: string;
  };
  oauth: {
    id: ObjectId;
    cc: CountryCode;
    company: string;
    client: {
      clientId: string;
    };
    user?: {
      _id: string;
    };
  };
};

export interface ServiceWithDb<TDocument extends Document = Document>
  extends Service {
  db: Db;
  client: MongoClient;
  collection: Collection<TDocument>;
}

export interface ZodActionSchema<
  TParams extends ZodRawShape = ZodRawShape,
  TResponse extends ZodTypeAny = ZodTypeAny,
  TDocument extends Document = Document,
> extends ActionSchema {
  params: TParams;
  handler: (
    this: ServiceWithDb<TDocument>,
    ctx: Context<objectOutputType<TParams, ZodTypeAny>, Meta>
  ) => ZodInfer<TResponse> | Promise<ZodInfer<TResponse>>;
  response: TResponse;
}

export type CallParams<TSchema extends ZodRawShape> = objectInputType<
  TSchema,
  ZodTypeAny
>;

export type PostsService = ServiceWithDb<PostSchema>;

export type UsersService = ServiceWithDb<UserSchema>;

export type AuthService = Service;


// Add your environment variables here to stop TS from complaining
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      MONGO_URI: string;
      LOG_LEVEL?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
      NATS_URI: string;
      MONGO_DEFAULT_DATABASE: string;
    }
  }
}

