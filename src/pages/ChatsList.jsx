import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, User } from 'lucide-react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { listenToUserChats } from '../utils/chatService';

const ChatsList = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const currentUser = auth.currentUser;

  // Fetch user details from Firestore Users collection
  const fetchUserDetails = async (userId) => {
    if (!userId) {
      return { id: null, name: 'User', photoUrl: null };
    }

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          id: userId,
          name: userData.name || 'User',
          email: userData.email || '',
          photoUrl: userData.photoUrl || null,
          location: userData.location || '',
          idVerificationStatus: userData.idVerificationStatus || 'pending'
        };
      }
      return { id: userId, name: 'User', photoUrl: null };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return { id: userId, name: 'User', photoUrl: null };
    }
  };

  // Get other user ID from chat
  const getOtherUserId = (chat, currentUserId) => {
    // Check participants object (your structure)
    if (chat.participants && typeof chat.participants === 'object') {
      const participantIds = Object.keys(chat.participants).filter(
        id => chat.participants[id] === true && id !== currentUserId
      );
      
      if (participantIds.length > 0) {
        return participantIds[0];
      }
    }

    // Fallback: Check hostId and guestId
    if (chat.hostId && chat.hostId !== currentUserId) {
      return chat.hostId;
    }
    if (chat.guestId && chat.guestId !== currentUserId) {
      return chat.guestId;
    }

    // Fallback: Check users array (legacy)
    if (chat.users && Array.isArray(chat.users)) {
      const otherUser = chat.users.find(id => id !== currentUserId);
      if (otherUser) {
        return otherUser;
      }
    }

    return null;
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    
    const unsubscribe = listenToUserChats(currentUser.uid, async (userChats) => {
      setChats(userChats);
      
      // Fetch user details for all chat participants
      const userDetailsMap = {};
      
      for (const chat of userChats) {
        const otherUserId = getOtherUserId(chat, currentUser.uid);
        
        if (otherUserId && !userDetailsMap[otherUserId]) {
          const details = await fetchUserDetails(otherUserId);
          userDetailsMap[otherUserId] = details;
        }
      }
      
      setUserDetails(userDetailsMap);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, navigate]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? 'Just now' : `${minutes}m ago`;
    }
    
    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // This week
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    
    // Older
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherUserInfo = (chat) => {
    const otherUserId = getOtherUserId(chat, currentUser.uid);
    const details = userDetails[otherUserId];
    
    return details || { name: 'User', photoUrl: null };
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name || name === 'User') return 'U';
    const names = name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Chat with hosts and guests</p>
        </div>

        {/* Chats List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conversations...</p>
              </div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
              <p className="text-gray-400 text-sm">Your messages will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {chats.map((chat) => {
                const otherUser = getOtherUserInfo(chat);
                
                return (
                  <div
                    key={chat.id}
                    onClick={() => navigate(`/chat/${chat.id}`)}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      {otherUser.photoUrl ? (
                        <img
                          src={otherUser.photoUrl}
                          alt={otherUser.name}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {getUserInitials(otherUser.name)}
                        </div>
                      )}

                      {/* Chat Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {otherUser.name}
                            </h3>
                            {otherUser.idVerificationStatus === 'approved' && (
                              <span className="inline-flex items-center text-xs text-green-600">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {formatTime(chat.updatedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage ? (
                            <>
                              {chat.lastMessageSender && chat.lastMessageSender !== currentUser.displayName && (
                                <span className="font-medium">{chat.lastMessageSender}: </span>
                              )}
                              {chat.lastMessage}
                            </>
                          ) : (
                            <span className="text-gray-400">No messages yet</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatsList;