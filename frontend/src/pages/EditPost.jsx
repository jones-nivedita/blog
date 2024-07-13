import React from 'react';
import {useEffect, useState} from "react";
import {Navigate, useNavigate, useParams} from "react-router-dom";
import Editor from '../components/Editor';
import axios from 'axios';

const EditPost = () => {

  const navigate = useNavigate();  

  const {id} = useParams();
  const [title,setTitle] = useState('');
  const [content,setContent] = useState('');
  const [files, setFiles] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:8001/posts/${id}`)
    .then(response => {
        setTitle(response.data.title);
        setContent(response.data.content);
    })
  }, []);

  const updatePost = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.set('title', title);
    data.set('content', content);
    data.set('id', id);
    if (files?.[0]) {
      data.set('file', files?.[0]);
    }

    axios.put('http://localhost:8001/posts', data, {
        withCredentials: true
    })
    .then(response => {
        navigate(`/posts/${id}`);
    })
    .catch(err => console.log('Error Editing Post:', err));
  }

  const deletePost = (e) => {
    e.preventDefault();
    axios.delete(`http://localhost:8001/posts/${id}`, {
      withCredentials: true
    })
    .then(response => {
      navigate('/');
      console.log(response.data);
    })
    .catch(err => console.log('Error Deleting Post:', err));
  }

  return (
    <div className='max-w-6xl mx-auto p-10'>
      <form className='space-y-6'>
        <div>
          <input 
            type="text" 
            placeholder='Title' 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className='w-full border-2 border-gray-300 rounded-lg p-2 text-xl focus:outline-none focus:border-black' 
          />
        </div>
        <div>
          <input 
            type="file" 
            onChange={(e) => setFiles(e.target.files)}
            className='w-full text-lg focus:outline-none' 
          />
        </div>
        <div>
           <Editor value={content} onChange={setContent} />
        </div>
        <div className='space-x-5'>
          <button 
            type='submit' 
            onClick={updatePost}
            className='bg-lavender text-white rounded-lg py-2 px-2 text-xl font-semibold hover:bg-dark-lavender transition-colors duration-300'>
            Update
          </button>

          <button 
            type='submit' 
            onClick={deletePost}
            className='bg-lavender text-white rounded-lg py-2 px-2 text-xl font-semibold hover:bg-dark-lavender transition-colors duration-300'>
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditPost