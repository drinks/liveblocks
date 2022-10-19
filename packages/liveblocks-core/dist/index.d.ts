/**
 * Helper function that can be used to implement exhaustive switch statements
 * with TypeScript. Example usage:
 *
 *    type Fruit = "🍎" | "🍌";
 *
 *    switch (fruit) {
 *      case "🍎":
 *      case "🍌":
 *        return doSomething();
 *
 *      default:
 *        return assertNever(fruit, "Unknown fruit");
 *    }
 *
 * If now the Fruit union is extended (i.e. add "🍒"), TypeScript will catch
 * this *statically*, rather than at runtime, and force you to handle the
 * 🍒 case.
 */
declare function assertNever(_value: never, errmsg: string): never;
/**
 * Asserts that a given value is non-nullable. This is similar to TypeScript's
 * `!` operator, but will throw an error at runtime (dev-mode only) indicating
 * an incorrect assumption.
 *
 * Instead of:
 *
 *     foo!.bar
 *
 * Use:
 *
 *     nn(foo).bar
 *
 */
declare function nn<T>(value: T, errmsg?: string): NonNullable<T>;

declare type Callback<T> = (event: T) => void;
declare type UnsubscribeCallback = () => void;
declare type Observable<T> = {
    subscribe(callback: Callback<T>): UnsubscribeCallback;
    subscribeOnce(callback: Callback<T>): UnsubscribeCallback;
};

declare type ReadonlyArrayWithLegacyMethods<T> = readonly T[] & {
    /**
     * @deprecated Prefer the normal .length property on arrays.
     */
    readonly count: number;
    /**
     * @deprecated Calling .toArray() is no longer needed
     */
    readonly toArray: () => readonly T[];
};
declare function asArrayWithLegacyMethods<T>(arr: readonly T[]): ReadonlyArrayWithLegacyMethods<T>;

/**
 * The LiveMap class is similar to a JavaScript Map that is synchronized on all clients.
 * Keys should be a string, and values should be serializable to JSON.
 * If multiple clients update the same property simultaneously, the last modification received by the Liveblocks servers is the winner.
 */
declare class LiveMap<TKey extends string, TValue extends Lson> extends AbstractCrdt {
    constructor(entries?: readonly (readonly [TKey, TValue])[] | undefined);
    /**
     * Returns a specified element from the LiveMap.
     * @param key The key of the element to return.
     * @returns The element associated with the specified key, or undefined if the key can't be found in the LiveMap.
     */
    get(key: TKey): TValue | undefined;
    /**
     * Adds or updates an element with a specified key and a value.
     * @param key The key of the element to add. Should be a string.
     * @param value The value of the element to add. Should be serializable to JSON.
     */
    set(key: TKey, value: TValue): void;
    /**
     * Returns the number of elements in the LiveMap.
     */
    get size(): number;
    /**
     * Returns a boolean indicating whether an element with the specified key exists or not.
     * @param key The key of the element to test for presence.
     */
    has(key: TKey): boolean;
    /**
     * Removes the specified element by key.
     * @param key The key of the element to remove.
     * @returns true if an element existed and has been removed, or false if the element does not exist.
     */
    delete(key: TKey): boolean;
    /**
     * Returns a new Iterator object that contains the [key, value] pairs for each element.
     */
    entries(): IterableIterator<[TKey, TValue]>;
    /**
     * Same function object as the initial value of the entries method.
     */
    [Symbol.iterator](): IterableIterator<[TKey, TValue]>;
    /**
     * Returns a new Iterator object that contains the keys for each element.
     */
    keys(): IterableIterator<TKey>;
    /**
     * Returns a new Iterator object that contains the values for each element.
     */
    values(): IterableIterator<TValue>;
    /**
     * Executes a provided function once per each key/value pair in the Map object, in insertion order.
     * @param callback Function to execute for each entry in the map.
     */
    forEach(callback: (value: TValue, key: TKey, map: LiveMap<TKey, TValue>) => void): void;
    toImmutable(): ReadonlyMap<TKey, ToImmutable<TValue>>;
}

/**
 * The LiveObject class is similar to a JavaScript object that is synchronized on all clients.
 * Keys should be a string, and values should be serializable to JSON.
 * If multiple clients update the same property simultaneously, the last modification received by the Liveblocks servers is the winner.
 */
declare class LiveObject<O extends LsonObject> extends AbstractCrdt {
    constructor(obj?: O);
    /**
     * Transform the LiveObject into a javascript object
     */
    toObject(): O;
    /**
     * Adds or updates a property with a specified key and a value.
     * @param key The key of the property to add
     * @param value The value of the property to add
     */
    set<TKey extends keyof O>(key: TKey, value: O[TKey]): void;
    /**
     * Returns a specified property from the LiveObject.
     * @param key The key of the property to get
     */
    get<TKey extends keyof O>(key: TKey): O[TKey];
    /**
     * Deletes a key from the LiveObject
     * @param key The key of the property to delete
     */
    delete(key: keyof O): void;
    /**
     * Adds or updates multiple properties at once with an object.
     * @param patch The object used to overrides properties
     */
    update(patch: Partial<O>): void;
    toImmutable(): ToImmutable<O>;
}

/**
 * Represents an indefinitely deep arbitrary JSON data structure. There are
 * four types that make up the Json family:
 *
 * - Json         any legal JSON value
 * - JsonScalar   any legal JSON leaf value (no lists or objects)
 * - JsonArray    a JSON value whose outer type is an array
 * - JsonObject   a JSON value whose outer type is an object
 *
 */
declare type Json = JsonScalar | JsonArray | JsonObject;
declare type JsonScalar = string | number | boolean | null;
declare type JsonArray = Json[];
declare type JsonObject = {
    [key: string]: Json | undefined;
};
declare function isJsonScalar(data: Json): data is JsonScalar;
declare function isJsonArray(data: Json): data is JsonArray;
declare function isJsonObject(data: Json): data is JsonObject;

/**
 * INTERNAL
 */
declare class LiveRegister<TValue extends Json> extends AbstractCrdt {
    constructor(data: TValue);
    get data(): TValue;
}

