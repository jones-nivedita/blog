const express=require('express')
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./Models/User')
const Post = require('./Models/Post')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const Chat = require('./Models/Chat'); 
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');


const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

mongoose.connect('mongodb://localhost:27017/blog_app')

const app=express();
app.use(cors({credentials:true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});




app.post('/register', (req, res) => {
    const {username, password} = req.body;
    User.create({
        username,
        password:bcrypt.hashSync(password,salt),
    })
    .then(result => res.json(result))
    .catch(err => res.json(err))
});


app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username, id:userDoc._id}, secret, {}, (err,token) => {
      if (err) throw err;
      res.cookie('token', token).json({
        id:userDoc._id,
        username,
      });
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});


app.get('/profile', (req, res) => {
  const {token} = req.cookies;
  jwt.verify( token, secret, {}, (err, info) => {
    if (err) throw err;
    res.json(info);
  });
});


app.get('/users/:id', (req, res) => {
    const { id } = req.params;
    User.findById(id)
      .then(user => {
        if (!user) return res.status(404).json({ message: 'User not found' });
        Post.find({ author: id })
          .populate('author', ['username']) 
          .then(posts => res.json({ user, posts }))
          .catch(err => res.status(500).json({ message: 'Error fetching posts', error: err }));
      })
      .catch(err => res.status(500).json({ message: 'Error fetching user', error: err }));
  });

  app.get('/users', (req, res) => {
    User.find()
    .then(users => res.json(users))
    .catch(err => res.status(500).json({ error: "Error loading users" }))
  })


  app.put('/users/:id', uploadMiddleware.single('file'), (req, res) => {
    const { id } = req.params;
    const { username } = req.body;
    const  file  = req.file;
    let newPath = null;
    

    if (file) {
      const { originalname, path } = file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path+'.'+ext;
      fs.renameSync(path, newPath);
      console.log('File saved to:', newPath);
    }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
       if (err) throw err;
       const updateFields = { username };
       if (newPath) {
         updateFields.picture = newPath;
       }
  
    User.findByIdAndUpdate(id, updateFields, { new: true })
      .exec()
      .then(user => {
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
      })
      .catch(err => res.status(500).json({ message: 'Error updating profile', error: err }));
  });
});


app.post('/logout', (req,res) => {
  res.cookie('token', '').json('ok');
  //res.clearCookie('token');
});


app.post('/posts', uploadMiddleware.single('file'), (req, res) => {
  const {originalname, path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);
  
  const {token} = req.cookies;
  jwt.verify(token, secret, {}, (err,info) => {
    if (err) throw err;
    const {title,content} = req.body;
    
    Post.create({
      title,
      content,
      cover:newPath,
      author:info.id,
    })
    .then(result => res.json(result))
    .catch(error => {
      res.status(500).json({ error: 'Internal Server Error' })
    });
  });
});


app.get('/posts', (req,res) => {
  Post.find()
    .populate('author', ['username'])
    .sort({ createdAt: -1 })
    .limit(20)
    .then(posts => {
      res.json(posts);
    })
    .catch(error => {
      console.error('Error fetching posts:', error.message, error.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


app.get('/posts/:id', (req, res) => {
  const {id} = req.params;
  Post.findById(id)
  .populate('author', ['username'])
  .populate('likes', ['username'])
  .populate('comments.user', 'username')
  .then(post => res.json(post))
  .catch(error => {
    console.error('Error fetching posts:', error.message, error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });
})


app.put('/posts', uploadMiddleware.single('file'), (req, res) => {
  let newPath = null;
  if (req.file) {
    const {originalname,path} = req.file;
    const parts = originalname.split('.');
    const ext = parts[parts.length - 1];
    newPath = path+'.'+ext;
    fs.renameSync(path, newPath);
  }

    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
       if (err) throw err;
       const {id, title, content} = req.body;
       const updateFields = { title, content };
       if (newPath) {
         updateFields.cover = newPath;
       }

       Post.findByIdAndUpdate(id, updateFields, { new: true })
      .exec()
      .then(updatedPost => {
        if (!updatedPost) {
          return res.status(404).json({ error: 'Post not found' });
        }
        res.json(updatedPost);
      })
      .catch(error => {
        console.error('Error updating post:', error.message, error.stack);
        res.status(500).json({ error: 'Internal Server Error' });
      });
  });
});


app.put('/posts/:id/like', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;

    Post.findById(req.params.id)
      .then(post => {
        const userId = info.id;
        const isLiked = post.likes.includes(userId);
        
        if (isLiked) {
          console.log('User has already liked');
          post.likes.pull(userId);
        } else {
          console.log('Like added');
          post.likes.push(userId);
        }

        post.save()
        .then(updatedPost => {
          return Post.findById(updatedPost._id)
             .populate('likes', ['username'])
             .populate('author', ['username']);
        })
        .then(populatedPost => res.json(populatedPost))
      .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
      })
      .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
  });
});


app.post('/posts/:id/comments', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) throw err;

    const { comment } = req.body;
    Post.findById(req.params.id)
      .then(post => {
        post.comments.push({
          user: info.id,
          comment: comment,
        });

        post.save()
        .then(updatedPost => {
          return Post.findById(updatedPost._id)
             .populate('comments.user', ['username'])
             .populate('author', ['username'])
             .populate('likes', ['username'])
        })
        .then(populatedPost => res.json(populatedPost))
          .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
      })
      .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
  });
});


