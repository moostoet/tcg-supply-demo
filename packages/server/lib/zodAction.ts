import { Errors, type ActionSchema, type Context, Service } from 'moleculer';
import type { Document } from 'mongodb';
import type { OmitIndexSignature } from 'type-fest';
import {
  ZodError,
  type AnyZodObject,
  type infer as ZodInfer,
  type ZodTypeAny,
} from 'zod';

import type { Meta, ServiceWithDb, ZodActionSchema } from './types';

export function zodAction<
  TParams extends AnyZodObject,
  TResponse extends ZodTypeAny,
  TDocument extends Document,
>(
  action: Omit<OmitIndexSignature<ActionSchema>, 'params' | 'handler'> & {
    params: TParams;
    response: TResponse;
    handler: (
      this: ServiceWithDb<TDocument>,
      ctx: Context<ZodInfer<TParams>, Meta>
    ) => ZodInfer<TResponse> | Promise<ZodInfer<TResponse>>;
  }
): ZodActionSchema<TParams['shape'], TResponse, TDocument> {
  return {
    ...action,
    params: action.params.shape,
    response: action.response,
    hooks: {
      after(
        this: ServiceWithDb<TDocument>,
        _ctx: Parameters<(typeof action)['handler']>[0],
        response: unknown
      ) {
        try {
          return action.response.parse(response);
        } catch (e) {
          if (e instanceof ZodError) {
            throw new Errors.ValidationError(
              'Response body validation error',
              'VALIDATION_ERROR',
              e.issues
            );
          }
          throw e;
        }
      },
      error(
        this: ServiceWithDb<TDocument>,
        ctx: Parameters<(typeof action)['handler']>[0],
        err: Error
      ) {
        this.logger.error(`Error when calling action "${ctx.action?.name}"`);
        this.logger.error(err);
        throw err;
      },
    },
  };
}
