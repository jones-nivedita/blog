import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {formatISO9075} from "date-fns";
import {Link} from 'react-router-dom';

const Home = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() =>{
      axios.get('http://localhost:8001/posts')
      .then(response => setPosts(response.data))
      .catch(err =>{
        console.log('Error fetching posts:' ,err);
      })
    }, []);

  return (
    <div>

        {/* Blogs */}
        <div className='flex justify-center items-center p-5'>
          <div className='w-full'>
            <div className='grid xl:grid-cols-2 lg:grid-cols-1 lg:gap-x-28 lg:gap-y-10 sm:gap-y-5'>
              {posts.length > 0 && posts.map((p, id) => ( 
              <div key={id} className='post flex flex-col sm:flex-row space-y-5 sm:space-y-0 sm:space-x-5'>
                <div className='group relative sm:h-64 lg:h-96 w-full sm:w-2/5  cursor-pointer'>
                   <Link to={`/posts/${p._id}`}>
                      <img src={'http://localhost:8001/'+p.cover}
                          className='group h-full w-full object-cover shadow-lg' alt={p.title}></img>
                      <div className='absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration:300'></div>
                   </Link>
                </div>
                   <div className='flex flex-col lg:pt-10 w-3/5'>
                      <Link to={`/posts/${p._id}`}>
                         <h2 className='lg:text-3xl sm:text-2xl font-bold overflow-hidden line-clamp-2'>{p.title}</h2>
                      </Link>
                      <div className='flex flex-row space-x-6 lg:text-xl mt-4 font-semibold md:textlg sm:text-lg'>
                         <p className='text-black'>@{p.author.username}</p>
                         <p className='text-neutral-400'>{formatISO9075(new Date(p.createdAt))}</p>
                      </div>
                      <p className='lg:text-2xl sm:text-xl tracking-wider mt-6 overflow-hidden line-clamp-4 mb-10'
                         dangerouslySetInnerHTML={{__html:p.content}}></p>
                  </div>
             </div>
           ))}
           </div>
          </div>
        </div>
    </div>
  )
}

export default Home