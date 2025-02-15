"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }// src/ClientSideSuspense.tsx
var _react = require('react'); var React = _interopRequireWildcard(_react); var React2 = _interopRequireWildcard(_react);
function ClientSideSuspense(props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);
  return /* @__PURE__ */ React.createElement(React.Suspense, {
    fallback: props.fallback
  }, mounted ? props.children() : props.fallback);
}

// src/factory.tsx
var _client = require('@liveblocks/client');




var _core = require('@liveblocks/core');

var _withselector = require('use-sync-external-store/shim/with-selector');

// src/hooks.ts

function useRerender() {
  const [, update] = _react.useReducer.call(void 0, 
    (x) => x + 1,
    0
  );
  return update;
}
function useInitial(value) {
  return _react.useRef.call(void 0, value).current;
}

// src/factory.tsx
var noop = () => {
};
var identity = (x) => x;
var missing_unstable_batchedUpdates = (reactVersion, roomId) => `We noticed you\u2019re using React ${reactVersion}. Please pass unstable_batchedUpdates at the RoomProvider level until you\u2019re ready to upgrade to React 18:

    import { unstable_batchedUpdates } from "react-dom";  // or "react-native"

    <RoomProvider id=${JSON.stringify(
  roomId
)} ... unstable_batchedUpdates={unstable_batchedUpdates}>
      ...
    </RoomProvider>

Why? Please see https://liveblocks.io/docs/guides/troubleshooting#stale-props-zombie-child for more information`;
var superfluous_unstable_batchedUpdates = "You don\u2019t need to pass unstable_batchedUpdates to RoomProvider anymore, since you\u2019re on React 18+ already.";
function useSyncExternalStore(s, gs, gss) {
  return _withselector.useSyncExternalStoreWithSelector.call(void 0, s, gs, gss, identity);
}
var EMPTY_OTHERS = _core.asArrayWithLegacyMethods.call(void 0, []);
function getEmptyOthers() {
  return EMPTY_OTHERS;
}
function makeMutationContext(room) {
  const errmsg = "This mutation cannot be used until connected to the Liveblocks room";
  return {
    get storage() {
      const mutableRoot = room.getStorageSnapshot();
      if (mutableRoot === null) {
        throw new Error(errmsg);
      }
      return mutableRoot;
    },
    get self() {
      const self = room.getSelf();
      if (self === null) {
        throw new Error(errmsg);
      }
      return self;
    },
    get others() {
      const others = room.getOthers();
      if (!room.isSelfAware()) {
        throw new Error(errmsg);
      }
      return others;
    },
    setMyPresence: room.updatePresence
  };
}
function createRoomContext(client) {
  const RoomContext = React2.createContext(null);
  function RoomProvider(props) {
    const {
      id: roomId,
      initialPresence,
      initialStorage,
      unstable_batchedUpdates,
      shouldInitiallyConnect
    } = props;
    if (process.env.NODE_ENV !== "production") {
      if (!roomId) {
        throw new Error(
          "RoomProvider id property is required. For more information: https://liveblocks.io/docs/errors/liveblocks-react/RoomProvider-id-property-is-required"
        );
      }
      if (typeof roomId !== "string") {
        throw new Error("RoomProvider id property should be a string.");
      }
      const majorReactVersion = parseInt(React2.version) || 1;
      const oldReactVersion = majorReactVersion < 18;
      _core.errorIf.call(void 0, 
        oldReactVersion && props.unstable_batchedUpdates === void 0,
        missing_unstable_batchedUpdates(majorReactVersion, roomId)
      );
      _core.deprecateIf.call(void 0, 
        !oldReactVersion && props.unstable_batchedUpdates !== void 0,
        superfluous_unstable_batchedUpdates
      );
    }
    const frozen = useInitial({
      initialPresence,
      initialStorage,
      unstable_batchedUpdates,
      shouldInitiallyConnect: shouldInitiallyConnect === void 0 ? typeof window !== "undefined" : shouldInitiallyConnect
    });
    const [room, setRoom] = React2.useState(
      () => client.enter(roomId, {
        initialPresence: frozen.initialPresence,
        initialStorage: frozen.initialStorage,
        unstable_batchedUpdates: frozen.unstable_batchedUpdates,
        shouldInitiallyConnect: frozen.shouldInitiallyConnect
      })
    );
    React2.useEffect(() => {
      setRoom(
        client.enter(roomId, {
          initialPresence: frozen.initialPresence,
          initialStorage: frozen.initialStorage,
          unstable_batchedUpdates: frozen.unstable_batchedUpdates,
          withoutConnecting: frozen.shouldInitiallyConnect
        })
      );
      return () => {
        client.leave(roomId);
      };
    }, [roomId, frozen]);
    return /* @__PURE__ */ React2.createElement(RoomContext.Provider, {
      value: room
    }, props.children);
  }
  function connectionIdSelector(others) {
    return others.map((user) => user.connectionId);
  }
  function useRoom() {
    const room = React2.useContext(RoomContext);
    if (room === null) {
      throw new Error("RoomProvider is missing from the react tree");
    }
    return room;
  }
  function useMyPresence() {
    const room = useRoom();
    const subscribe = room.events.me.subscribe;
    const getSnapshot = room.getPresence;
    const presence = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    const setPresence = room.updatePresence;
    return [presence, setPresence];
  }
  function useUpdateMyPresence() {
    return useRoom().updatePresence;
  }
  function useOthers(selector, isEqual) {
    const room = useRoom();
    const subscribe = room.events.others.subscribe;
    const getSnapshot = room.getOthers;
    const getServerSnapshot = getEmptyOthers;
    return _withselector.useSyncExternalStoreWithSelector.call(void 0, 
      subscribe,
      getSnapshot,
      getServerSnapshot,
      selector != null ? selector : identity,
      isEqual
    );
  }
  function useOthersConnectionIds() {
    return useOthers(connectionIdSelector, _client.shallow);
  }
  function useOthersMapped(itemSelector, itemIsEqual) {
    const wrappedSelector = React2.useCallback(
      (others) => others.map(
        (other) => [other.connectionId, itemSelector(other)]
      ),
      [itemSelector]
    );
    const wrappedIsEqual = React2.useCallback(
      (a, b) => {
        const eq = itemIsEqual != null ? itemIsEqual : Object.is;
        return a.length === b.length && a.every((atuple, index) => {
          const btuple = b[index];
          return atuple[0] === btuple[0] && eq(atuple[1], btuple[1]);
        });
      },
      [itemIsEqual]
    );
    return useOthers(wrappedSelector, wrappedIsEqual);
  }
  const NOT_FOUND = Symbol();
  function useOther(connectionId, selector, isEqual) {
    const wrappedSelector = React2.useCallback(
      (others) => {
        const other2 = others.find(
          (other3) => other3.connectionId === connectionId
        );
        return other2 !== void 0 ? selector(other2) : NOT_FOUND;
      },
      [connectionId, selector]
    );
    const wrappedIsEqual = React2.useCallback(
      (prev, curr) => {
        if (prev === NOT_FOUND || curr === NOT_FOUND) {
          return prev === curr;
        }
        const eq = isEqual != null ? isEqual : Object.is;
        return eq(prev, curr);
      },
      [isEqual]
    );
    const other = useOthers(wrappedSelector, wrappedIsEqual);
    if (other === NOT_FOUND) {
      throw new Error(
        `No such other user with connection id ${connectionId} exists`
      );
    }
    return other;
  }
  function useBroadcastEvent() {
    const room = useRoom();
    return React2.useCallback(
      (event, options = { shouldQueueEventIfNotReady: false }) => {
        room.broadcastEvent(event, options);
      },
      [room]
    );
  }
  function useErrorListener(callback) {
    const room = useRoom();
    const savedCallback = React2.useRef(callback);
    React2.useEffect(() => {
      savedCallback.current = callback;
    });
    React2.useEffect(
      () => room.events.error.subscribe((e) => savedCallback.current(e)),
      [room]
    );
  }
  function useEventListener(callback) {
    const room = useRoom();
    const savedCallback = React2.useRef(callback);
    React2.useEffect(() => {
      savedCallback.current = callback;
    });
    React2.useEffect(() => {
      const listener = (eventData) => {
        savedCallback.current(eventData);
      };
      return room.events.customEvent.subscribe(listener);
    }, [room]);
  }
  function useSelf(maybeSelector, isEqual) {
    const room = useRoom();
    const subscribe = React2.useCallback(
      (onChange) => {
        const unsub1 = room.events.me.subscribe(onChange);
        const unsub2 = room.events.connection.subscribe(onChange);
        return () => {
          unsub1();
          unsub2();
        };
      },
      [room]
    );
    const getSnapshot = room.getSelf;
    const selector = maybeSelector != null ? maybeSelector : identity;
    const wrappedSelector = React2.useCallback(
      (me) => me !== null ? selector(me) : null,
      [selector]
    );
    const getServerSnapshot = React2.useCallback(() => null, []);
    return _withselector.useSyncExternalStoreWithSelector.call(void 0, 
      subscribe,
      getSnapshot,
      getServerSnapshot,
      wrappedSelector,
      isEqual
    );
  }
  function useMutableStorageRoot() {
    const room = useRoom();
    const subscribe = room.events.storageDidLoad.subscribeOnce;
    const getSnapshot = room.getStorageSnapshot;
    const getServerSnapshot = React2.useCallback(() => null, []);
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  }
  function useStorageRoot() {
    return [useMutableStorageRoot()];
  }
  function useHistory() {
    return useRoom().history;
  }
  function useUndo() {
    return useHistory().undo;
  }
  function useRedo() {
    return useHistory().redo;
  }
  function useCanUndo() {
    const room = useRoom();
    const subscribe = room.events.history.subscribe;
    const canUndo = room.history.canUndo;
    return useSyncExternalStore(subscribe, canUndo, canUndo);
  }
  function useCanRedo() {
    const room = useRoom();
    const subscribe = room.events.history.subscribe;
    const canRedo = room.history.canRedo;
    return useSyncExternalStore(subscribe, canRedo, canRedo);
  }
  function useBatch() {
    return useRoom().batch;
  }
  function useLegacyKey(key) {
    const room = useRoom();
    const root = useMutableStorageRoot();
    const rerender = useRerender();
    React2.useEffect(() => {
      if (root === null) {
        return;
      }
      let liveValue = root.get(key);
      function onRootChange() {
        const newCrdt = root.get(key);
        if (newCrdt !== liveValue) {
          unsubscribeCrdt();
          liveValue = newCrdt;
          unsubscribeCrdt = room.subscribe(
            liveValue,
            rerender
          );
          rerender();
        }
      }
      let unsubscribeCrdt = room.subscribe(
        liveValue,
        rerender
      );
      const unsubscribeRoot = room.subscribe(
        root,
        onRootChange
      );
      rerender();
      return () => {
        unsubscribeRoot();
        unsubscribeCrdt();
      };
    }, [root, room, key, rerender]);
    if (root === null) {
      return null;
    } else {
      return root.get(key);
    }
  }
  function useStorage(selector, isEqual) {
    const room = useRoom();
    const rootOrNull = useMutableStorageRoot();
    const wrappedSelector = React2.useCallback(
      (rootOrNull2) => rootOrNull2 !== null ? selector(rootOrNull2) : null,
      [selector]
    );
    const subscribe = React2.useCallback(
      (onStoreChange) => rootOrNull !== null ? room.subscribe(rootOrNull, onStoreChange, { isDeep: true }) : noop,
      [room, rootOrNull]
    );
    const getSnapshot = React2.useCallback(() => {
      if (rootOrNull === null) {
        return null;
      } else {
        const root = rootOrNull;
        const imm = root.toImmutable();
        return imm;
      }
    }, [rootOrNull]);
    const getServerSnapshot = React2.useCallback(() => null, []);
    return _withselector.useSyncExternalStoreWithSelector.call(void 0, 
      subscribe,
      getSnapshot,
      getServerSnapshot,
      wrappedSelector,
      isEqual
    );
  }
  function ensureNotServerSide() {
    if (typeof window === "undefined") {
      throw new Error(
        "You cannot use the Suspense version of this hook on the server side. Make sure to only call them on the client side.\nFor tips, see https://liveblocks.io/docs/api-reference/liveblocks-react#suspense-avoid-ssr"
      );
    }
  }
  function useSuspendUntilStorageLoaded() {
    const room = useRoom();
    if (room.getStorageSnapshot() !== null) {
      return;
    }
    ensureNotServerSide();
    throw new Promise((res) => {
      room.events.storageDidLoad.subscribeOnce(() => res());
    });
  }
  function useSuspendUntilPresenceLoaded() {
    const room = useRoom();
    if (room.isSelfAware()) {
      return;
    }
    ensureNotServerSide();
    throw new Promise((res) => {
      room.events.connection.subscribeOnce(() => res());
    });
  }
  function useMutation(callback, deps) {
    const room = useRoom();
    return React2.useMemo(
      () => {
        return (...args) => room.batch(
          () => callback(makeMutationContext(room), ...args)
        );
      },
      [room, ...deps]
    );
  }
  function useStorageSuspense(selector, isEqual) {
    useSuspendUntilStorageLoaded();
    return useStorage(
      selector,
      isEqual
    );
  }
  function useSelfSuspense(selector, isEqual) {
    useSuspendUntilPresenceLoaded();
    return useSelf(
      selector,
      isEqual
    );
  }
  function useOthersSuspense(selector, isEqual) {
    useSuspendUntilPresenceLoaded();
    return useOthers(
      selector,
      isEqual
    );
  }
  function useOthersConnectionIdsSuspense() {
    useSuspendUntilPresenceLoaded();
    return useOthersConnectionIds();
  }
  function useOthersMappedSuspense(itemSelector, itemIsEqual) {
    useSuspendUntilPresenceLoaded();
    return useOthersMapped(itemSelector, itemIsEqual);
  }
  function useOtherSuspense(connectionId, selector, isEqual) {
    useSuspendUntilPresenceLoaded();
    return useOther(connectionId, selector, isEqual);
  }
  function useLegacyKeySuspense(key) {
    useSuspendUntilStorageLoaded();
    return useLegacyKey(key);
  }
  return {
    RoomContext,
    RoomProvider,
    useRoom,
    useBatch,
    useBroadcastEvent,
    useErrorListener,
    useEventListener,
    useHistory,
    useUndo,
    useRedo,
    useCanRedo,
    useCanUndo,
    useList: useLegacyKey,
    useMap: useLegacyKey,
    useObject: useLegacyKey,
    useStorageRoot,
    useStorage,
    useSelf,
    useMyPresence,
    useUpdateMyPresence,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useMutation,
    suspense: {
      RoomContext,
      RoomProvider,
      useRoom,
      useBatch,
      useBroadcastEvent,
      useErrorListener,
      useEventListener,
      useHistory,
      useUndo,
      useRedo,
      useCanRedo,
      useCanUndo,
      useList: useLegacyKeySuspense,
      useMap: useLegacyKeySuspense,
      useObject: useLegacyKeySuspense,
      useStorageRoot,
      useStorage: useStorageSuspense,
      useSelf: useSelfSuspense,
      useMyPresence,
      useUpdateMyPresence,
      useOthers: useOthersSuspense,
      useOthersMapped: useOthersMappedSuspense,
      useOthersConnectionIds: useOthersConnectionIdsSuspense,
      useOther: useOtherSuspense,
      useMutation
    }
  };
}

// src/index.ts





exports.ClientSideSuspense = ClientSideSuspense; exports.createRoomContext = createRoomContext; exports.shallow = _client.shallow;
