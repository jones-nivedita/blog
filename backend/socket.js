const Chat = require('./Models/Chat');
const PostModel = require('./Models/Post');
const UserModel = require('./Models/User');

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('New user connected');
    
    socket.on('join_chat', async ({ userId, chatId }) => {
      socket.join(chatId);
      
      if (chatId) {
        const chat = await Chat.findById(chatId).populate('users', ['username']);
        io.to(chatId).emit('chat_message', chat);
      }
    });

    socket.on('new_message', async ({ chatId, message }) => {
      const chat = await Chat.findById(chatId).populate('users', ['username']);
      chat.messages.push(message);
      await chat.save();
      
      io.to(chatId).emit('chat_message', chat);
    });

    socket.on('share_post', async ({ postId, chatId }) => {
      const post = await PostModel.findById(postId).populate('author', ['username']);
      const chat = await Chat.findById(chatId).populate('users', ['username']);
      
      chat.messages.push({
        type: 'post_share',
        post,
      });
      await chat.save();
      
      io.to(chatId).emit('chat_message', chat);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
};
