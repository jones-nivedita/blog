import React, {useState, useEffect} from 'react';
import { useContext } from 'react';
import { UserContext } from '../components/UserContext';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {formatISO9075} from "date-fns";
import {Link} from 'react-router-dom';
import {FaPencilAlt, FaTimes} from 'react-icons/fa';

const Profile = () => {
  const { id } = useParams(); 
  const { userInfo } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [files, setFiles] = useState('');


  useEffect(() => {
    axios.get(`http://localhost:8001/users/${id}`)
      .then(response => {
        const { user, posts } = response.data;
        setProfile(user);
        setPosts(posts);
        setNewUsername(user.username);
        setProfilePicture(user.picture || 'uploads/user.png'); 
      })
      .catch(error => console.log('Error fetching profile:', error));
  }, []);


  const handleProfileUpdate = () => {
    const formData = new FormData();
    formData.set('username', newUsername);
    if (files?.[0]) {
      formData.set('file', files?.[0]);
    }
       
    axios.put(`http://localhost:8001/users/${id}`, formData, {
      withCredentials: true
    })
    .then(() => {
      return axios.get(`http://localhost:8001/users/${id}`);
    })
    .then(response => {
      const { user } = response.data;
      setProfile(user);
      setProfilePicture(user.picture || 'uploads/user.png');
      setIsEditing(false);
    })
    .catch(error => {
      console.log('Error updating profile:', error);
    });
  };
  

  if (!profile) {
    return <div>Loading...</div>; 
  }

  console.log(profilePicture);

  return (
    <div className='relative p-10'>
      {userInfo.id === id && (
            <button onClick={() => setIsEditing(!isEditing)} className='absolute flex items-center top-2 right-6 text-xl text-dark-lavender'>
              <FaPencilAlt /> {` Edit Profile`}
            </button>
          )}

      {isEditing && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='relative bg-white p-8 rounded shadow-lg w-80'>
          <button onClick={() => setIsEditing(false)} className='absolute top-3 right-3'>
               <FaTimes />
          </button>

            <h2 className='text-lg font-semibold mb-4'>Edit Profile</h2>
            <input 
              type="text" 
              value={newUsername} 
              onChange={(e) => setNewUsername(e.target.value)} 
              placeholder="New username"
              className='border p-2 rounded mb-4 w-full' 
            />

            <input 
              type="file" 
              onChange={(e) => setFiles(e.target.files)} 
              className='mb-4'
            />

            <div className='flex justify-between'>
              <button 
                onClick={handleProfileUpdate} 
                className='bg-lavender text-white p-2 rounded'>
                Update Profile
              </button>
              
              
            </div>
          </div>
        </div>
      )}


      <div className='flex flex-col justify-center items-center space-y-5'>        
         <div className='w-80 h-80 rounded-full border-black border-2 overflow-hidden'>
            <img src={`http://localhost:8001/${profilePicture}`} alt={profile.username}
                 className='h-full w-full object-cover'>
                 </img>
         </div>


         <h1 className='font-semibold lg:text-xl'>{profile.username}</h1>
         <div>
           <h1 className='text-sm xl:text-lg font-semibold mt-10 mb-3'>Posts</h1>
           <div className='grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5'>
           {posts.length > 0 ? (posts.map((p, id) => ( 
              <div key={id} className='post flex flex-row space-x-2 lg:space-x-3'>
                <div className='group relative h-44 md:h-48 lg:h-60 w-2/5 cursor-pointer'>
                   <Link to={`/posts/${p._id}`}>
                      <img src={'http://localhost:8001/'+p.cover}
                          className='group h-full w-full object-cover shadow-lg' alt={p.title}></img>
                      <div className='absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration:300'></div>
                   </Link>
                </div>
                   <div className='flex flex-col justify-center w-3/5'>
                      <Link to={`/posts/${p._id}`}>
                         <h2 className='lg:text-lg text-sm font-bold overflow-hidden line-clamp-2'>{p.title}</h2>
                      </Link>
                      <div className='flex flex-row space-x-6 lg:text-md mt-2 font-semibold text-sm'>
                         <p className='text-black'>@{p.author.username}</p>
                         <p className='text-neutral-400'>{formatISO9075(new Date(p.createdAt))}</p>
                      </div>
                      <p className='lg:text-md text-sm tracking-wider mt-4 overflow-hidden line-clamp-4'
                         dangerouslySetInnerHTML={{__html:p.content}}></p>
                  </div>
             </div>
           ))):
           <p>No posts yet</p>}
           </div>
         </div>
      </div>
    </div>
  )
}

export default Profile