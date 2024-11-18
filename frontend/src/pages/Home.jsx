import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import {formatISO9075} from "date-fns";
import {Link} from 'react-router-dom';
import debounce from 'lodash.debounce';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [searchInput, setSearchInput] = useState('');
    const [filteredPosts, setFilteredPosts] = useState([]);

    useEffect(() =>{
      axios.get('http://localhost:8001/posts')
      .then(response => {
        setPosts(response.data);
        setFilteredPosts(response.data);
    })
      .catch(err =>{
        console.log('Error fetching posts:' ,err);
      })
    }, []);

    /*const handleSearchChange = (e) => {
      e.preventDefault();
      setSearchInput(e.target.value);
      const filtered = posts.filter((p) =>
        p.title.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.content.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredPosts(filtered);
    };*/

    const handleSearchChange = (e) => {
      setSearchInput(e.target.value);  // Update input immediately
      debouncedFilter(e.target.value);  // Debounce filtering only
    };
    
    const debouncedFilter = useCallback(
      debounce((input) => {
        const filtered = posts.filter((p) =>
          p.title.toLowerCase().includes(input.toLowerCase()) ||
          p.content.toLowerCase().includes(input.toLowerCase())
        );
        setFilteredPosts(filtered);
      }, 300),
      [posts]
    );

    useEffect(() => {
      const filtered = posts.filter((p) =>
        p.title.toLowerCase().includes(searchInput.toLowerCase()) ||
        p.content.toLowerCase().includes(searchInput.toLowerCase())
      );
      setFilteredPosts(filtered);
    }, [searchInput, posts]);

    const renderedPosts = useMemo(() => (
      filteredPosts.map((p) => (
        <div key={p._id} className="post flex flex-row space-x-2 lg:space-x-3">
          <div className="group relative h-44 md:h-48 lg:h-60 w-2/5 cursor-pointer">
            <Link to={`/posts/${p._id}`}>
              {/* Lazy load images */}
              <img
                loading="lazy"
                src={`http://localhost:8001/${p.cover}`}
                className="group h-full w-full object-cover shadow-lg rounded-md"
                alt={p.title}
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 rounded-md group-hover:opacity-100 transition-opacity duration:300"></div>
            </Link>
          </div>
          <div className="flex flex-col justify-center w-3/5">
            <Link to={`/posts/${p._id}`}>
              <h2 className="lg:text-lg text-sm font-bold overflow-hidden line-clamp-2">{p.title}</h2>
            </Link>
            <div className="flex flex-row space-x-6 lg:text-md mt-2 font-semibold text-sm">
              <Link to={`/profile/${p.author._id}`}>
                <p className="text-black">@{p.author.username}</p>
              </Link>
              <p className="text-neutral-400">{formatISO9075(new Date(p.createdAt))}</p>
            </div>
            <p className="lg:text-md text-sm tracking-wider mt-4 overflow-hidden line-clamp-4"
              dangerouslySetInnerHTML={{ __html: p.content }}>
            </p>
          </div>
        </div>
      ))
    ), [filteredPosts]);

  return (
    <>
        {/* Search */}
        <div className='flex justify-center my-10'>
          <div className='bg-neutral-100 rounded w-60 md:w-80'>
            <input type='text' 
                   className='bg-transparent outline-none px-4 py-2'
                   value={searchInput}
                   onChange={handleSearchChange}
                   placeholder='Search...'></input>
          </div>
        </div>

        {/* Blogs */}
        <div className='flex justify-center items-center p-5'>
          <div className='w-full'>
            <div className='grid xl:grid-cols-2 grid-cols-1 lg:gap-x-10 lg:gap-y-6 gap-10'>
            {renderedPosts.length > 0 ? renderedPosts : <p>No posts found.</p>}
           </div>
          </div>
        </div>
    </>
  )
}

export default Home