declare type LiveStructure = LiveObject<LsonObject> | LiveList<Lson> | LiveMap<string, Lson>;
/**
 * Think of Lson as a sibling of the Json data tree, except that the nested
 * data structure can contain a mix of Json values and LiveStructure instances.
 */
declare type Lson = Json | LiveStructure;
/**
 * LiveNode is the internal tree for managing Live data structures. The key
 * difference with Lson is that all the Json values get represented in
 * a LiveRegister node.
 */
declare type LiveNode = LiveStructure | LiveRegister<Json>;
/**
 * A mapping of keys to Lson values. A Lson value is any valid JSON
 * value or a Live storage data structure (LiveMap, LiveList, etc.)
 */
declare type LsonObject = {
    [key: string]: Lson | undefined;
};
/**
 * Helper type to convert any valid Lson type to the equivalent Json type.
 *
 * Examples:
 *
 *   ToJson<42>                         // 42
 *   ToJson<'hi'>                       // 'hi'
 *   ToJson<number>                     // number
 *   ToJson<string>                     // string
 *   ToJson<string | LiveList<number>>  // string | number[]
 *   ToJson<LiveMap<string, LiveList<number>>>
 *                                      // { [key: string]: number[] }
 *   ToJson<LiveObject<{ a: number, b: LiveList<string>, c?: number }>>
 *                                      // { a: null, b: string[], c?: number }
 *
 */
declare type ToJson<T extends Lson | LsonObject> = T extends Json ? T : T extends LsonObject ? {
    [K in keyof T]: ToJson<Exclude<T[K], undefined>> | (undefined extends T[K] ? undefined : never);
} : T extends LiveList<infer I> ? ToJson<I>[] : T extends LiveObject<infer O> ? ToJson<O> : T extends LiveMap<infer KS, infer V> ? {
    [K in KS]: ToJson<V>;
} : never;

/**
 * Represents an indefinitely deep arbitrary immutable data
 * structure, as returned by the .toImmutable().
 */

declare type Immutable = Scalar | ImmutableList | ImmutableObject | ImmutableMap;
declare type Scalar = string | number | boolean | null;
declare type ImmutableList = readonly Immutable[];
declare type ImmutableObject = {
    readonly [key: string]: Immutable | undefined;
};
declare type ImmutableMap = ReadonlyMap<string, Immutable>;
/**
 * Helper type to convert any valid Lson type to the equivalent Json type.
 *
 * Examples:
 *
 *   ToImmutable<42>                         // 42
 *   ToImmutable<'hi'>                       // 'hi'
 *   ToImmutable<number>                     // number
 *   ToImmutable<string>                     // string
 *   ToImmutable<string | LiveList<number>>  // string | readonly number[]
 *   ToImmutable<LiveMap<string, LiveList<number>>>
 *                                           // ReadonlyMap<string, readonly number[]>
 *   ToImmutable<LiveObject<{ a: number, b: LiveList<string>, c?: number }>>
 *                                           // { readonly a: null, readonly b: readonly string[], readonly c?: number }
 *
 */
declare type ToImmutable<L extends Lson | LsonObject> = L extends LiveList<infer I> ? readonly ToImmutable<I>[] : L extends LiveObject<infer O> ? ToImmutable<O> : L extends LiveMap<infer K, infer V> ? ReadonlyMap<K, ToImmutable<V>> : L extends LsonObject ? {
    readonly [K in keyof L]: ToImmutable<Exclude<L[K], undefined>> | (undefined extends L[K] ? undefined : never);
} : L extends Json ? L : never;

declare abstract class AbstractCrdt {
    get roomId(): string | null;
    /**
     * Return an immutable snapshot of this Live node and its children.
     */
    toImmutable(): Immutable;
}

/**
 * The LiveList class represents an ordered collection of items that is synchronized across clients.
 */
declare class LiveList<TItem extends Lson> extends AbstractCrdt {
    constructor(items?: TItem[]);
    /**
     * Returns the number of elements.
     */
    get length(): number;
    /**
     * Adds one element to the end of the LiveList.
     * @param element The element to add to the end of the LiveList.
     */
    push(element: TItem): void;
    /**
     * Inserts one element at a specified index.
     * @param element The element to insert.
     * @param index The index at which you want to insert the element.
     */
    insert(element: TItem, index: number): void;
    /**
     * Move one element from one index to another.
     * @param index The index of the element to move
     * @param targetIndex The index where the element should be after moving.
     */
    move(index: number, targetIndex: number): void;
    /**
     * Deletes an element at the specified index
     * @param index The index of the element to delete
     */
    delete(index: number): void;
    clear(): void;
    set(index: number, item: TItem): void;
    /**
     * Returns an Array of all the elements in the LiveList.
     */
    toArray(): TItem[];
    /**
     * Tests whether all elements pass the test implemented by the provided function.
     * @param predicate Function to test for each element, taking two arguments (the element and its index).
     * @returns true if the predicate function returns a truthy value for every element. Otherwise, false.
     */
    every(predicate: (value: TItem, index: number) => unknown): boolean;
    /**
     * Creates an array with all elements that pass the test implemented by the provided function.
     * @param predicate Function to test each element of the LiveList. Return a value that coerces to true to keep the element, or to false otherwise.
     * @returns An array with the elements that pass the test.
     */
    filter(predicate: (value: TItem, index: number) => unknown): TItem[];
    /**
     * Returns the first element that satisfies the provided testing function.
     * @param predicate Function to execute on each value.
     * @returns The value of the first element in the LiveList that satisfies the provided testing function. Otherwise, undefined is returned.
     */
    find(predicate: (value: TItem, index: number) => unknown): TItem | undefined;
    /**
     * Returns the index of the first element in the LiveList that satisfies the provided testing function.
     * @param predicate Function to execute on each value until the function returns true, indicating that the satisfying element was found.
     * @returns The index of the first element in the LiveList that passes the test. Otherwise, -1.
     */
    findIndex(predicate: (value: TItem, index: number) => unknown): number;
    /**
     * Executes a provided function once for each element.
     * @param callbackfn Function to execute on each element.
     */
    forEach(callbackfn: (value: TItem, index: number) => void): void;
    /**
     * Get the element at the specified index.
     * @param index The index on the element to get.
     * @returns The element at the specified index or undefined.
     */
    get(index: number): TItem | undefined;
    /**
     * Returns the first index at which a given element can be found in the LiveList, or -1 if it is not present.
     * @param searchElement Element to locate.
     * @param fromIndex The index to start the search at.
     * @returns The first index of the element in the LiveList; -1 if not found.
     */
    indexOf(searchElement: TItem, fromIndex?: number): number;
    /**
     * Returns the last index at which a given element can be found in the LiveList, or -1 if it is not present. The LiveLsit is searched backwards, starting at fromIndex.
     * @param searchElement Element to locate.
     * @param fromIndex The index at which to start searching backwards.
     * @returns
     */
    lastIndexOf(searchElement: TItem, fromIndex?: number): number;
    /**
     * Creates an array populated with the results of calling a provided function on every element.
     * @param callback Function that is called for every element.
     * @returns An array with each element being the result of the callback function.
     */
    map<U>(callback: (value: TItem, index: number) => U): U[];
    /**
     * Tests whether at least one element in the LiveList passes the test implemented by the provided function.
     * @param predicate Function to test for each element.
     * @returns true if the callback function returns a truthy value for at least one element. Otherwise, false.
     */
    some(predicate: (value: TItem, index: number) => unknown): boolean;
    [Symbol.iterator](): IterableIterator<TItem>;
    toImmutable(): readonly ToImmutable<TItem>[];
}

/**
 * This type is used by clients to define the metadata for a user.
 */
declare type BaseUserMeta = {
    /**
     * The id of the user that has been set in the authentication endpoint.
     * Useful to get additional information about the connected user.
     */
    id?: string;
    /**
     * Additional user information that has been set in the authentication endpoint.
     */
    info?: Json;
};

declare enum OpCode {
    INIT = 0,
    SET_PARENT_KEY = 1,
    CREATE_LIST = 2,
    UPDATE_OBJECT = 3,
    CREATE_OBJECT = 4,
    DELETE_CRDT = 5,
    DELETE_OBJECT_KEY = 6,
    CREATE_MAP = 7,
    CREATE_REGISTER = 8
}
/**
 * These operations are the payload for {@link UpdateStorageServerMsg} messages
 * only.
 */
declare type Op = CreateOp | UpdateObjectOp | DeleteCrdtOp | SetParentKeyOp | DeleteObjectKeyOp;
declare type CreateOp = CreateRootObjectOp | CreateChildOp;
declare type CreateChildOp = CreateObjectOp | CreateRegisterOp | CreateMapOp | CreateListOp;
declare type UpdateObjectOp = {
    opId?: string;
    id: string;
    type: OpCode.UPDATE_OBJECT;
    data: Partial<JsonObject>;
};
declare type CreateObjectOp = {
    opId?: string;
    id: string;
    intent?: "set";
    deletedId?: string;
    type: OpCode.CREATE_OBJECT;
    parentId: string;
    parentKey: string;
    data: JsonObject;
};
declare type CreateRootObjectOp = {
    opId?: string;
    id: string;
    type: OpCode.CREATE_OBJECT;
    data: JsonObject;
    parentId?: never;
    parentKey?: never;
};
declare type CreateListOp = {
    opId?: string;
    id: string;
    intent?: "set";
    deletedId?: string;
    type: OpCode.CREATE_LIST;
    parentId: string;
    parentKey: string;
};
declare type CreateMapOp = {
    opId?: string;
    id: string;
    intent?: "set";
    deletedId?: string;
    type: OpCode.CREATE_MAP;
    parentId: string;
    parentKey: string;
};
declare type CreateRegisterOp = {
    opId?: string;
    id: string;
    intent?: "set";
    deletedId?: string;
    type: OpCode.CREATE_REGISTER;
    parentId: string;
    parentKey: string;
    data: Json;
};
declare type DeleteCrdtOp = {
    opId?: string;
    id: string;
    type: OpCode.DELETE_CRDT;
};
declare type SetParentKeyOp = {
    opId?: string;
    id: string;
    type: OpCode.SET_PARENT_KEY;
    parentKey: string;
};
declare type DeleteObjectKeyOp = {
    opId?: string;
    id: string;
    type: OpCode.DELETE_OBJECT_KEY;
    key: string;
};

declare enum ClientMsgCode {
    UPDATE_PRESENCE = 100,
    BROADCAST_EVENT = 103,
    FETCH_STORAGE = 200,
    UPDATE_STORAGE = 201
}
/**
 * Messages that can be sent from the client to the server.
 */
declare type ClientMsg<TPresence extends JsonObject, TRoomEvent extends Json> = BroadcastEventClientMsg<TRoomEvent> | UpdatePresenceClientMsg<TPresence> | UpdateStorageClientMsg | FetchStorageClientMsg;
declare type BroadcastEventClientMsg<TRoomEvent extends Json> = {
    type: ClientMsgCode.BROADCAST_EVENT;
    event: TRoomEvent;
};
declare type UpdatePresenceClientMsg<TPresence extends JsonObject> = {
    type: ClientMsgCode.UPDATE_PRESENCE;
    /**
     * Set this to any number to signify that this is a Full Presence™
     * update, not a patch.
     *
     * The numeric value itself no longer has specific meaning. Historically,
     * this field was intended so that clients could ignore these broadcasted
     * full presence messages, but it turned out that getting a full presence
     * "keyframe" from time to time was useful.
     *
     * So nowadays, the presence (pun intended) of this `targetActor` field
     * is a backward-compatible way of expressing that the `data` contains
     * all presence fields, and isn't a partial "patch".
     */
    targetActor: number;
    data: TPresence;
} | {
    type: ClientMsgCode.UPDATE_PRESENCE;
    /**
     * Absence of the `targetActor` field signifies that this is a Partial
     * Presence™ "patch".
     */
    targetActor?: undefined;
    data: Partial<TPresence>;
};
declare type UpdateStorageClientMsg = {
    type: ClientMsgCode.UPDATE_STORAGE;
    ops: Op[];
};
declare type FetchStorageClientMsg = {
    type: ClientMsgCode.FETCH_STORAGE;
};

