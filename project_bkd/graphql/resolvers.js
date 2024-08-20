const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const Media = require("../models/mediaModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

async function populateUserChats(userId) {
  return await Chat.find({ members: userId })
    .populate({
      path: "members",
      select: "nick avatar",
      populate: { path: "avatar", select: "url" }
    })
    .populate("avatar", "url")
    .exec();
}

async function populateChatMembers(chatId) {
  return await User.find({ chats: chatId })
    .populate("avatar", "url")
    .exec();
}

async function populateChatMessages(chatId) {
  return await Message.find({ chat: chatId })
    .populate({
      path: "owner",
      select: "nick avatar",
      populate: { path: "avatar", select: "url" }
    })
    .populate("media", "url")
    .exec();
}

const root = {
  test: async () => {
    //ok
    console.log("Test resolver called");
    return "Test successful!";
  },

  /*
     _____                           
    |  _  |                          
    | | | | _   _   ___  _ __  _   _ 
    | | | || | | | / _ \| '__|| | | |
    \ \/' /| |_| ||  __/| |   | |_| |
     \_/\_\ \__,_| \___||_|    \__, |
                                __/ |
                               |___/ 
    */
  async login({ login, password }) {
    //OK
    console.log("login");
    try {
      const user = await User.findOne({ login });
      if (!user) {
        console.log("User not found");
        return null;
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        console.log("Incorrect password");
        return null;
      }

      const payload = {
        sub: {
          id: user._id.toString(),
          login: user.login,
          acl: [user._id.toString(), "user"],
        },
        iat: Math.floor(Date.now() / 1000),
      };

      const token = jwt.sign(payload, "abc", {
        expiresIn: "1h",
      });

      return token;
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  },

  async UserFind({ query }) {
    console.log("UserFind");
    try {
      const queryObj = JSON.parse(query);

      // Extract the filter criteria from the query object
      const filter = queryObj[0];

      // Find users based on the filter criteria
      const users = await User.find(filter).populate("avatar", "url").exec();

      return users;
    } catch (error) {
      console.error("UserFind error:", error);
      return null;
    }
  },

  async UserCount({ query }) {
    console.log("UserCount");
    return await User.countDocuments(JSON.parse(query));
  },

  async UserFindOne({ query }) {
    console.log("UserFindOne");
    try {
      const userQuery = JSON.parse(query);
      const user = await User.findOne(userQuery[0])
        .populate("avatar", "url")
        .exec();

      if (user) {
        user.chats = await populateUserChats(user._id);

        for (const chat of user.chats) {
          chat.members = await populateChatMembers(chat._id);
          chat.messages = await populateChatMessages(chat._id);
          chat.avatar = await Chat.findById(chat._id).populate("avatar", "url").exec();
        }
      }

      return user;
    } catch (error) {
      console.error("UserFindOne error:", error);
      return null;
    }
  },

  async MediaCount({ query }) {
    console.log("MediaCount");
    return await Media.countDocuments(JSON.parse(query));
  },

  async MediaFindOne({ query }) {
    console.log("MediaFindOne");
    return await Media.findOne(JSON.parse(query));
  },

  async ChatFind({ query }) {
    console.log("ChatFind");
    return await Chat.find(JSON.parse(query));
  },

  async ChatCount({ query }) {
    console.log("ChatCount");
    return await Chat.countDocuments(JSON.parse(query));
  },

  async ChatFindOne({ query }) {
    //OK
    console.log("ChatFindOne");
    const chatQuery = JSON.parse(query);
    const chat = await Chat.findOne(chatQuery).
      populate("members")
      .populate("messages")
      .populate("media")
      .exec();

    return chat;
  },

  async MessageFind({ query }) {
    console.log("MessageFind");
    try {
      const queryObj = JSON.parse(query);
      const filter = { chat: queryObj[0]["chat._id"] };
      const sortObj = queryObj[1]?.sort;
      const limit = queryObj[2]?.limit || 100; // Default limit to 100 if not provided
      const offset = queryObj[3]?.offset || 0; // Default offset to 0 if not provided

      // Initialize an empty object for sort
      const sort = {};
      if (Array.isArray(sortObj)) {
        sortObj.forEach((item) => {
          if (Array.isArray(item) && item.length === 2) {
            const [field, direction] = item;
            sort[field] = direction;
          }
        });
      }

      const messages = await Message.find(filter)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .populate({
          path: "owner",
          select: "nick avatar",
          populate: { path: "avatar", select: "url" }
        })
        .populate("chat", "_id")
        .populate("media", "url")
        .populate("replies", "_id")
        .populate("replyTo", "_id")
        .exec();

      return messages;
    } catch (error) {
      console.error("MessageFind error:", error);
      return null;
    }
  },

  async MessageCount({ query }) {
    console.log("MessageCount");
    return await Message.countDocuments(JSON.parse(query));
  },

  async MessageFindOne({ query }) {
    console.log("MessageFindOne");
    return await Message.findOne(JSON.parse(query));
  },
  /*
    ___  ___        _           _    _               
    |  \/  |       | |         | |  (_)              
    | .  . | _   _ | |_   __ _ | |_  _   ___   _ __  
    | |\/| || | | || __| / _` || __|| | / _ \ | '_ \ 
    | |  | || |_| || |_ | (_| || |_ | || (_) || | | |
    \_|  |_/ \__,_| \__| \__,_| \__||_| \___/ |_| |_|
    */
  //mutation
  async UserDelete({ user }) {
    console.log("UserDelete");
    return await User.findByIdAndRemove(user._id);
  },

  async UserUpsert({ user }) {
    //ok
    console.log("UserUpsert");
    if (user._id) {
      return await User.findByIdAndUpdate(user._id, user, { new: true });
    } else {
      return await User.create(user);
    }
  },
  // Изменение аватара пользователя
  async UserUpsert({ user }) {
    console.log("UserUpsert");
    if (user._id) {
      return await User.findByIdAndUpdate(user._id, user, {
        new: true,
      }).populate("avatar");
    } else {
      return await User.create(user);
    }
  },


  async MediaDelete({ media }) {
    console.log("MediaDelete");
    return await Media.findByIdAndRemove(media._id);
  },

  async MediaUpsert({ media }) {
    console.log("MediaUpsert");
    if (media._id) {
      return await Media.findByIdAndUpdate(media._id, media, { new: true });
    } else {
      return await Media.create(media);
    }
  },

  async UploadUserAvatar({ userId, file }) {
    try {
      const { createReadStream, filename, mimetype } = await file;

      const stream = createReadStream();
      const filePath = `public/uploads/${Date.now()}-${filename}`;
      const out = require('fs').createWriteStream(filePath);
      stream.pipe(out);

      await finished(out);

      // Save media info to the database
      const media = await Media.create({
        owner: userId,
        url: `/uploads/${filePath}`,
        originalFileName: filename,
        type: mimetype,
      });

      // Update user profile with the new avatar
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: media._id },
        { new: true }
      ).populate('avatar');

      return updatedUser.avatar;
    } catch (error) {
      throw new Error("Failed to upload avatar");
    }
  },

  async ChatDelete({ chat }) {
    console.log("ChatDelete");
    return await Chat.findByIdAndRemove(chat._id);
  },

  async ChatUpsert({ chat }, context) {
    try {
      // Extract the JWT token from the request headers
      const token = context.headers.authorization;

      if (!token) {
        throw new Error("Authorization token not provided");
      }

      // Verify the token and extract the payload
      const decodedToken = jwt.verify(
        token.replace("Bearer ", ""),
        "abc"
      );

      const userId = decodedToken.sub?.id;

      if (!userId) {
        throw new Error("Invalid token: userId not found");
      }

      let newChat;

      // If chat ID exists, update the existing chat
      if (chat._id) {
        // Update the chat with the new members using $addToSet to avoid duplicates
        newChat = await Chat.findByIdAndUpdate(
          chat._id,
          { $addToSet: { members: { $each: chat.members } } },
          { new: true }
        ).populate("members", "nick");

        // Add the chat ID to the chats array of each member using $addToSet to avoid duplicates
        await Promise.all(
          chat.members.map(async (memberId) => {
            await User.findByIdAndUpdate(memberId, {
              $addToSet: { chats: newChat._id },
            });
          })
        );
      } else {
        // Otherwise, create a new chat and add the user as a member
        chat.members = chat.members || [];
        chat.members.push(userId);

        newChat = new Chat(chat);
        await newChat.save();

        // Add the new chat ID to the chats array of each member using $addToSet to avoid duplicates
        await Promise.all(
          chat.members.map(async (memberId) => {
            await User.findByIdAndUpdate(memberId, {
              $addToSet: { chats: newChat._id },
            });
          })
        );
      }

      // Emit the new or updated chat
      global.io.emit("chat", newChat);

      return newChat;
    } catch (error) {
      console.error("ChatUpsert error:", error);
      return null;
    }
  },

  async MessageDelete({ message }) {
    console.log("MessageDelete");
    return await Message.findByIdAndRemove(message._id);
  },

  async MessageUpsert({ message }, context) {
    console.log("MessageUpsert");
    try {
      const token = context.headers.authorization;
      const decodedToken = jwt.verify(
        token.replace("Bearer ", ""),
        "abc"
      );
      const userId = decodedToken.sub?.id;
  
      let messageDoc;
  
      if (message._id) {
        // Update existing message
        messageDoc = await Message.findById(message._id);
        if (!messageDoc) {
          throw new Error("Message not found");
        }
        messageDoc.text = message.text ?? messageDoc.text;
        messageDoc.media = message.media ?? messageDoc.media; // Update media
        messageDoc.lastModified = new Date();
        await messageDoc.save();
      } else {
        // Insert new message
        messageDoc = new Message({
          owner: userId,
          text: message.text ?? "",
          chat: message.chat?._id ?? null,
          replies: message.replies ?? [],
          media: message.media ?? [], // Set media
          createdAt: new Date(),
          lastModified: new Date(),
        });
  
        // Save the new message
        await messageDoc.save();
  
        // Update the chat's last message and members
        const chatDoc = await Chat.findById(messageDoc.chat);
        if (chatDoc) {
          chatDoc.lastMessage = messageDoc._id;
  
          // Add the message to the chat's messages array
          chatDoc.messages.push(messageDoc._id);
  
          if (!chatDoc.members.includes(userId)) {
            chatDoc.members.push(userId);
          }
          chatDoc.lastModified = new Date();
          await chatDoc.save();
        }
  
        // Update the user's chat list
        const userDoc = await User.findById(userId);
        if (userDoc && !userDoc.chats.includes(chatDoc._id)) {
          userDoc.chats.push(chatDoc._id);
          await userDoc.save();
        }
      }
  
      // Populate necessary fields
      messageDoc = await Message.findById(messageDoc._id)
        .populate("owner", "nick avatar")
        .populate("chat", "_id")
        .populate("media", "url") // Populate media
        .populate("replies", "_id")
        .populate("replyTo", "_id")
        .exec();
      
        console.log("messageDoc", messageDoc)
      // Emit the new or updated message
      global.io.emit("msg", messageDoc);
      return messageDoc;
    } catch (error) {
      console.error("MessageUpsert error:", error);
      throw new Error("Failed to upsert message");
    }
  },
  

  async MessageDelete({ message }) {
    console.log("MessageDelete");
    const deletedMessage = await Message.findByIdAndDelete(message._id);

    if (deletedMessage) {
      await Chat.updateOne(
        { _id: deletedMessage.chat },
        { $pull: { messages: deletedMessage._id } }
      );

      global.io.emit("msgDelete", deletedMessage._id);
    }

    return deletedMessage;
  },


};

module.exports = root;
