"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var _nodefetch = require('node-fetch'); var _nodefetch2 = _interopRequireDefault(_nodefetch);
function authorize(options) {
  return __async(this, null, function* () {
    try {
      const { room, secret, userId, userInfo, groupIds } = options;
      if (!(typeof room === "string" && room.length > 0)) {
        throw new Error(
          "Invalid room. Please provide a non-empty string as the room. For more information: https://liveblocks.io/docs/api-reference/liveblocks-node#authorize"
        );
      }
      const result = yield _nodefetch2.default.call(void 0, 
        buildLiveblocksAuthorizeEndpoint(options, room),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secret}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userId,
            userInfo,
            groupIds
          })
        }
      );
      if (!result.ok) {
        return {
          status: 403,
          body: yield result.text()
        };
      }
      return {
        status: 200,
        body: yield result.text()
      };
    } catch (er) {
      return {
        status: 403,
        body: 'Call to "https://api.liveblocks.io/v2/rooms/:roomId/authorize" failed. See "error" for more information.',
        error: er
      };
    }
  });
}
function buildLiveblocksAuthorizeEndpoint(options, roomId) {
  if (options.liveblocksAuthorizeEndpoint) {
    return options.liveblocksAuthorizeEndpoint.replace("{roomId}", roomId);
  }
  return `https://api.liveblocks.io/v2/rooms/${encodeURIComponent(
    roomId
  )}/authorize`;
}


exports.authorize = authorize;
