export { BaseUserMeta, BroadcastOptions, Client, History, Immutable, Json, JsonObject, LiveList, LiveMap, LiveObject, LiveStructure, Lson, LsonObject, Others, Room, StorageUpdate, User, createClient, shallow } from '@liveblocks/core';

/**
 * Helper type to help users adopt to Lson types from interface definitions.
 * You should only use this to wrap interfaces you don't control. For more
 * information, see
 * https://liveblocks.io/docs/guides/limits#lson-constraint-and-interfaces
 */
declare type EnsureJson<T> = [
    unknown
] extends [T] ? T : T extends (...args: unknown[]) => unknown ? T : {
    [K in keyof T]: EnsureJson<T[K]>;
};

export { EnsureJson };
