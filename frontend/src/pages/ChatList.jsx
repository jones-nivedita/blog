import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../components/UserContext';
import axios from 'axios';
import socket from '../components/socketClient';
import Chat from './Chat';

const ChatList = () => {

  const [chats, setChats] = useState([]);
  const { userInfo } = useContext(UserContext);
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedChatPartner, setSelectedChatPartner] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login'); 
    } else {
        axios.get(`http://localhost:8001/chats/${userInfo?.id}`, { withCredentials: true })
          .then(response => setChats(response.data))
          .catch(error => console.log('Error fetching chat list:', error));
    }
  }, [userInfo, navigate]);

  
  const getChatPartner = (chat) => {
    return chat.users[0]?._id === userInfo.id ? chat.users[1] : chat.users[0];
  };

  const renderLastMessage = (chat) => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    
    if (lastMessage) {
      if (lastMessage.post) {
        return "Shared a post";
      } else if (lastMessage.text) {
        return lastMessage.text;
      }
    }
    return "No messages yet"; 
  };

  const handleChatSelection = (chat) => {
    setSelectedChat(chat);
    setSelectedChatPartner(getChatPartner(chat));
  };

  return (
   <div className='flex'>
    <div className='w-2/5 border-r-2 border-neutral-500 overflow-y-auto'>
      <div className="chat-list-container p-5">
        <h2 className="text-2xl font-bold mb-4">Chats</h2>
           {chats.length === 0 ? (
               <p className="text-lg text-gray-500">No chats yet</p>
             ) : (
           <ul className="space-y-4">
             {chats.map(chat => {
              const chatPartner = getChatPartner(chat);
              return (
               <li key={chat._id} className="flex items-center space-x-4 bg-white shadow p-3 rounded-lg cursor-pointer" onClick={() => handleChatSelection(chat)}>
                 <img 
                  src={chatPartner?.picture
                    ? `http://localhost:8001/${chatPartner.picture}`
                    : 'http://localhost:8001/uploads/user.png'}
                  alt={chatPartner?.username}
                  className="w-12 h-12 rounded-full object-cover"
                 />
                 <div>
                    <p className="text-lg font-semibold">
                        {chatPartner?.username || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">
                       {renderLastMessage(chat)}
                    </p>
                 </div>
               </li>
              );
            })}
           </ul>
             )}
      </div>
    </div>

    <div className='w-4/5'>
    {selectedChat === null ? (
          <div className='text-center'>Your chat will be displayed here</div>
        ) : (
          <Chat chat={selectedChat} chatPartner={selectedChatPartner} />
        )}
    </div>
  </div>
  )
};

export default ChatList