declare type IdTuple<T> = [id: string, value: T];
declare enum CrdtType {
    OBJECT = 0,
    LIST = 1,
    MAP = 2,
    REGISTER = 3
}
declare type SerializedCrdt = SerializedRootObject | SerializedChild;
declare type SerializedChild = SerializedObject | SerializedList | SerializedMap | SerializedRegister;
declare type SerializedRootObject = {
    type: CrdtType.OBJECT;
    data: JsonObject;
    parentId?: never;
    parentKey?: never;
};
declare type SerializedObject = {
    type: CrdtType.OBJECT;
    parentId: string;
    parentKey: string;
    data: JsonObject;
};
declare type SerializedList = {
    type: CrdtType.LIST;
    parentId: string;
    parentKey: string;
};
declare type SerializedMap = {
    type: CrdtType.MAP;
    parentId: string;
    parentKey: string;
};
declare type SerializedRegister = {
    type: CrdtType.REGISTER;
    parentId: string;
    parentKey: string;
    data: Json;
};
declare function isRootCrdt(crdt: SerializedCrdt): crdt is SerializedRootObject;
declare function isChildCrdt(crdt: SerializedCrdt): crdt is SerializedChild;

/**
 * Lookup table for nodes (= SerializedCrdt values) by their IDs.
 */
declare type NodeMap = Map<string, // Node ID
SerializedCrdt>;
/**
 * Reverse lookup table for all child nodes (= list of SerializedCrdt values)
 * by their parent node's IDs.
 */
declare type ParentToChildNodeMap = Map<string, // Parent's node ID
IdTuple<SerializedChild>[]>;

declare enum ServerMsgCode {
    UPDATE_PRESENCE = 100,
    USER_JOINED = 101,
    USER_LEFT = 102,
    BROADCASTED_EVENT = 103,
    ROOM_STATE = 104,
    INITIAL_STORAGE_STATE = 200,
    UPDATE_STORAGE = 201
}
/**
 * Messages that can be sent from the server to the client.
 */
declare type ServerMsg<TPresence extends JsonObject, TUserMeta extends BaseUserMeta, TRoomEvent extends Json> = UpdatePresenceServerMsg<TPresence> | UserJoinServerMsg<TUserMeta> | UserLeftServerMsg | BroadcastedEventServerMsg<TRoomEvent> | RoomStateServerMsg<TUserMeta> | InitialDocumentStateServerMsg | UpdateStorageServerMsg;
/**
 * Sent by the WebSocket server and broadcasted to all clients to announce that
 * a User updated their presence. For example, when a user moves their cursor.
 *
 * In most cases, the data payload will only include the fields from the
 * Presence that have been changed since the last announcement. However, after
 * a new user joins a room, a "full presence" will be announced so the newly
 * connected user will get each other's user full presence at least once. In
 * those cases, the `targetActor` field indicates the newly connected client,
 * so all other existing clients can ignore this broadcasted message.
 */
declare type UpdatePresenceServerMsg<TPresence extends JsonObject> = {
    type: ServerMsgCode.UPDATE_PRESENCE;
    /**
     * The User whose Presence has changed.
     */
    actor: number;
    /**
     * When set, signifies that this is a Full Presence™ update, not a patch.
     *
     * The numeric value itself no longer has specific meaning. Historically,
     * this field was intended so that clients could ignore these broadcasted
     * full presence messages, but it turned out that getting a full presence
     * "keyframe" from time to time was useful.
     *
     * So nowadays, the presence (pun intended) of this `targetActor` field
     * is a backward-compatible way of expressing that the `data` contains
     * all presence fields, and isn't a partial "patch".
     */
    targetActor: number;
    /**
     * The partial or full Presence of a User. If the `targetActor` field is set,
     * this will be the full Presence, otherwise it only contain the fields that
     * have changed since the last broadcast.
     */
    data: TPresence;
} | {
    type: ServerMsgCode.UPDATE_PRESENCE;
    /**
     * The User whose Presence has changed.
     */
    actor: number;
    /**
     * Not set for partial presence updates.
     */
    targetActor?: undefined;
    /**
     * A partial Presence patch to apply to the User. It will only contain the
     * fields that have changed since the last broadcast.
     */
    data: Partial<TPresence>;
};
/**
 * Sent by the WebSocket server and broadcasted to all clients to announce that
 * a new User has joined the Room.
 */
declare type UserJoinServerMsg<TUserMeta extends BaseUserMeta> = {
    type: ServerMsgCode.USER_JOINED;
    actor: number;
    /**
     * The id of the User that has been set in the authentication endpoint.
     * Useful to get additional information about the connected user.
     */
    id: TUserMeta["id"];
    /**
     * Additional user information that has been set in the authentication
     * endpoint.
     */
    info: TUserMeta["info"];
    /**
     * Permissions that the user has in the Room.
     */
    scopes: string[];
};
/**
 * Sent by the WebSocket server and broadcasted to all clients to announce that
 * a new User has left the Room.
 */
declare type UserLeftServerMsg = {
    type: ServerMsgCode.USER_LEFT;
    actor: number;
};
/**
 * Sent by the WebSocket server and broadcasted to all clients to announce that
 * a User broadcasted an Event to everyone in the Room.
 */
declare type BroadcastedEventServerMsg<TRoomEvent extends Json> = {
    type: ServerMsgCode.BROADCASTED_EVENT;
    /**
     * The User who broadcasted the Event.
     */
    actor: number;
    /**
     * The arbitrary payload of the Event. This can be any JSON value. Clients
     * will have to manually verify/decode this event.
     */
    event: TRoomEvent;
};
/**
 * Sent by the WebSocket server to a single client in response to the client
 * joining the Room, to provide the initial state of the Room. The payload
 * includes a list of all other Users that already are in the Room.
 */
declare type RoomStateServerMsg<TUserMeta extends BaseUserMeta> = {
    type: ServerMsgCode.ROOM_STATE;
    users: {
        [actor: number]: TUserMeta & {
            scopes: string[];
        };
    };
};
/**
 * Sent by the WebSocket server to a single client in response to the client
 * joining the Room, to provide the initial Storage state of the Room. The
 * payload includes the entire Storage document.
 */
