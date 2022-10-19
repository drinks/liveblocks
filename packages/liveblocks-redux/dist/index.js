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

// src/errors.ts
var ERROR_PREFIX = "Invalid @liveblocks/redux middleware config.";
function missingClient() {
  return new Error(`${ERROR_PREFIX} client is missing`);
}
function mappingShouldBeAnObject(mappingType) {
  return new Error(
    `${ERROR_PREFIX} ${mappingType} should be an object where the values are boolean.`
  );
}
function mappingValueShouldBeABoolean(mappingType, key) {
  return new Error(
    `${ERROR_PREFIX} ${mappingType}.${key} value should be a boolean`
  );
}
function mappingShouldNotHaveTheSameKeys(key) {
  return new Error(
    `${ERROR_PREFIX} "${key}" is mapped on presenceMapping and storageMapping. A key shouldn't exist on both mapping.`
  );
}
function mappingToFunctionIsNotAllowed(key) {
  return new Error(
    `${ERROR_PREFIX} mapping.${key} is invalid. Mapping to a function is not allowed.`
  );
}

// src/index.ts
var _jsonimmutable = require('json-immutable');
var ACTION_TYPES = {
  ENTER: "@@LIVEBLOCKS/ENTER",
  LEAVE: "@@LIVEBLOCKS/LEAVE",
  START_LOADING_STORAGE: "@@LIVEBLOCKS/START_LOADING_STORAGE",
  INIT_STORAGE: "@@LIVEBLOCKS/INIT_STORAGE",
  PATCH_REDUX_STATE: "@@LIVEBLOCKS/PATCH_REDUX_STATE",
  UPDATE_CONNECTION: "@@LIVEBLOCKS/UPDATE_CONNECTION",
  UPDATE_OTHERS: "@@LIVEBLOCKS/UPDATE_OTHERS"
};
var internalEnhancer = (options) => {
  if (process.env.NODE_ENV !== "production" && options.client == null) {
    throw missingClient();
  }
  const client = options.client;
  const mapping = validateMapping(
    options.storageMapping || {},
    "storageMapping"
  );
  const presenceMapping = validateMapping(
    options.presenceMapping || {},
    "presenceMapping"
  );
  if (process.env.NODE_ENV !== "production") {
    validateNoDuplicateKeys(mapping, presenceMapping);
  }
  return (createStore) => (reducer, initialState, enhancer2) => {
    let room = null;
    let isPatching = false;
    let storageRoot = null;
    let unsubscribeCallbacks = [];
    const newReducer = (state, action) => {
      switch (action.type) {
        case ACTION_TYPES.PATCH_REDUX_STATE:
          return __spreadValues(__spreadValues({}, _jsonimmutable.deserialize.call(void 0, state)), _jsonimmutable.deserialize.call(void 0, action.state));
        case ACTION_TYPES.INIT_STORAGE:
          return __spreadProps(__spreadValues(__spreadValues({}, _jsonimmutable.deserialize.call(void 0, state)), _jsonimmutable.deserialize.call(void 0, action.state)), {
            liveblocks: __spreadProps(__spreadValues({}, state.liveblocks), {
              isStorageLoading: false
            })
          });
        case ACTION_TYPES.START_LOADING_STORAGE:
          return __spreadProps(__spreadValues({}, _jsonimmutable.deserialize.call(void 0, state)), {
            liveblocks: __spreadProps(__spreadValues({}, state.liveblocks), {
              isStorageLoading: true
            })
          });
        case ACTION_TYPES.UPDATE_CONNECTION: {
          return __spreadProps(__spreadValues({}, _jsonimmutable.deserialize.call(void 0, state)), {
            liveblocks: __spreadProps(__spreadValues({}, state.liveblocks), {
              connection: action.connection
            })
          });
        }
        case ACTION_TYPES.UPDATE_OTHERS: {
          return __spreadProps(__spreadValues({}, _jsonimmutable.deserialize.call(void 0, state)), {
            liveblocks: __spreadProps(__spreadValues({}, state.liveblocks), {
              others: action.others
            })
          });
        }
        default: {
          const newState = reducer(state, action);
          if (room) {
            isPatching = true;
            updatePresence(room, state, newState, presenceMapping);
            room.batch(() => {
              if (storageRoot) {
                patchLiveblocksStorage(
                  storageRoot,
                  state,
                  newState,
                  mapping
                );
              }
            });
            isPatching = false;
          }
          if (newState.liveblocks == null) {
            return __spreadProps(__spreadValues({}, newState), {
              liveblocks: {
                others: [],
                isStorageLoading: false,
                connection: "closed"
              }
            });
          }
          return newState;
        }
      }
    };
    const store = createStore(newReducer, initialState, enhancer2);
    function enterRoom2(roomId, storageInitialState = {}, reduxState) {
      if (storageRoot) {
        return;
      }
      room = client.enter(roomId, { initialPresence: {} });
      broadcastInitialPresence(room, reduxState, presenceMapping);
      unsubscribeCallbacks.push(
        room.events.connection.subscribe(() => {
          store.dispatch({
            type: ACTION_TYPES.UPDATE_CONNECTION,
            connection: room.getConnectionState()
          });
        })
      );
      unsubscribeCallbacks.push(
        room.events.others.subscribe(({ others }) => {
          store.dispatch({
            type: ACTION_TYPES.UPDATE_OTHERS,
            others: others.toArray()
          });
        })
      );
      unsubscribeCallbacks.push(
        room.events.me.subscribe(() => {
          if (isPatching === false) {
            store.dispatch({
              type: ACTION_TYPES.PATCH_REDUX_STATE,
              state: patchPresenceState(
                room.getPresence(),
                presenceMapping
              )
            });
          }
        })
      );
      store.dispatch({
        type: ACTION_TYPES.START_LOADING_STORAGE
      });
      room.getStorage().then(({ root }) => {
        const updates = {};
        room.batch(() => {
          for (const key in mapping) {
            const liveblocksStatePart = root.get(key);
            if (liveblocksStatePart == null) {
              updates[key] = storageInitialState[key];
              _core.patchLiveObjectKey.call(void 0, 
                root,
                key,
                void 0,
                storageInitialState[key]
              );
            } else {
              updates[key] = _core.lsonToJson.call(void 0, liveblocksStatePart);
            }
          }
        });
        store.dispatch({
          type: ACTION_TYPES.INIT_STORAGE,
          state: updates
        });
        storageRoot = root;
        unsubscribeCallbacks.push(
          room.subscribe(
            root,
            (updates2) => {
              if (isPatching === false) {
                store.dispatch({
                  type: ACTION_TYPES.PATCH_REDUX_STATE,
                  state: patchState(
                    store.getState(),
                    updates2,
                    mapping
                  )
                });
              }
            },
            { isDeep: true }
          )
        );
      });
    }
    function leaveRoom2(roomId) {
      for (const unsubscribe of unsubscribeCallbacks) {
        unsubscribe();
      }
      storageRoot = null;
      room = null;
      isPatching = false;
      unsubscribeCallbacks = [];
      client.leave(roomId);
    }
    function newDispatch(action, state) {
      if (action.type === ACTION_TYPES.ENTER) {
        enterRoom2(action.roomId, action.initialState, store.getState());
      } else if (action.type === ACTION_TYPES.LEAVE) {
        leaveRoom2(action.roomId);
      } else {
        store.dispatch(action, state);
      }
    }
    return __spreadProps(__spreadValues({}, store), {
      dispatch: newDispatch
    });
  };
};
var actions = {
  enterRoom,
  leaveRoom
};
function enterRoom(roomId, initialState) {
  return {
    type: ACTION_TYPES.ENTER,
    roomId,
    initialState
  };
}
function leaveRoom(roomId) {
  return {
    type: ACTION_TYPES.LEAVE,
    roomId
  };
}
var enhancer = internalEnhancer;
function patchLiveblocksStorage(root, oldState, newState, mapping) {
  for (const key in mapping) {
    let oldStateJson = _jsonimmutable.serialize.call(void 0, oldState);
    let newStateJson = _jsonimmutable.serialize.call(void 0, newState);
    if (process.env.NODE_ENV !== "production" && typeof newState[key] === "function") {
      throw mappingToFunctionIsNotAllowed("value");
    }
    if (oldStateJson[key] !== newStateJson[key]) {
      _core.patchLiveObjectKey.call(void 0, root, key, oldStateJson[key], newStateJson[key]);
    }
  }
}
function broadcastInitialPresence(room, state, mapping) {
  for (const key in mapping) {
    room == null ? void 0 : room.updatePresence({ [key]: state[key] });
  }
}
function updatePresence(room, oldState, newState, presenceMapping) {
  for (const key in presenceMapping) {
    if (typeof newState[key] === "function") {
      throw mappingToFunctionIsNotAllowed("value");
    }
    if (oldState[key] !== newState[key]) {
      room.updatePresence({ [key]: newState[key] });
    }
  }
}
function isObject(value) {
  return Object.prototype.toString.call(value) === "[object Object]";
}
function validateNoDuplicateKeys(storageMapping, presenceMapping) {
  for (const key in storageMapping) {
    if (presenceMapping[key] !== void 0) {
      throw mappingShouldNotHaveTheSameKeys(key);
    }
  }
}
function patchPresenceState(presence, mapping) {
  const partialState = {};
  for (const key in mapping) {
    partialState[key] = presence[key];
  }
  return partialState;
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
function validateMapping(mapping, mappingType) {
  if (process.env.NODE_ENV !== "production") {
    if (!isObject(mapping)) {
      throw mappingShouldBeAnObject(mappingType);
    }
  }
  const result = {};
  for (const key in mapping) {
    if (process.env.NODE_ENV !== "production" && typeof mapping[key] !== "boolean") {
      throw mappingValueShouldBeABoolean(mappingType, key);
    }
    if (mapping[key] === true) {
      result[key] = true;
    }
  }
  return result;
}



exports.actions = actions; exports.enhancer = enhancer;
