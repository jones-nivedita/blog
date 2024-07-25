import React from 'react';
import {useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {formatISO9075} from "date-fns";
import {UserContext} from "../components/UserContext";
import {Link} from 'react-router-dom';
import axios from 'axios';
import { FaPencilAlt, FaHeart, FaRegHeart, FaTimes, FaRegComment, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PostPage = () => {

  const [postInfo,setPostInfo] = useState(null);
  const {userInfo} = useContext(UserContext);
  const {id} = useParams();
  const [showLikes, setShowLikes] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:8001/posts/${id}`)
    .then(response => {
      setPostInfo(response.data);
      setIsLiked(response.data.likes.some(like => like._id === userInfo?.id));
    })
    .catch(err => console.log('Error loading post:', err));
  }, [])

  const handleLike = () => {
    console.log('User Info:',userInfo);
    if (!userInfo || !userInfo?.id) {
      navigate('/login');
      return;
    }
    axios.put(`http://localhost:8001/posts/${id}/like`, {}, { 
      withCredentials: true 
    })
    .then(response => {
      setPostInfo(response.data);
      setIsLiked(response.data.likes.some(like => like._id === userInfo?.id));
      console.log('Toggle:',isLiked);
    })
    .catch(err => console.log('Error loading post:', err));
  };

  const handleAddComment = () => {
    if (!userInfo || !userInfo?.id) {
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

  const handleDeleteComment = (commentId) => {
    axios.delete(`http://localhost:8001/posts/${id}/comments/${commentId}`, { withCredentials: true })
      .then(response => {
        setPostInfo(response.data);
      })
      .catch(err => console.log('Error deleting comment:', err));
  };

  if (!postInfo) return '';

  return (
    <div className='xl:p-10 p-5'>
        <div className='flex justify-center overflow-hidden w-full xl:h-screen md:h-96'>
            <img src={'http://localhost:8001/'+postInfo.cover} alt={postInfo.title} 
                className='h-full w-full object-cover'></img>
        </div>
        <div className='-translate-y-20 bg-black lg:mx-40 mx-10 sm:mx-20 z-10 tracking-wider rounded-xl text-center'>
            <div className='sm:px-20 sm:py-10 px-10 py-5 space-y-5'>
               <h1 className='lg:text-2xl sm:text-md text-sm text-white font-semibold text-center '>{postInfo.title}</h1>
               <p className='text-white lg:text-lg text-sm'>Author: @{postInfo.author.username}</p>
               <p className='text-neutral-400 lg:text-sm text-sm'>Posted at: {formatISO9075(new Date(postInfo.createdAt))}</p>
            </div>  
        </div>

        {userInfo.id === postInfo.author._id && (
            <div className='lg:text-lg text-sm sm-text-md text-dark-lavender px-40 py-5'>
                <Link to={`/edit/${postInfo._id}`} className='flex'>
                   <FaPencilAlt className="mr-2" /> Edit Post
                </Link>
            </div>
        )}
        
        <div className='xl:px-40 px-10 lg:px-20'>
           <div>
              <p className='mb-8 text-sm lg:text-lg sm:text-md tracking-wide' 
              dangerouslySetInnerHTML={{__html:postInfo.content}}></p> 
           </div>

           <div className='flex space-x-10'>
              <div className='likes'>
                 <div className='mr-4 cursor-pointer' onClick={handleLike}> 
                    {isLiked ? <FaHeart className='text-red-500 text-sm lg:text-2xl' /> : <FaRegHeart className='text-sm lg:text-2xl' />}
                 </div> 
                 <div onClick={() => setShowLikes(true)} className='cursor-pointer text-sm lg:text-md'>
                    {postInfo.likes.length} {postInfo.likes.length === 1 ? 'Like' : 'Likes'}
                 </div>
                 {showLikes && (
                     <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50'>
                       <div className='relative bg-white p-10 rounded-lg max-h-96 overflow-y-auto'>
                       <button onClick={() => setShowLikes(false)} className='absolute top-3 right-3 text-black text-sm'>
                          <FaTimes />
                       </button>
                         <h2 className='text-sm lg:text-lg mb-4 font-semibold'>Liked by:</h2>
                         <ul>
                           {postInfo.likes.map((like, index) => (
                             <li key={like._id || index} className='text-sm lg:text-md mb-2 border-b-2 border-neutral-300 pb-3'>{like.username}</li>
                           ))}
                         </ul>
                       </div>
                     </div>
                   )}
              </div>

              <div className='comments'>
                <div className='text-sm lg:text-2xl'>
                   <FaRegComment />
                </div>
                <div onClick={() => setShowComments(true)} className='cursor-pointer text-sm lg:text-md'>
                   {postInfo.comments.length} {postInfo.comments.length === 1 ? 'Comment' : 'Comments'}
                </div>
                {showComments && postInfo.comments && (
                   <div className='fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50'>
                     <div className='relative bg-white p-10 rounded-lg max-h-96 max-w-xl overflow-y-auto'>
                     <button onClick={() => setShowComments(false)} className='absolute top-3 right-3'>
                        <FaTimes />
                     </button>
                       <h2 className='text-sm lg:text-lg mb-4 font-semibold'>Comments:</h2>
                         <ul>
                           {postInfo.comments.map(comment => (
                             <li key={comment._id} className='mb-4 border-b-2 border-neutral-300 pb-3 flex justify-between'>
                              <div className='flex-1'>
                                 <p className='text-sm lg:text-md font-semibold'>@{comment.user.username}</p>
                                 <p className='text-sm lg:text-md ml-5 break-words'>{comment.comment}</p>
                               </div>
                               <div>
                               {userInfo?.username === comment.user.username && (
                                  <button onClick={() => handleDeleteComment(comment._id)} className='text-red-500'>
                                    <FaTrash />
                                  </button>
                                )}
                                </div>
                             </li>
                           ))}
                         </ul>
                       <input 
                         type='text'
                         value={newComment}
                         onChange={e => setNewComment(e.target.value)}
                         className='text-sm lg:text-md border p-2 w-full mb-4'
                         placeholder='Add a comment'
                       />
                       <button onClick={handleAddComment} className='text-sm lg:text-md bg-lavender hover:bg-dark-lavender text-white px-4 py-2 rounded'>Comment</button>
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