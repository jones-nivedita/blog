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
    const userId = userInfo?.id;

  return (
    <>
       <header className='flex justify-between text-sm lg:text-lg p-5 lg:p-10 my-auto'>
            <Link to="/" className='font-bold  text-xl lg:text-2xl '>Insightful Ink</Link>
            <nav className='flex items-center lg:space-x-8 space-x-4 font-semibold'>
            {username && (
                <>
                  <Link to="/create">Create new post</Link>
                  <Link to={`/profile/${userId}`}>{username}</Link>
                  <a onClick={logout} className='hover:cursor-pointer'>Logout</a>
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