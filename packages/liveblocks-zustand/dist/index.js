"use strict";Object.defineProperty(exports, "__esModule", {value: true});var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/index.ts





var _core = require('@liveblocks/core');
var ERROR_PREFIX = "Invalid @liveblocks/zustand middleware config.";
function mappingToFunctionIsNotAllowed(key) {
  return new Error(
    `${ERROR_PREFIX} mapping.${key} is invalid. Mapping to a function is not allowed.`
  );
}
function isJson(value) {
  return value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean" || Array.isArray(value) && value.every(isJson) || typeof value === "object" && Object.values(value).every(isJson);
}
function middleware(config, options) {
  const { client, presenceMapping, storageMapping } = validateOptions(options);
  return (set, get, api) => {
    const typedSet = set;
    let room = null;
    let isPatching = false;
    let storageRoot = null;
    let unsubscribeCallbacks = [];
    function enterRoom(roomId, initialState) {
      if (storageRoot) {
        return;
      }
      room = client.enter(roomId, { initialPresence: {} });
      updateZustandLiveblocksState(set, {
        isStorageLoading: true,
        room
      });
      const state = get();
      broadcastInitialPresence(room, state, presenceMapping);
      unsubscribeCallbacks.push(
        room.events.others.subscribe(({ others }) => {
          updateZustandLiveblocksState(set, { others });
        })
      );
      unsubscribeCallbacks.push(
        room.events.connection.subscribe(() => {
          updateZustandLiveblocksState(set, {
            connection: room.getConnectionState()
          });
        })
      );
      unsubscribeCallbacks.push(
        room.events.me.subscribe(() => {
          if (isPatching === false) {
            set(
              patchPresenceState(room.getPresence(), presenceMapping)
            );
          }
        })
      );
      room.getStorage().then(({ root }) => {
        const updates = {};
        room.batch(() => {
          for (const key in storageMapping) {
            const liveblocksStatePart = root.get(key);
            if (liveblocksStatePart == null) {
              updates[key] = initialState[key];
              _core.patchLiveObjectKey.call(void 0, root, key, void 0, initialState[key]);
            } else {
              updates[key] = _core.lsonToJson.call(void 0, liveblocksStatePart);
            }
          }
        });
        typedSet(updates);
        storageRoot = root;
        unsubscribeCallbacks.push(
          room.subscribe(
            root,
            (updates2) => {
              if (isPatching === false) {
                set(patchState(get(), updates2, storageMapping));
              }
            },
            { isDeep: true }
          )
        );
        updateZustandLiveblocksState(set, { isStorageLoading: false });
      });
    }
    function leaveRoom(roomId) {
      for (const unsubscribe of unsubscribeCallbacks) {
        unsubscribe();
      }
      storageRoot = null;
      room = null;
      isPatching = false;
      unsubscribeCallbacks = [];
      client.leave(roomId);
      updateZustandLiveblocksState(set, {
        others: [],
        connection: "closed",
        isStorageLoading: false,
        room: null
      });
    }
    const store = config(
      (args) => {
        const oldState = get();
        set(args);
        const newState = get();
        if (room) {
          isPatching = true;
          updatePresence(
            room,
            oldState,
            newState,
            presenceMapping
          );
          room.batch(() => {
            if (storageRoot) {
              patchLiveblocksStorage(
                storageRoot,
                oldState,
                newState,
                storageMapping
              );
            }
          });
          isPatching = false;
        }
      },
      get,
      api
    );
    return __spreadProps(__spreadValues({}, store), {
      liveblocks: {
        enterRoom,
        leaveRoom,
        room: null,
        others: [],
        connection: "closed",
        isStorageLoading: false
      }
    });
  };
}
function patchState(state, updates, mapping) {
  const partialState = {};
  for (const key in mapping) {
    partialState[key] = state[key];
  }
  const patched = _core.legacy_patchImmutableObject.call(void 0, partialState, updates);
  const result = {};
  for (const key in mapping) {
    result[key] = patched[key];
  }
  return result;
}
function patchPresenceState(presence, mapping) {
  const partialState = {};
  for (const key in mapping) {
    partialState[key] = presence[key];
  }
  return partialState;
}
function updateZustandLiveblocksState(set, partial) {
  set((state) => ({ liveblocks: __spreadValues(__spreadValues({}, state.liveblocks), partial) }));
}
function broadcastInitialPresence(room, state, mapping) {
  for (const key in mapping) {
    room == null ? void 0 : room.updatePresence({ [key]: state[key] });
  }
}
function updatePresence(room, oldState, newState, presenceMapping) {
  for (const key in presenceMapping) {
    if (typeof newState[key] === "function") {
      throw mappingToFunctionIsNotAllowed(key);
    }
    if (oldState[key] !== newState[key]) {
      const val = newState[key];
      room.updatePresence({ [key]: val });
    }
  }
}
function patchLiveblocksStorage(root, oldState, newState, mapping) {
  for (const key in mapping) {
    if (process.env.NODE_ENV !== "production" && typeof newState[key] === "function") {
      throw mappingToFunctionIsNotAllowed(key);
    }
    if (oldState[key] !== newState[key]) {
      const oldVal = oldState[key];
      const newVal = newState[key];
      if ((oldVal === void 0 || isJson(oldVal)) && (newVal === void 0 || isJson(newVal))) {
        _core.patchLiveObjectKey.call(void 0, root, key, oldVal, newVal);
      }
    }
  }
}
function isObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function validateNoDuplicateKeys(storageMapping, presenceMapping) {
  for (const key in storageMapping) {
    if (presenceMapping[key] !== void 0) {
      throw new Error(
        `${ERROR_PREFIX} "${key}" is mapped on both presenceMapping and storageMapping. A key shouldn't exist on both mapping.`
      );
    }
  }
}
function validateMapping(mapping, mappingType) {
  _core.errorIf.call(void 0, 
    !isObject(mapping),
    `${ERROR_PREFIX} ${mappingType} should be an object where the values are boolean.`
  );
  const result = {};
  for (const key in mapping) {
    _core.errorIf.call(void 0, 
      typeof mapping[key] !== "boolean",
      `${ERROR_PREFIX} ${mappingType}.${key} value should be a boolean`
    );
    if (mapping[key] === true) {
      result[key] = true;
    }
  }
  return result;
}
function validateOptions(options) {
  var _a, _b;
  const client = options.client;
  _core.errorIf.call(void 0, !client, `${ERROR_PREFIX} client is missing`);
  const storageMapping = validateMapping(
    (_a = options.storageMapping) != null ? _a : {},
    "storageMapping"
  );
  const presenceMapping = validateMapping(
    (_b = options.presenceMapping) != null ? _b : {},
    "presenceMapping"
  );
  if (process.env.NODE_ENV !== "production") {
    validateNoDuplicateKeys(storageMapping, presenceMapping);
  }
  return { client, storageMapping, presenceMapping };
}


exports.middleware = middleware;
