import React, {useContext, useState, useEffect} from 'react';
import { UserContext } from '../components/UserContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { LuSendHorizonal } from "react-icons/lu";
import socket from '../components/socketClient';


const Chat = ({chat, chatPartner}) => {

  const { userInfo } = useContext(UserContext);
  const [posts, setPosts] = useState({});
  const [message, setMessage] = useState('');
  const [currentChat, setCurrentChat] = useState(chat);

  useEffect(() => {
    setCurrentChat(chat);
  }, [chat]);


  const fetchPost = async (postId) => {
    try {
      const response = await axios.get(`http://localhost:8001/posts/${postId}`);
      setPosts((prevPosts) => ({ ...prevPosts, [postId]: response.data }));
    } catch (error) {
      console.error('Error fetching post:', error);
    }
  };

  const renderMessage = (message) => {
    if (!message) return null;
    if (message.post) {
      if (!posts[message.post]) {
        fetchPost(message.post);
        return <div>Loading...</div>; 
      }

      const post = posts[message.post];

      return (
        <Link to={`/posts/${post._id}`}>
          <div className="flex flex-col items-center space-x-4 p-2 bg-gray-100 rounded-lg max-w-40">
            <img 
              src={`http://localhost:8001/${post.cover}`} 
              alt={post.title}
              className="w-24 h-24 object-cover rounded-md"
            />
            <div>
              <p className="font-semibold overflow-hidden line-clamp-2">{post.title}</p>
            </div>
          </div>
        </Link>
      );
    } else if (message.text) {
      return (
        <div 
          className={`p-2 rounded-lg ${
            message.sender === userInfo.id ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-black'
          }`}
        >
          <p>{message.text}</p>
        </div>
      );
    }
    return null;
  };

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();
    if (message.trim() === '') return;

    try {
      socket.emit('chat_message', {
        chatId: currentChat._id,  
        sender: userInfo.id,     
        text: message,           
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    socket.on('chat_message', (updatedChat) => {
      if (updatedChat._id === currentChat._id) {
        setCurrentChat(updatedChat);
      }
    });
  
    return () => {
      socket.off('chat_message');
    };
  }, [currentChat._id]);

  if (!currentChat || !currentChat.messages) return <div>No messages available.</div>;

  return (
    <>
    <div className="flex flex-col h-full p-4 space-y-2 overflow-y-auto">
      <div className="flex items-center space-x-3 sticky top-0 bg-lavender rounded p-4 shadow-md">
        <img 
        src={chatPartner?.picture
          ? `http://localhost:8001/${chatPartner.picture}`
          : 'http://localhost:8001/uploads/user.png'}
        alt={chatPartner?.username}
        className="w-12 h-12 rounded-full object-cover"></img>
        <h2 className="text-lg font-semibold">{chatPartner?.username || 'Chat Partner'}</h2>
      </div>
      {currentChat.messages.map((message) => (
        <div key={message._id} className={`flex ${message.sender === userInfo.id ? 'justify-end' : 'justify-start'}`}>
          {renderMessage(message)}
        </div>
      ))}
  </div>

  <form onSubmit={handleSendMessage} className="flex items-center space-x-2 p-4 border-t bg-white sticky bottom-0">
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-lg"
        />
        <button type="submit" >
           <LuSendHorizonal />
        </button>
      </form>
  </>
  )
}

export default Chat