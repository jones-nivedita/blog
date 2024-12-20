import React, {useContext, useState, useEffect, useRef} from 'react';
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
              className="w-full h-24 object-cover rounded-md"
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
          className={`px-2 py-1 rounded-lg ${
            message.sender === userInfo?.id ? 'bg-dark-lavender text-white self-end' : 'bg-gray-200 text-black'
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

    const newMessage = {
      chatId: currentChat._id,
      sender: userInfo.id,
      text: message,
    };

    try {
      socket.emit('chat_message', newMessage);

      setCurrentChat((prevChat) => ({
        ...prevChat,
        messages: [...prevChat.messages, newMessage], 
      }));

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
  }, [currentChat]);


  if (!currentChat || !currentChat.messages) return <div>No messages available.</div>;

  return (
    <div className="flex flex-col p-2 h-[calc(100vh-160px)]">
      {/* Chat Header (fixed at the top) */}
      <div className="flex items-center space-x-3 mx-1 sticky top-0 bg-lavender rounded p-4 shadow-md z-10">
        <img
          src={chatPartner?.picture
            ? `http://localhost:8001/${chatPartner.picture}`
            : 'http://localhost:8001/uploads/user.png'}
          alt={chatPartner?.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <h2 className="text-lg font-semibold">{chatPartner?.username || 'Chat Partner'}</h2>
      </div>

      {/* Messages Container */}
      <div className="overflow-y-auto">
        {currentChat.messages.map((message) => (
          <div
            key={message._id}
            className={`flex mt-2 mb-1 ${message.sender === userInfo?.id ? 'justify-end' : 'justify-start'}`}
          >
            {renderMessage(message)}
          </div>
        ))}
      </div>

      {/* Input Area (fixed at the bottom) */}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2 p-4 border-t bg-white sticky bottom-0 z-10">
        <input
          type="text"
          value={message}
          onChange={handleMessageChange}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-lg"
        />
        <button type="submit">
          <LuSendHorizonal />
        </button>
      </form>
    </div>

  )
}

export default Chat