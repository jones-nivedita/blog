import React from 'react';
import { useState } from 'react';
import Editor from '../components/Editor';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

const CreatePost = () => {

    const navigate= useNavigate();

    const [title,setTitle] = useState('');
    const [content,setContent] = useState('');
    const [files, setFiles] = useState('');

    const createNewPost = (e) =>{
        const data = new FormData();
        data.set('title', title);
        data.set('content', content);
        data.set('file', files[0]);

        e.preventDefault();
        axios.post('http://localhost:8001/posts', data, {
            withCredentials: true,
            headers: {
              'Content-Type': 'multipart/form-data',
            },
        })
        .then(response =>{
            console.log(response.data);
            navigate('/');
        })
        .catch(error =>{
            console.log('Error posting:',error)
        })
    }

  return (
    <div className='max-w-6xl mx-auto p-10'>
      <form className='space-y-6' onSubmit={createNewPost}>
        <div>
          <input 
            type="text" 
            placeholder='Title' 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full border-2 border-gray-300 rounded-lg p-2 text-sm lg:text-md focus:outline-none focus:border-black' 
          />
        </div>
        <div>
          <input 
            type="file" 
            onChange={(e) => setFiles(e.target.files)}
            className='w-full text-sm lg:text-md  focus:outline-none' 
          />
        </div>
        <div>
           <Editor value={content} onChange={setContent} />
        </div>
        <div>
          <button 
            type='submit' 
            className='bg-lavender text-white rounded-lg py-2 px-2 text-sm lg:text-md  font-semibold hover:bg-dark-lavender transition-colors duration-300'>
            Create Post
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost