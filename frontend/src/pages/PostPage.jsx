import React from 'react';
import {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {formatISO9075} from "date-fns";
import {UserContext} from "../components/UserContext";
import {Link} from 'react-router-dom';
import axios from 'axios';
import { FaPencilAlt, FaHeart, FaRegHeart, FaTimes, FaRegComment } from 'react-icons/fa';

const PostPage = () => {

  const [postInfo,setPostInfo] = useState(null);
  const {userInfo} = useContext(UserContext);
  const {id} = useParams();
  const [showLikes, setShowLikes] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:8001/posts/${id}`)
    .then(response => {
      setPostInfo(response.data);
      setIsLiked(response.data.likes.some(like => like._id === userInfo.id));
      console.log('Initial:',isLiked);
      console.log('UserInfo:',userInfo);
    })
    .catch(err => console.log('Error loading post:', err));
  },)

  const handleLike = () => {
    console.log('User Info:',userInfo);
    if (!userInfo || !userInfo.id) {
      alert('Please log in to Like.');
      console.log('Please log in to Like.');
      return;
    }
    axios.put(`http://localhost:8001/posts/${id}/like`, {}, { 
      withCredentials: true 
    })
    .then(response => {
      setPostInfo(response.data);
      setIsLiked(response.data.likes.some(like => like._id === userInfo.id));
      console.log('Toggle:',isLiked);
    })
    .catch(err => console.log('Error loading post:', err));
  };

  const handleAddComment = () => {
    if (!userInfo || !userInfo.id) {
      alert('Please log in to add a comment.');
      return;
    }
    axios.post(`http://localhost:8001/posts/${id}/comments`, { comment: newComment }, { 
      withCredentials: true 
    })
      .then(response => {
        setPostInfo(response.data);
        setNewComment('');
      })
      .catch(err => console.log('Error adding comment:', err));
  };

  if (!postInfo) return '';

  return (
    <div className='xl:p-10 sm:p-5'>
        <div className='flex justify-center overflow-hidden w-full xl:h-screen md:h-96'>
            <img src={'http://localhost:8001/'+postInfo.cover} alt={postInfo.title} 
                className='h-full w-full object-cover'></img>
        </div>
        <div className='-translate-y-20 bg-black xl:mx-80 sm:mx-20 z-10 tracking-wider rounded-2xl text-center'>
            <div className='xl:px-40 xl:py-20 sm:px-20 sm:py-10 space-y-5'>
               <h1 className='xl:text-4xl lg:text-2xl sm:text-lg text-white font-semibold text-center '>{postInfo.title}</h1>
               <p className='text-white xl:text-xl lg:text-lg sm:text-md'>Author: @{postInfo.author.username}</p>
               <p className='text-neutral-400 xl:text-xl lg:text-lg sm:text-md'>Posted at: {formatISO9075(new Date(postInfo.createdAt))}</p>
            </div>  
        </div>

        {userInfo.id === postInfo.author._id && (
            <div className='xl:text-3xl sm:text-2xl text-dark-lavender px-40 py-5'>
                <Link to={`/edit/${postInfo._id}`} className='flex'>
                   <FaPencilAlt className="mr-2" /> Edit Post
                </Link>
            </div>
        )}
        
        <div className='xl:px-40 lg:px-20 sm:px-10'>
           <div>
              <p className='mb-8 xl:text-2xl sm:text-xl' 
              dangerouslySetInnerHTML={{__html:postInfo.content}}></p> 
           </div>

           <div className='flex space-x-10'>
              <div className='likes'>
                 <div className='mr-4 cursor-pointer' onClick={handleLike}> 
                    {isLiked ? <FaHeart className='text-red-500 text-4xl' /> : <FaRegHeart className='text-4xl' />}
                 </div> 
                 <div onClick={() => setShowLikes(true)} className='cursor-pointer text-xl'>
                    {postInfo.likes.length} {postInfo.likes.length === 1 ? 'Like' : 'Likes'}
                 </div>
                 {showLikes && (
                     <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50'>
                       <div className='relative bg-white p-10 rounded-lg max-h-96 overflow-y-auto'>
                       <button onClick={() => setShowLikes(false)} className='absolute top-3 right-3 text-black'>
                          <FaTimes />
                       </button>
                         <h2 className='text-2xl mb-4 font-semibold'>Liked by:</h2>
                         <ul>
                           {postInfo.likes.map((like, index) => (
                             <li key={like._id || index} className='text-xl mb-2 border-b-2 border-neutral-300 pb-3'>{like.username}</li>
                           ))}
                         </ul>
                       </div>
                     </div>
                   )}
              </div>

              <div className='comments'>
                <div className='text-4xl'>
                   <FaRegComment />
                </div>
                <div onClick={() => setShowComments(true)} className='cursor-pointer text-xl'>
                   {postInfo.comments.length} {postInfo.comments.length === 1 ? 'Comment' : 'Comments'}
                </div>
                {showComments && postInfo.comments && (
                   <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50'>
                     <div className='relative bg-white p-10 rounded-lg max-h-96 overflow-y-auto'>
                     <button onClick={() => setShowComments(false)} className='absolute top-3 right-3'>
                        <FaTimes />
                     </button>
                       <h2 className='text-2xl mb-4 font-semibold'>Comments:</h2>
                         <ul>
                           {postInfo.comments.map(comment => (
                             <li key={comment._id} className='mb-4 border-b-2 border-neutral-300 pb-3'>
                               <p className='text-xl font-semibold'>{comment.user.username}</p>
                               <p className='text-xl ml-5'>{comment.comment}</p>
                             </li>
                           ))}
                         </ul>
                       <input 
                         type='text'
                         value={newComment}
                         onChange={e => setNewComment(e.target.value)}
                         className='text-lg border p-2 w-full mb-4'
                         placeholder='Add a comment'
                       />
                       <button onClick={handleAddComment} className='bg-blue-500 text-white px-4 py-2 rounded'>Comment</button>
                     </div>
                   </div>
                 )}
              </div>
           </div>
           
        </div>
        
    </div>
  )
}

export default PostPage