declare type InitialDocumentStateServerMsg = {
    type: ServerMsgCode.INITIAL_STORAGE_STATE;
    items: IdTuple<SerializedCrdt>[];
};
/**
 * Sent by the WebSocket server and broadcasted to all clients to announce that
 * a change occurred in the Storage document.
 *
 * The payload of this message contains a list of Ops (aka incremental
 * mutations to make to the initially loaded document).
 */
declare type UpdateStorageServerMsg = {
    type: ServerMsgCode.UPDATE_STORAGE;
    ops: Op[];
};

/**
 * This helper type is effectively a no-op, but will force TypeScript to
 * "evaluate" any named helper types in its definition. This can sometimes make
 * API signatures clearer in IDEs.
 *
 * For example, in:
 *
 *   type Payload<T> = { data: T };
 *
 *   let r1: Payload<string>;
 *   let r2: Resolve<Payload<string>>;
 *
 * The inferred type of `r1` is going to be `Payload<string>` which shows up in
 * editor hints, and it may be unclear what's inside if you don't know the
 * definition of `Payload`.
 *
 * The inferred type of `r2` is going to be `{ data: string }`, which may be
 * more helpful.
 *
 * This trick comes from:
 * https://effectivetypescript.com/2022/02/25/gentips-4-display/
 */
declare type Resolve<T> = T extends (...args: unknown[]) => unknown ? T : {
    [K in keyof T]: T[K];
};
declare type CustomEvent<TRoomEvent extends Json> = {
    connectionId: number;
    event: TRoomEvent;
};
declare type UpdateDelta = {
    type: "update";
} | {
    type: "delete";
};
/**
 * A LiveMap notification that is sent in-client to any subscribers whenever
 * one or more of the values inside the LiveMap instance have changed.
 */
declare type LiveMapUpdates<TKey extends string, TValue extends Lson> = {
    type: "LiveMap";
    node: LiveMap<TKey, TValue>;
    updates: {
        [key: string]: UpdateDelta;
    };
};
declare type LiveObjectUpdateDelta<O extends {
    [key: string]: unknown;
}> = {
    [K in keyof O]?: UpdateDelta | undefined;
};
/**
 * A LiveObject notification that is sent in-client to any subscribers whenever
 * one or more of the entries inside the LiveObject instance have changed.
 */
declare type LiveObjectUpdates<TData extends LsonObject> = {
    type: "LiveObject";
    node: LiveObject<TData>;
    updates: LiveObjectUpdateDelta<TData>;
};
declare type LiveListUpdateDelta = {
    index: number;
    item: Lson;
    type: "insert";
} | {
    index: number;
    type: "delete";
} | {
    index: number;
    previousIndex: number;
    item: Lson;
    type: "move";
} | {
    index: number;
    item: Lson;
    type: "set";
};
/**
 * A LiveList notification that is sent in-client to any subscribers whenever
 * one or more of the items inside the LiveList instance have changed.
 */
declare type LiveListUpdates<TItem extends Lson> = {
    type: "LiveList";
    node: LiveList<TItem>;
    updates: LiveListUpdateDelta[];
};
declare type BroadcastOptions = {
    /**
     * Whether or not event is queued if the connection is currently closed.
     *
     * ❗ We are not sure if we want to support this option in the future so it might be deprecated to be replaced by something else
     */
    shouldQueueEventIfNotReady: boolean;
};
/**
 * The payload of notifications sent (in-client) when LiveStructures change.
 * Messages of this kind are not originating from the network, but are 100%
 * in-client.
 */
declare type StorageUpdate = LiveMapUpdates<string, Lson> | LiveObjectUpdates<LsonObject> | LiveListUpdates<Lson>;
declare type StorageCallback = (updates: StorageUpdate[]) => void;
declare type RoomInitializers<TPresence extends JsonObject, TStorage extends LsonObject> = Resolve<{
    /**
     * The initial Presence to use and announce when you enter the Room. The
     * Presence is available on all users in the Room (me & others).
     */
    initialPresence: TPresence | ((roomId: string) => TPresence);
    /**
     * The initial Storage to use when entering a new Room.
     */
    initialStorage?: TStorage | ((roomId: string) => TStorage);
    /**
     * Whether or not the room connects to Liveblock servers. Default is true.
     *
     * Usually set to false when the client is used from the server to not call
     * the authentication endpoint or connect via WebSocket.
     */
    shouldInitiallyConnect?: boolean;
}>;
declare type Client = {
    /**
     * Gets a room. Returns null if {@link Client.enter} has not been called previously.
     *
     * @param roomId The id of the room
     */
    getRoom<TPresence extends JsonObject, TStorage extends LsonObject = LsonObject, TUserMeta extends BaseUserMeta = BaseUserMeta, TRoomEvent extends Json = never>(roomId: string): Room<TPresence, TStorage, TUserMeta, TRoomEvent> | null;
    /**
     * Enters a room and returns it.
     * @param roomId The id of the room
     * @param options Optional. You can provide initializers for the Presence or Storage when entering the Room.
     */
    enter<TPresence extends JsonObject, TStorage extends LsonObject = LsonObject, TUserMeta extends BaseUserMeta = BaseUserMeta, TRoomEvent extends Json = never>(roomId: string, options: RoomInitializers<TPresence, TStorage>): Room<TPresence, TStorage, TUserMeta, TRoomEvent>;
    /**
     * Leaves a room.
     * @param roomId The id of the room
     */
    leave(roomId: string): void;
};
/**
 * Represents all the other users connected in the room. Treated as immutable.
 */
declare type Others<TPresence extends JsonObject, TUserMeta extends BaseUserMeta> = ReadonlyArrayWithLegacyMethods<User<TPresence, TUserMeta>>;
/**
 * Represents a user connected in a room. Treated as immutable.
 */
