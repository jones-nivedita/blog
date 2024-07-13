import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';

const Register = () => {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) =>{
    e.preventDefault();
    axios.post('http://localhost:8001/register', { username, password })
      .then(response => {
        console.log('User registered:', response.data);
        alert('Registration Successful')
        navigate('/login')
      })
      .catch(error => {
        console.error('Error registering user:', error);
      });
  };

  return (
    <div className='w-full mt-40 flex items-center justify-center'>
      <div className='shadow-lg p-10'>
        <h2 className='text-center text-3xl sm:text-2xl lg:text-5xl'>Register</h2>
        <form onSubmit={handleSubmit}>
          <div className='flex flex-col sm:flex-row text-lg sm:text-xl lg:text-2xl mt-6 space-y-4 sm:space-y-0 sm:space-x-4'>
             <label htmlFor='username' className='sm:flex-shrink-0'>Username:</label>
             <input type='text' 
                    id='username' 
                    name='username'
                    value={username}
                    onChange={(e)=> setUsername(e.target.value)} 
                    className='border-black border-2 rounded-md p-1'></input>
          </div>
          <div className='flex flex-col sm:flex-row text-lg sm:text-xl lg:text-2xl mt-6 space-y-4 sm:space-y-0 sm:space-x-4'>
             <label htmlFor='password' className='sm:flex-shrink-0'>Password:</label>
             <input type='password' 
                    id='password' 
                    name='password' 
                    value={password}
                    onChange={(e)=> setPassword(e.target.value)}
                    className='border-black border-2 rounded-md p-1'></input>
          </div>

          <div className='flex justify-center mt-10'>
             <button type='submit' className='bg-lavender text-white rounded-lg py-2 px-2 text-xl font-semibold hover:bg-dark-lavender transition-colors duration-300'>Register</button>
          </div>
        
        </form>
      </div>
    </div>
  )
}

export default Register;