app.delete('/posts/:id', (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, secret, {}, (err, info) => {
    if (err) return res.status(401).json('Unauthorized');

        Post.findByIdAndDelete(req.params.id)
          .then(() => res.json('Post deleted'))
          .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
      })
  });


app.delete('/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
      if (commentIndex === -1) {
        return res.status(404).json({ message: 'Comment not found' });
      }

      post.comments.splice(commentIndex, 1);

      return post.save();
    })
    .then(updatedPost => {
      return Post.findById(updatedPost._id)
        .populate('comments.user', ['username']) 
        .populate('author', ['username'])
        .populate('likes', ['username'])
    })
    .then(populatedPost => res.status(200).json(populatedPost))
    .catch(err => {
      console.log('Error deleting comment:', err);
      res.status(500).json({ message: 'Error deleting comment' });
    });
});


app.get('/chats/:id', (req, res) => {
  const userId = req.params.id;
  Chat.find({users: userId})
    .populate('users', 'username picture') 
    //.populate('messages.sender', 'username picture') 
    .then((chats) => {
      res.status(200).json(chats);
    })
    .catch((error) => {
      res.status(500).json({ message: 'Error fetching chat list', error });
    });
});

/*app.get('/chats/:id', async (req, res) => {
  const chatId = req.params.id;
  const skip = parseInt(req.query.skip) || 0; // Number of messages to skip
  const limit = 10; // Number of messages to return

  try {
    const chat = await Chat.findById(chatId)
      .populate('users', 'username picture')
      .populate({
        path: 'messages',
        options: {
          sort: { timestamp: -1 }, // Sort messages by timestamp in descending order
          skip: skip,
          limit: limit,
        },
        populate: { path: 'sender', select: 'username picture' } // Populate sender's information
      });

    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    res.status(200).json(chat.messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});*/



io.on('connection', (socket) => {
  console.log('New user connected');
  
  socket.on('join_chat', async ({ userId, chatId }) => {
    socket.join(chatId);
    
    if (chatId) {
      const chat = await Chat.findById(chatId).populate('users', ['username']);
      io.to(chatId).emit('chat_message', chat);
    }
  });

  socket.on('chat_message', async ({ chatId, sender, text }) => {
    try {
      const chat = await Chat.findById(chatId).populate('users', ['username']);
      if (!chat) {
        return socket.emit('error', { message: 'Chat not found' });
      }
  
      const message = {
        text,
        sender,
        timestamp: new Date(),
      };
  
      chat.messages.push(message);
      await chat.save();
  
      io.to(chatId).emit('chat_message', chat);
    } catch (error) {
      socket.emit('error', { message: 'Error sending message', error });
    }
  });

  socket.on('share_post', async ({ userId, recipientId, postId }) => {
    try {
      let chat = await Chat.findOne({ users: { $all: [userId, recipientId] } });
      
      if (!chat) {
        chat = new Chat({ users: [userId, recipientId], messages: [] });
      }
  
      const post = await Post.findById(postId).populate('author', ['username']);
      if (!post) {
        socket.emit('error', { message: 'Post not found' });
        return;
      }
  
      chat.messages.push({
        sender: userId,
        post: post._id,  
        timestamp: Date.now(),
      });
  
      await chat.save();
  
      io.to([userId, recipientId]).emit('chat_message', chat);
  
    } catch (error) {
      console.error('Error in share_post socket:', error);
      socket.emit('error', { message: 'Error sharing post', error });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});



server.listen(8001, ()=> {
    console.log('Server is running...')
})