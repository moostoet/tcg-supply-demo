import { modify, pipe } from 'ramda'
import * as RA from 'ramda-adjunct'
import type { Document, HydratedDocument } from 'mongoose';

export const create = <T extends any[], U>(classType: new (...args: T) => U) =>
    (...args: T): U => new classType(...args)

type NormalisableDocument = Document<any> | HydratedDocument<any>;

export const required = <T>(type: T) => ({ type, required: true });

interface NormalisedObject {
    id: string;
    [key: string]: any;
}

const transformId = pipe(
    JSON.stringify,
    JSON.parse
)

export const renameToId = RA.renameKey('_id', 'id')
export const stringifyOId = modify('id', transformId)
export const normaliseOId = pipe(
    renameToId,
    stringifyOId
)

export const docToPojo = <T>(doc: HydratedDocument<T>) => doc.toObject();