const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const PostSchema = new Schema({
  title:String,
  content:String,
  cover:String,
  author:{type:Schema.Types.ObjectId, ref:'User'},
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;