declare type User<TPresence extends JsonObject, TUserMeta extends BaseUserMeta> = {
    /**
     * The connection id of the user. It is unique and increment at every new connection.
     */
    readonly connectionId: number;
    /**
     * The id of the user that has been set in the authentication endpoint.
     * Useful to get additional information about the connected user.
     */
    readonly id: TUserMeta["id"];
    /**
     * Additional user information that has been set in the authentication endpoint.
     */
    readonly info: TUserMeta["info"];
    /**
     * The user presence.
     */
    readonly presence: TPresence;
    /**
     * False if the user can modify the room storage, true otherwise.
     */
    readonly isReadOnly: boolean;
};
declare type AuthEndpointCallback = (room: string) => Promise<{
    token: string;
}>;
declare type AuthEndpoint = string | AuthEndpointCallback;
declare type Polyfills = {
    atob?: (data: string) => string;
    fetch?: typeof fetch;
    WebSocket?: any;
};
/**
 * The authentication endpoint that is called to ensure that the current user has access to a room.
 * Can be an url or a callback if you need to add additional headers.
 */
declare type ClientOptions = {
    throttle?: number;
    polyfills?: Polyfills;
    /**
     * Backward-compatible way to set `polyfills.fetch`.
     */
    fetchPolyfill?: Polyfills["fetch"];
    /**
     * Backward-compatible way to set `polyfills.WebSocket`.
     */
    WebSocketPolyfill?: Polyfills["WebSocket"];
} & ({
    publicApiKey: string;
    authEndpoint?: never;
} | {
    publicApiKey?: never;
    authEndpoint: AuthEndpoint;
});
declare type Connection = {
    state: "closed";
} | {
    state: "authenticating";
} | {
    state: "connecting";
    id: number;
    userId?: string;
    userInfo?: Json;
    isReadOnly: boolean;
} | {
    state: "open";
    id: number;
    userId?: string;
    userInfo?: Json;
    isReadOnly: boolean;
} | {
    state: "unavailable";
} | {
    state: "failed";
};
declare type ConnectionState = Connection["state"];
declare type OthersEvent<TPresence extends JsonObject, TUserMeta extends BaseUserMeta> = {
    type: "leave";
    user: User<TPresence, TUserMeta>;
} | {
    type: "enter";
    user: User<TPresence, TUserMeta>;
} | {
    type: "update";
    user: User<TPresence, TUserMeta>;
    updates: Partial<TPresence>;
} | {
    type: "reset";
};
interface History {
    /**
     * Undoes the last operation executed by the current client.
     * It does not impact operations made by other clients.
     *
     * @example
     * room.updatePresence({ selectedId: "xx" }, { addToHistory: true });
     * room.updatePresence({ selectedId: "yy" }, { addToHistory: true });
     * room.history.undo();
     * // room.getPresence() equals { selectedId: "xx" }
     */
    undo: () => void;
    /**
     * Redoes the last operation executed by the current client.
     * It does not impact operations made by other clients.
     *
     * @example
     * room.updatePresence({ selectedId: "xx" }, { addToHistory: true });
     * room.updatePresence({ selectedId: "yy" }, { addToHistory: true });
     * room.history.undo();
     * // room.getPresence() equals { selectedId: "xx" }
     * room.history.redo();
     * // room.getPresence() equals { selectedId: "yy" }
     */
    redo: () => void;
    /**
     * Returns whether there are any operations to undo.
     *
     * @example
     * room.updatePresence({ selectedId: "xx" }, { addToHistory: true });
     * // room.history.canUndo() is true
     * room.history.undo();
     * // room.history.canUndo() is false
     */
    canUndo: () => boolean;
    /**
     * Returns whether there are any operations to redo.
     *
     * @example
     * room.updatePresence({ selectedId: "xx" }, { addToHistory: true });
     * room.history.undo();
     * // room.history.canRedo() is true
     * room.history.redo();
     * // room.history.canRedo() is false
     */
    canRedo: () => boolean;
    /**
     * All future modifications made on the Room will be merged together to create a single history item until resume is called.
     *
     * @example
     * room.updatePresence({ cursor: { x: 0, y: 0 } }, { addToHistory: true });
     * room.history.pause();
     * room.updatePresence({ cursor: { x: 1, y: 1 } }, { addToHistory: true });
     * room.updatePresence({ cursor: { x: 2, y: 2 } }, { addToHistory: true });
     * room.history.resume();
     * room.history.undo();
     * // room.getPresence() equals { cursor: { x: 0, y: 0 } }
     */
    pause: () => void;
    /**
     * Resumes history. Modifications made on the Room are not merged into a single history item anymore.
     *
     * @example
     * room.updatePresence({ cursor: { x: 0, y: 0 } }, { addToHistory: true });
     * room.history.pause();
     * room.updatePresence({ cursor: { x: 1, y: 1 } }, { addToHistory: true });
     * room.updatePresence({ cursor: { x: 2, y: 2 } }, { addToHistory: true });
     * room.history.resume();
     * room.history.undo();
     * // room.getPresence() equals { cursor: { x: 0, y: 0 } }
     */
    resume: () => void;
}
interface HistoryEvent {
    canUndo: boolean;
    canRedo: boolean;
}
declare type Room<TPresence extends JsonObject, TStorage extends LsonObject, TUserMeta extends BaseUserMeta, TRoomEvent extends Json> = {
    /**
     * The id of the room.
     */
    readonly id: string;
    /**
     * A client is considered "self aware" if it knows its own
     * metadata and connection ID (from the auth server).
     */
    isSelfAware(): boolean;
    getConnectionState(): ConnectionState;
    readonly subscribe: {
        /**
         * Subscribe to the current user presence updates.
         *
         * @param listener the callback that is called every time the current user presence is updated with {@link Room.updatePresence}.
         *
         * @returns Unsubscribe function.
         *
         * @example
         * room.subscribe("my-presence", (presence) => {
         *   // Do something
         * });
         */
        (type: "my-presence", listener: Callback<TPresence>): () => void;
        /**
         * Subscribe to the other users updates.
         *
         * @param listener the callback that is called when a user enters or leaves the room or when a user update its presence.
         *
         * @returns Unsubscribe function.
         *
         * @example
         * room.subscribe("others", (others) => {
         *   // Do something
         * });
         *
         */
        (type: "others", listener: (others: Others<TPresence, TUserMeta>, event: OthersEvent<TPresence, TUserMeta>) => void): () => void;
        /**
         * Subscribe to events broadcasted by {@link Room.broadcastEvent}
         *
         * @param listener the callback that is called when a user calls {@link Room.broadcastEvent}
         *
         * @returns Unsubscribe function.
         *
         * @example
         * room.subscribe("event", ({ event, connectionId }) => {
         *   // Do something
         * });
         *
         */
        (type: "event", listener: Callback<CustomEvent<TRoomEvent>>): () => void;
        /**
         * Subscribe to errors thrown in the room.
         *
         * @returns Unsubscribe function.
         *
         */
        (type: "error", listener: ErrorCallback): () => void;
        /**
         * Subscribe to connection state updates.
         *
         * @returns Unsubscribe function.
         *
         */
        (type: "connection", listener: Callback<ConnectionState>): () => void;
        /**
         * Subscribes to changes made on a Live structure. Returns an unsubscribe function.
         * In a future version, we will also expose what exactly changed in the Live structure.
         *
         * @param callback The callback this called when the Live structure changes.
         *
         * @returns Unsubscribe function.
         *
         * @example
         * const liveMap = new LiveMap();  // Could also be LiveList or LiveObject
         * const unsubscribe = room.subscribe(liveMap, (liveMap) => { });
         * unsubscribe();
         */
        <L extends LiveStructure>(liveStructure: L, callback: (node: L) => void): () => void;
        /**
         * Subscribes to changes made on a Live structure and all the nested data
         * structures. Returns an unsubscribe function. In a future version, we
         * will also expose what exactly changed in the Live structure.
         *
         * @param callback The callback this called when the Live structure, or any
         * of its nested values, changes.
         *
         * @returns Unsubscribe function.
         *
         * @example
         * const liveMap = new LiveMap();  // Could also be LiveList or LiveObject
         * const unsubscribe = room.subscribe(liveMap, (updates) => { }, { isDeep: true });
         * unsubscribe();
         */
        <L extends LiveStructure>(liveStructure: L, callback: StorageCallback, options: {
            isDeep: true;
        }): () => void;
        /**
         * Subscribe to the current user's history changes.
         *
         * @returns Unsubscribe function.
         *
         * @example
         * room.subscribe("history", ({ canUndo, canRedo }) => {
         *   // Do something
         * });
         *
         */
        (type: "history", listener: Callback<HistoryEvent>): () => void;
    };
    /**
     * Room's history contains functions that let you undo and redo operation made on by the current client on the presence and storage.
     */
    readonly history: History;
    /**
     * Gets the current user.
     * Returns null if not it is not yet connected to the room.
     *
     * @example
     * const user = room.getSelf();
     */
    getSelf(): User<TPresence, TUserMeta> | null;
    /**
     * Gets the presence of the current user.
     *
     * @example
     * const presence = room.getPresence();
     */
    getPresence(): TPresence;
    /**
     * Gets all the other users in the room.
     *
     * @example
     * const others = room.getOthers();
     */
    getOthers(): Others<TPresence, TUserMeta>;
    /**
     * Updates the presence of the current user. Only pass the properties you want to update. No need to send the full presence.
     * @param patch A partial object that contains the properties you want to update.
     * @param options Optional object to configure the behavior of updatePresence.
     *
     * @example
     * room.updatePresence({ x: 0 });
     * room.updatePresence({ y: 0 });
     *
     * const presence = room.getPresence();
     * // presence is equivalent to { x: 0, y: 0 }
     */
    updatePresence(patch: Partial<TPresence>, options?: {
        /**
         * Whether or not the presence should have an impact on the undo/redo history.
         */
        addToHistory: boolean;
    }): void;
    /**
     * Broadcasts an event to other users in the room. Event broadcasted to the room can be listened with {@link Room.subscribe}("event").
     * @param {any} event the event to broadcast. Should be serializable to JSON
     *
     * @example
     * // On client A
     * room.broadcastEvent({ type: "EMOJI", emoji: "🔥" });
     *
     * // On client B
     * room.subscribe("event", ({ event }) => {
     *   if(event.type === "EMOJI") {
     *     // Do something
     *   }
     * });
     */
    broadcastEvent(event: TRoomEvent, options?: BroadcastOptions): void;
    /**
     * Get the room's storage asynchronously.
     * The storage's root is a {@link LiveObject}.
     *
     * @example
     * const { root } = await room.getStorage();
     */
    getStorage(): Promise<{
        root: LiveObject<TStorage>;
    }>;
    /**
     * Get the room's storage synchronously.
     * The storage's root is a {@link LiveObject}.
     *
     * @example
     * const root = room.getStorageSnapshot();
     */
    getStorageSnapshot(): LiveObject<TStorage> | null;
    readonly events: {
        customEvent: Observable<{
            connectionId: number;
            event: TRoomEvent;
        }>;
        me: Observable<TPresence>;
        others: Observable<{
            others: Others<TPresence, TUserMeta>;
            event: OthersEvent<TPresence, TUserMeta>;
        }>;
        error: Observable<Error>;
        connection: Observable<ConnectionState>;
        storage: Observable<StorageUpdate[]>;
        history: Observable<HistoryEvent>;
        /**
         * Subscribe to the storage loaded event. Will fire at most once during the
         * lifetime of a Room.
         */
        storageDidLoad: Observable<void>;
    };
    /**
     * Batches modifications made during the given function.
     * All the modifications are sent to other clients in a single message.
     * All the subscribers are called only after the batch is over.
     * All the modifications are merged in a single history item (undo/redo).
     *
     * @example
     * const { root } = await room.getStorage();
     * room.batch(() => {
     *   root.set("x", 0);
     *   room.updatePresence({ cursor: { x: 100, y: 100 }});
     * });
     */
    batch<T>(fn: () => T): T;
};
declare enum WebsocketCloseCodes {
    CLOSE_ABNORMAL = 1006,
    INVALID_MESSAGE_FORMAT = 4000,
    NOT_ALLOWED = 4001,
    MAX_NUMBER_OF_MESSAGES_PER_SECONDS = 4002,
    MAX_NUMBER_OF_CONCURRENT_CONNECTIONS = 4003,
    MAX_NUMBER_OF_MESSAGES_PER_DAY_PER_APP = 4004,
    MAX_NUMBER_OF_CONCURRENT_CONNECTIONS_PER_ROOM = 4005,
    CLOSE_WITHOUT_RETRY = 4999
}

