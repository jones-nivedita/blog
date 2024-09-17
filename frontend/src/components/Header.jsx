import React, { useState } from 'react';
import { Link, unstable_useViewTransitionState, useNavigate } from 'react-router-dom';
import { useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';
import { FaPlus, FaFacebookMessenger } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";

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
       <header className='fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-lg p-5 lg:p-10 my-auto shadow-md'>
       <div className='flex justify-between items-center'>
            <Link to="/" className='font-bold  text-xl lg:text-2xl '>Insightful Ink</Link>
            <nav className='flex items-center lg:space-x-8 space-x-4 font-semibold'>
            {username && (
                <>
                  <Link to="/create"><FaPlus className='text-md lg:text-xl'/></Link>
                  <Link to="/chatlist"> <FaFacebookMessenger className='text-md lg:text-xl' /> </Link>
                  <Link to={`/profile/${userId}`}>{username}</Link>
                  <a onClick={logout} className='hover:cursor-pointer'><FiLogOut className='text-md lg:text-xl'/></a>
                </>
              )} 
              {!username && (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </nav>
          </div>
        </header>
    </>
  )
}

export default Header