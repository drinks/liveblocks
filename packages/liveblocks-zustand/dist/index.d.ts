import { JsonObject, LsonObject, BaseUserMeta, Json, Room, User, Client } from '@liveblocks/client';
import { StateCreator, SetState, GetState, StoreApi } from 'zustand';

declare type ZustandState = Record<string, unknown>;
declare type LiveblocksContext<TState extends ZustandState, TPresence extends JsonObject, TStorage extends LsonObject, TUserMeta extends BaseUserMeta, TRoomEvent extends Json> = {
    /**
     * Enters a room and starts sync it with zustand state
     * @param roomId The id of the room
     * @param initialState The initial state of the room storage. If a key does not exist if your room storage root, initialState[key] will be used.
     */
    readonly enterRoom: (roomId: string, initialState: Partial<TState>) => void;
    /**
     * Leaves a room and stops sync it with zustand state.
     * @param roomId The id of the room
     */
    readonly leaveRoom: (roomId: string) => void;
    /**
     * The room currently synced to your zustand state.
     */
    readonly room: Room<TPresence, TStorage, TUserMeta, TRoomEvent> | null;
    /**
     * Other users in the room. Empty no room is currently synced
     */
    readonly others: readonly User<TPresence, TUserMeta>[];
    /**
     * Whether or not the room storage is currently loading
     */
    readonly isStorageLoading: boolean;
    /**
     * Connection state of the room
     */
    readonly connection: "closed" | "authenticating" | "unavailable" | "failed" | "open" | "connecting";
};
declare type LiveblocksState<TState extends ZustandState, TPresence extends JsonObject = JsonObject, TStorage extends LsonObject = LsonObject, TUserMeta extends BaseUserMeta = BaseUserMeta, TRoomEvent extends Json = Json> = TState & {
    /**
     * Liveblocks extra state attached by the middleware
     */
    readonly liveblocks: LiveblocksContext<TState, TPresence, TStorage, TUserMeta, TRoomEvent>;
};
declare type Mapping<T> = {
    [K in keyof T]?: boolean;
};
declare type Options<T> = {
    /**
     * Liveblocks client created by @liveblocks/client createClient
     */
    client: Client;
    /**
     * Mapping used to synchronize a part of your zustand state with one Liveblocks Room storage.
     */
    storageMapping?: Mapping<T>;
    /**
     * Mapping used to synchronize a part of your zustand state with one Liveblocks Room presence.
     */
    presenceMapping?: Mapping<T>;
};
declare function middleware<T extends ZustandState, TPresence extends JsonObject = JsonObject, TStorage extends LsonObject = LsonObject, TUserMeta extends BaseUserMeta = BaseUserMeta, TRoomEvent extends Json = Json>(config: StateCreator<T, SetState<T>, GetState<LiveblocksState<T, TPresence, TStorage, TUserMeta, TRoomEvent>>, StoreApi<T>>, options: Options<T>): StateCreator<LiveblocksState<T, TPresence, TStorage, TUserMeta, TRoomEvent>, SetState<LiveblocksState<T, TPresence, TStorage, TUserMeta, TRoomEvent>>, GetState<LiveblocksState<T, TPresence, TStorage, TUserMeta, TRoomEvent>>, StoreApi<LiveblocksState<T, TPresence, TStorage, TUserMeta, TRoomEvent>>>;

export { LiveblocksContext, LiveblocksState, Mapping, ZustandState, middleware };
