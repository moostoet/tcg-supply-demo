import { ObjectId, type Document } from 'mongodb';
import crypto from 'node:crypto';
import os from 'node:os';

export const getUniqId = () => {
    const interfaces = os.networkInterfaces();
    let mac = os.hostname();

    if (
        interfaces['en0'] &&
        Array.isArray(interfaces['en0']) &&
        interfaces['en0'].length > 0
    ) {
        mac = interfaces['en0'].filter((i) => i.family === 'IPv4')[0]!.mac;
    }

    return crypto.createHash('sha256').update(mac, 'binary').digest('hex');
};

export const isDocument = <TDocument extends Document>(
    obj: ObjectId | TDocument
): obj is TDocument => {
    return !(obj instanceof ObjectId);
};

export function isPOJO(arg: unknown) {
    if (arg == null || typeof arg !== 'object') {
        return false;
    }
    const proto = Object.getPrototypeOf(arg);
    if (proto == null) {
        return true;
    }
    return proto === Object.prototype;
}

export const getProjectionFromParams = <TParams extends string[]>(
    params: TParams
) =>
    Object.fromEntries(params.map((param) => [param, 1])) as Partial<{
        [Property in TParams[number]]: 1;
    }>;

