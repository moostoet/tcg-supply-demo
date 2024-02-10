/* eslint-disable @typescript-eslint/no-explicit-any */
import { Errors, Validators } from 'moleculer';
import { hasher, type Hasher } from 'node-object-hash';
import { ZodError, z, type ZodRawShape } from 'zod';

import type { ServiceWithDb, ZodActionSchema } from './types';

export class ZodValidator<
  TService extends ServiceWithDb,
> extends Validators.Base {
  private validatorCache: Map<string, any>;
  private hasher: Hasher;

  constructor() {
    super();
    this.validatorCache = new Map();
    this.hasher = hasher();
  }

  // @ts-expect-error - Moleculer type definitions are broken
  override middleware(broker: TService) {
    return {
      name: 'ZodRequestValidator',
      localAction:
        (handler: ZodActionSchema['handler'], action: ZodActionSchema) =>
        (ctx: Parameters<ZodActionSchema['handler']>[0]) => {
          if (ctx.params && action.params) {
            const check = this.compile(action.params);
            if (check(ctx.params)) {
              const cacheKey = this.hasher.hash(ctx.params);
              ctx.params = this.validatorCache.get(cacheKey);
              this.validatorCache.delete(cacheKey);
              return handler.bind(broker)(ctx);
            }
          }
          return handler.bind(broker)(ctx);
        },
    } as any;
  }

  override compile(schema: ZodRawShape) {
    return (params: unknown) => this.validate(params, schema);
  }

  override validate(params: unknown, schema: ZodRawShape) {
    try {
      const validated = z.object(schema).parse(params);
      this.validatorCache.set(this.hasher.hash(params), validated);
      return true;
    } catch (e) {
      if (e instanceof ZodError) {
        throw new Errors.ValidationError(
          'Parameter validation error',
          'VALIDATION_ERROR',
          e.issues
        );
      }
      throw e;
    }
  }
}