declare type AppOnlyAuthToken = {
    appId: string;
    roomId?: never;
    scopes: string[];
};
declare type RoomAuthToken = {
    appId: string;
    roomId: string;
    scopes: string[];
    actor: number;
    maxConnectionsPerRoom?: number;
    id?: string;
    info?: Json;
};
declare type AuthToken = AppOnlyAuthToken | RoomAuthToken;
declare function isAppOnlyAuthToken(data: JsonObject): data is AppOnlyAuthToken;
declare function isRoomAuthToken(data: JsonObject): data is RoomAuthToken;
declare function isAuthToken(data: JsonObject): data is AuthToken;

/**
 * Create a client that will be responsible to communicate with liveblocks servers.
 *
 * @example
 * const client = createClient({
 *   authEndpoint: "/api/auth"
 * });
 *
 * // It's also possible to use a function to call your authentication endpoint.
 * // Useful to add additional headers or use an API wrapper (like Firebase functions)
 * const client = createClient({
 *   authEndpoint: async (room) => {
 *     const response = await fetch("/api/auth", {
 *       method: "POST",
 *       headers: {
 *          Authentication: "token",
 *          "Content-Type": "application/json"
 *       },
 *       body: JSON.stringify({ room })
 *     });
 *
 *     return await response.json(); // should be: { token: "..." }
 *   }
 * });
 */
