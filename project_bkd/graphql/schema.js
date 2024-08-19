const { buildSchema } = require('graphql');

const schema = buildSchema(`
    type User {
        _id: ID
        createdAt: String
        login: String
        nick: String
        acl: [String]
        avatar: Media
        chats: [Chat]
    }

    type Chat {
        _id: ID
        createdAt: String
        lastModified: String
        lastMessage: Message
        owner: User
        title: String
        members: [User]
        messages: [Message]
        avatar: Media
    }

    type Message {
        _id: ID
        createdAt: String
        owner: User
        chat: Chat
        text: String
        media: [Media]
        replies: [Message]
        replyTo: Message
    }

    type Media {
        _id: ID
        createdAt: String
        owner: User
        text: String
        url: String
        originalFileName: String
        type: String
        userAvatar: User
        chatAvatars: [Chat]
        messages: [Message]
    }

    input UserInput {
        _id: ID
        login: String
        nick: String
        password: String
        acl: [String]
        avatar: MediaInput
        chats: [ChatInput]
    }

    input ChatInput {
        _id: ID
        title: String
        members: [UserInput]
        messages: [MessageInput]
    }

    input MessageInput {
        _id: ID
        text: String
        chat: ChatInput
        media: [MediaInput]
        replies: [MessageInput]
        replyTo: MessageInput
    }

    input MediaInput {
        _id: ID
        text: String
        url: String
        originalFileName: String
        type: String
        userAvatar: UserInput
        chatAvatars: [ChatInput]
        messages: [MessageInput]
    }

    type Query {
        test: String
        login(login: String, password: String): String
        UserFind(query: String): [User]
        UserCount(query: String): Int
        UserFindOne(query: String): User
        MediaFind(query: String): [Media]
        MediaCount(query: String): Int
        MediaFindOne(query: String): Media
        ChatFind(query: String): [Chat]
        ChatCount(query: String): Int
        ChatFindOne(query: String): Chat
        MessageFind(query: String): [Message]
        MessageCount(query: String): Int
        MessageFindOne(query: String): Message
    }

    type Mutation {
        UserDelete(user: UserInput): User
        UserUpsert(user: UserInput): User
        MediaDelete(media: MediaInput): Media
        MediaUpsert(media: MediaInput): Media
        ChatDelete(chat: ChatInput): Chat
        ChatUpsert(chat: ChatInput): Chat
        MessageDelete(message: MessageInput): Message
        MessageUpsert(message: MessageInput): Message
    }
`);

module.exports = schema;
