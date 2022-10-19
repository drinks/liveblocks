declare type AuthorizeOptions = {
    /**
     * The secret api provided at https://liveblocks.io/dashboard/apikeys
     */
    secret: string;
    /**
     * The room provided in the authorization request body
     */
    room: string;
    /**
     * The id of the user that try to connect. It should be used to get information about the connected users in the room (name, avatar, etc).
     * It can also be used to generate a token that gives access to a private room where the userId is configured in the room accesses
     */
    userId?: string;
    /**
     * The info associated to the user. Can be used to store the name or the profile picture to implement avatar for example. Can't exceed 1KB when serialized as JSON
     */
    userInfo?: unknown;
    /**
     * The ids of the groups to which the user belongs. It should be used to generate a token that gives access to a private room and at least one of the group is configured in the room accesses.
     */
    groupIds?: string[];
};
declare type AuthorizeResponse = {
    status: number;
    body: string;
    error?: Error;
};
/**
 * @example
 * export default async function auth(req, res) {
 *
 * // Implement your own security here.
 *
 * const room = req.body.room;
 * const response = await authorize({
 *   room,
 *   secret,
 *   userId: "123", // Optional
 *   userInfo: {    // Optional
 *     name: "Ada Lovelace"
 *   },
 *   groupIds: ["group1"] // Optional
 * });
 * return res.status(response.status).end(response.body);
 * }
 */
declare function authorize(options: AuthorizeOptions): Promise<AuthorizeResponse>;

export { authorize };