declare function createClient(options: ClientOptions): Client;

/**
 * Displays a deprecation warning in the dev console. Only in dev mode, and
 * only once per message/key. In production, this is a no-op.
 */
declare function deprecate(message: string, key?: string): void;
/**
 * Conditionally displays a deprecation warning in the dev
 * console if the first argument is truthy. Only in dev mode, and
 * only once per message/key. In production, this is a no-op.
 */
declare function deprecateIf(condition: unknown, message: string, key?: string): void;
/**
 * Throws a deprecation error in the dev console.
 *
 * Only triggers in dev mode. In production, this is a no-op.
 */
declare function throwUsageError(message: string): void;
/**
 * Conditionally throws a usage error in the dev console if the first argument
 * is truthy. Use this to "escalate" usage patterns that in previous versions
 * we already warned about with deprecation warnings.
 *
 * Only has effect in dev mode. In production, this is a no-op.
 */
declare function errorIf(condition: unknown, message: string): void;

declare function lsonToJson(value: Lson): Json;
declare function patchLiveObjectKey<O extends LsonObject, K extends keyof O, V extends Lson>(liveObject: LiveObject<O>, key: K, prev?: V, next?: V): void;
declare function legacy_patchImmutableObject<S extends JsonObject>(state: S, updates: StorageUpdate[]): S;

declare function makePosition(before?: string, after?: string): string;
declare function comparePosition(posA: string, posB: string): number;

/**
 * Shallowly compares two given values.
 *
 * - Two simple values are considered equal if they're strictly equal
 * - Two arrays are considered equal if their members are strictly equal
 * - Two objects are considered equal if their values are strictly equal
 *
 * Testing goes one level deep.
 */
declare function shallow(a: unknown, b: unknown): boolean;

/**
 * Freezes the given argument, but only in development builds. In production
 * builds, this is a no-op for performance reasons.
 */
declare const freeze: typeof Object.freeze;
declare function isPlainObject(blob: unknown): blob is {
    [key: string]: unknown;
};
/**
 * Alternative to JSON.parse() that will not throw in production. If the passed
 * string cannot be parsed, this will return `undefined`.
 */
declare function tryParseJson(rawMessage: string): Json | undefined;
/**
 * Decode base64 string.
 */
declare function b64decode(b64value: string): string;

/**
 * PRIVATE / INTERNAL APIS
 * -----------------------
 *
 * This module is intended for internal use only, PLEASE DO NOT RELY ON ANY OF
 * THE EXPORTS IN HERE. These are implementation details that can change at any
 * time and without announcement. This module purely exists to share code
 * between the several Liveblocks packages.
 *
 * But since you're so deep inside Liveblocks code... we're hiring!
 * https://join.team/liveblocks ;)
 */

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

export { AppOnlyAuthToken, AuthToken, BaseUserMeta, BroadcastEventClientMsg, BroadcastOptions, BroadcastedEventServerMsg, Client, ClientMsg, ClientMsgCode, CrdtType, CreateChildOp, CreateListOp, CreateMapOp, CreateObjectOp, CreateOp, CreateRegisterOp, CreateRootObjectOp, DeleteCrdtOp, DeleteObjectKeyOp, EnsureJson, FetchStorageClientMsg, History, IdTuple, Immutable, InitialDocumentStateServerMsg, Json, JsonObject, LiveList, LiveMap, LiveNode, LiveObject, LiveStructure, Lson, LsonObject, NodeMap, Op, OpCode, Others, ParentToChildNodeMap, Resolve, Room, RoomAuthToken, RoomInitializers, RoomStateServerMsg, SerializedChild, SerializedCrdt, SerializedList, SerializedMap, SerializedObject, SerializedRegister, SerializedRootObject, ServerMsg, ServerMsgCode, SetParentKeyOp, StorageUpdate, ToImmutable, ToJson, UpdateObjectOp, UpdatePresenceClientMsg, UpdatePresenceServerMsg, UpdateStorageClientMsg, UpdateStorageServerMsg, User, UserJoinServerMsg, UserLeftServerMsg, WebsocketCloseCodes, asArrayWithLegacyMethods, assertNever, b64decode, comparePosition, createClient, deprecate, deprecateIf, errorIf, freeze, isAppOnlyAuthToken, isAuthToken, isChildCrdt, isJsonArray, isJsonObject, isJsonScalar, isPlainObject, isRoomAuthToken, isRootCrdt, legacy_patchImmutableObject, lsonToJson, makePosition, nn, patchLiveObjectKey, shallow, throwUsageError, tryParseJson };
