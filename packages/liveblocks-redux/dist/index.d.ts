import { JsonObject, BaseUserMeta, User, Client } from '@liveblocks/client';
import { StoreEnhancer } from 'redux';

declare type Mapping<T> = {
    [K in keyof T]?: boolean;
};
declare type LiveblocksState<TState, TPresence extends JsonObject, TUserMeta extends BaseUserMeta> = TState & {
    /**
     * Liveblocks extra state attached by the enhancer
     */
    readonly liveblocks: {
        /**
         * Other users in the room. Empty no room is currently synced
         */
        readonly others: Array<User<TPresence, TUserMeta>>;
        /**
         * Whether or not the room storage is currently loading
         */
        readonly isStorageLoading: boolean;
        /**
         * Connection state of the room
         */
        readonly connection: "closed" | "authenticating" | "unavailable" | "failed" | "open" | "connecting";
    };
};
/**
 * Actions used to interact with Liveblocks
 */
declare const actions: {
    /**
     * Enters a room and starts sync it with zustand state
     * @param roomId The id of the room
     * @param initialState The initial state of the room storage. If a key does not exist if your room storage root, initialState[key] will be used.
     */
    enterRoom: typeof enterRoom;
    /**
     * Leaves a room and stops sync it with zustand state.
     * @param roomId The id of the room
     */
    leaveRoom: typeof leaveRoom;
};
declare function enterRoom<T>(roomId: string, initialState?: T): {
    type: string;
    roomId: string;
    initialState?: T;
};
declare function leaveRoom(roomId: string): {
    type: string;
    roomId: string;
};
declare const enhancer: <T>(options: {
    client: Client;
    storageMapping?: Mapping<T> | undefined;
    presenceMapping?: Mapping<T> | undefined;
}) => StoreEnhancer;

export { LiveblocksState, Mapping, actions, enhancer };
