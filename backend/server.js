const express=require('express')
const cors = require('cors');
const mongoose = require('mongoose');
const UserModel = require('./Models/User')
const PostModel = require('./Models/Post')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

mongoose.connect('mongodb://localhost:27017/blog_app')

const app=express();
app.use(cors({credentials:true,origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));


app.post('/register', (req, res) => {
    const {username, password} = req.body;
    UserModel.create({
        username,
        password:bcrypt.hashSync(password,salt),
    })
    .then(result => res.json(result))
    .catch(err => res.json(err))
});


app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const userDoc = await UserModel.findOne({username});
    const passOk = bcrypt.compareSync(password, userDoc.password);
  if (passOk) {
    // logged in
    jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
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
    UserModel.findById(id)
      .then(user => {
        if (!user) return res.status(404).json({ message: 'User not found' });
        PostModel.find({ author: id })
          .populate('author', ['username']) 
          .then(posts => res.json({ user, posts }))
          .catch(err => res.status(500).json({ message: 'Error fetching posts', error: err }));
      })
      .catch(err => res.status(500).json({ message: 'Error fetching user', error: err }));
  });


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
  
    UserModel.findByIdAndUpdate(id, updateFields, { new: true })
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
    
    PostModel.create({
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
  PostModel.find()
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
  PostModel.findById(id)
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

       PostModel.findByIdAndUpdate(id, updateFields, { new: true })
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

    PostModel.findById(req.params.id)
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
          return PostModel.findById(updatedPost._id)
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
    PostModel.findById(req.params.id)
      .then(post => {
        post.comments.push({
          user: info.id,
          comment: comment,
        });

        post.save()
        .then(updatedPost => {
          return PostModel.findById(updatedPost._id)
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

        PostModel.findByIdAndDelete(req.params.id)
          .then(() => res.json('Post deleted'))
          .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
      })
  });


app.delete('/posts/:postId/comments/:commentId', (req, res) => {
  const { postId, commentId } = req.params;
  PostModel.findById(postId)
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
      return PostModel.findById(updatedPost._id)
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



app.listen(8001, ()=> {
    console.log('Server is running...')
})