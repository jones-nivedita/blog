import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';
import { Navigate } from 'react-router-dom';

const Header = () => {

    const navigate = useNavigate();

    const {userInfo, setUserInfo} = useContext(UserContext);

    useEffect(()=>{
        axios.get('http://localhost:8001/profile', {
            withCredentials: true
        })
        .then(response => {
              console.log(response.data);
              setUserInfo(response.data);
          })
        .catch(error =>{
            console.log('Error loading user info:', error);
        })
    }, [])

    const logout = () =>{
        axios.post('http://localhost:8001/logout', {
            withCredentials: true
        })
        .then(response => {
            setUserInfo(null);
            navigate('/login');
            console.log('User logged out:', response.data);
          })
        .catch(error => {
            console.log('Error logging out user:' ,error);
          })
    }

    const username = userInfo?.username;

  return (
    <>
       <header className='flex justify-between xl:text-2xl sm:text-xl p-10 my-auto'>
            <Link to="/" className='font-bold xl:text-4xl sm:text-3xl'>Insightful Ink</Link>
            <nav className='flex space-x-8 font-semibold'>
            {username && (
                <>
                  <Link to="/create">Create new post</Link>
                  <a onClick={logout} className='hover:cursor-pointer'>Logout ({username})</a>
                </>
              )}
              {!username && (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </nav>
        </header>
    </>
  )
}

export default Header