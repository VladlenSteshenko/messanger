// src/api/api.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { graphqlRequestBaseQuery } from "@rtk-query/graphql-request-base-query";


const logQueryBaseQuery = (baseQuery) => async (args, api, extraOptions) => {
  
  console.log("Query:", args.document);

 
  return await baseQuery(args, api, extraOptions);
};

export const api = createApi({
  baseQuery: logQueryBaseQuery(
    graphqlRequestBaseQuery({
      url: "http://localhost:5000/graphql",
      prepareHeaders(headers, { getState }) {
        const { token } = getState().auth;
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }

        return headers;
      },
    })
  ),
  tagTypes: ["User", "Chat", "Message"], 
  endpoints: (builder) => ({
    login: builder.mutation({
      query: ({ login, password }) => ({
        document: `
          query Login($login: String, $password: String) {
            login(login: $login, password: $password)
          }
        `,
        variables: { login, password },
      }),
      invalidatesTags: (result) => [
        { type: "User" },
        { type: "Chat" },
        { type: "Message" }
      ],

    }),
    register: builder.mutation({
      query: ({ login, password }) => ({
        document: `
          mutation Register($login: String, $password: String) {
            UserUpsert(user: {login: $login, password: $password}) {
              _id
               login
            }
          }
        `,
        variables: { login, password },
      }),
    }),
    userFind: builder.query({
      query: () => ({
        document: `
          query UserFind {
            UserFind(query: "[{}]") {
              _id
              login
              nick
              avatar {
                url
              }
            }
          }
        `,
      }),
      providesTags: (result) =>
        result
          ? result.UserFind.map(({ _id }) => ({ type: "User", id: _id }))
          : [],
    }),
    userFindOne: builder.query({
      query: ({ _id }) => ({
        document: `
          query oneUser {
            UserFindOne(query: "[{\\"_id\\":\\"${_id}\\"}]") {
              _id
              login
              nick
              createdAt
              avatar {
                url
              }
            }
          }
        `,
        variables: { _id },
      }),
      providesTags: (result, error, { _id }) => [{ type: "User", id: _id }],
    }),
    userUpsert: builder.mutation({
      query: (user) => ({
        document: `
          mutation UserUpsert($user: UserInput!) {
            UserUpsert(user: $user) {
              _id
              login
              nick
              avatar {
                url
              }
            }
          }
        `,
        variables: { user },
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: "User", id: _id }],
    }),
    setUserNick: builder.mutation({
      query: ({ _id, nick }) => ({
        document: `
          mutation setNick($_id: ID, $nick: String) {
            UserUpsert(user: { _id: $_id, nick: $nick }) {
              _id
              nick
            }
          }
        `,
        variables: { _id, nick },
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "User", id: _id },
        { type: "Chat" },
      ],
    }),
    userChats: builder.query({
      query: ({ _id }) => ({
        document: `
          query userChats($query: String) {
            UserFindOne(query: $query) {
              _id
              login
              nick
              createdAt
              avatar {
                url
              }
              chats {
                _id
                title
                lastModified
                members {
                  _id
                  nick
                avatar {
                  url
                }
                }
                avatar {
                  url
                }
              }
            }
          }
        `,
        variables: { query: JSON.stringify([{ _id }]) },
      }),
      providesTags: (result, error, { _id }) =>
        result
          ? [
            { type: "User", id: _id },
            ...(result.UserFindOne.chats || []).map((chat) => ({
              type: "Chat",
              id: chat._id,
            })),
          ]
          : [],
    }),
    chatUpsert: builder.mutation({
      query: ({ title }) => ({
        document: `
        mutation createChat($title: String) {
          ChatUpsert(chat: { title: $title }) {
            _id
            title
          }
        }
      `,
        variables: { title },
      }),
      invalidatesTags: ["Chat"],
    }),
    actionAboutMe: builder.query({
      query: ({ _id }) => ({
        document: `
        query actionAboutMe($query: String) {
          UserFindOne(query: $query) {
            _id
            login
            nick
            createdAt
            avatar {
              url
            }
            chats {
              _id
              title
              lastModified
              members {
                _id
                nick
                avatar {
                url
                }
              }
              avatar {
                url
              }
            }
          }
        }
      `,
        variables: { query: JSON.stringify([{ _id }]) },
      }),
      providesTags: (result, error, { _id }) => [{ type: "User", id: _id }],
    }),
    getMessages: builder.query({
      query: ({ chatID, offset }) => ({
        document: `
        query getMessages {
          MessageFind(
            query: "[{\\"chat._id\\": \\"${chatID}\\"}, {\\"sort\\": [{\\"_id\\": -1}]}, {\\"limit\\": 100}, {\\"offset\\": ${offset}}]"
          ) {
            _id
            createdAt
            owner {
              _id
              nick
              avatar {
                url
              }
            }
            text
            chat {
              _id
            }
            media {
              url
            }
            replies {
              _id
            }
            replyTo {
              _id
            }
          }
        }
      `,
        variables: {
          chatID,
          offset,
        },
      }),
      providesTags: (result, error, { chatID }) => {
        if (result && result.MessageFind) {
          return [
            { type: "Chat", id: chatID },
            ...result.MessageFind.map(({ _id }) => ({
              type: "Message",
              id: _id,
            })),
          ];
        } else {
          return [{ type: "Chat", id: chatID }];
        }
      },
    }),
    MessageUpsert: builder.mutation({
      query: ({ chatID, text, media }) => ({
        document: `
          mutation MessageUpsert($chatID: ID, $text: String, $media: [MediaInput]) {
            MessageUpsert(message: { chat: { _id: $chatID }, text: $text, media: $media }) {
              _id
              createdAt
              text
              owner {
                _id
                nick
                avatar {
                  url
                }
              }
              chat {
                _id
              }
              media {
                _id
                url
              }
            }
          }
        `,
        variables: { chatID, text, media },
      }),
      invalidatesTags: (result, error, { chatID }) => [
        { type: "Chat", id: chatID },
        { type: "Message", chatID },
      ],
    }),
    MessageUpdate: builder.mutation({
      query: ({ messageid, text, media }) => ({
        document: `
        mutation MessageUpdate($text: String, $messageid: ID, $media: [MediaInput]) {
          MessageUpsert(message: { text: $text, _id: $messageid, media: $media }) {
            _id
            createdAt
            text
            media {
              _id
              url
            }
            owner {
              _id
              nick
              avatar {
                url
              }
            }
            chat {
              _id
            }
          }
        }
      `,
        variables: { messageid, text, media },
      }),
      invalidatesTags: (result, error, { messageid }) => [
        { type: "Message", id: messageid },
      ],
    }),
    
    findUsersByNick: builder.query({
      query: (nick) => ({
        document: `
          query FindUsersByNick {
            UserFind(query: "[{\\"nick\\":  \\"${nick}\\"}]") {
              _id
              login
              nick
              avatar {
                url
              }
            }
          }
        `,
        variables: { nick },
      }),
    }),
    addUserToChat: builder.mutation({
      query: ({ chatId, members }) => ({
        document: `
          mutation UpdateChatMembers($chatId: ID!, $members: [UserInput!]!) {
            ChatUpsert(chat: { _id: $chatId, members: $members }) {
              _id
              title
              members {
                _id
                nick
              }
            }
          }
        `,
        variables: {
          chatId,
          members,
        },
      }),
      invalidatesTags: (result, error, { chatId }) => [
        { type: "Chat", id: chatId },
      ],
    }),

    MessageDelete: builder.mutation({
      query: ({ messageId }) => ({
        document: `
          mutation DeleteMessage($messageId: ID!) {
            MessageDelete(message: { _id: $messageId }) {
              _id
            }
          }
        `,
        variables: { messageId },
      }),
      invalidatesTags: (result, error, { messageId }) => [{ type: "Message", id: messageId }],
    }),

    uploadUserAvatar: builder.mutation({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useUserFindQuery,
  useUserFindOneQuery,
  useUserUpsertMutation,
  useSetUserNickMutation,
  useUserChatsQuery,
  useChatUpsertMutation,
  useActionAboutMeQuery,
  useGetMessagesQuery,
  useMessageUpsertMutation,
  useMessageUpdateMutation,
  useFindUsersByNickQuery,
  useAddUserToChatMutation,
  useUploadUserAvatarMutation,
  useMessageDeleteMutation,
} = api;
