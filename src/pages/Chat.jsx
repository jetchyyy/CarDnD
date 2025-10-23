import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User, Flag, Shield } from 'lucide-react';
import { auth, db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { sendMessage, listenToMessages, getChatDetails, markChatAsRead } from '../utils/chatService';
import FileAReportModal from '../components/reusables/FileAReportModal';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatDetails, setChatDetails] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = auth.currentUser;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user details from Firestore Users collection
  const fetchUserDetails = async (userId) => {
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
          phone: userData.phone || '',
          role: userData.role || 'guest',
          idVerificationStatus: userData.idVerificationStatus || 'pending',
          idType: userData.idType || null,
          createdAt: userData.createdAt || null
        };
      } else {
        return {
          id: userId,
          name: 'User',
          email: '',
          photoUrl: null,
          location: '',
          phone: '',
          role: 'guest',
          idVerificationStatus: 'pending'
        };
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      return {
        id: userId,
        name: 'User',
        email: '',
        photoUrl: null,
        location: '',
        phone: '',
        role: 'guest',
        idVerificationStatus: 'pending'
      };
    }
  };

  // Fetch chat details and other user info
  useEffect(() => {
    const fetchChatInfo = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      setLoadingUser(true);
      try {
        const chat = await getChatDetails(chatId);
        setChatDetails(chat);

        // Helper function to get other user ID
        const getOtherUserId = (chat, currentUserId) => {
          const participants = new Set();

          // Method 1: Check participants object
          if (chat.participants && typeof chat.participants === 'object') {
            Object.keys(chat.participants).forEach(id => {
              if (id !== 'true' && id !== 'false' && id !== currentUserId && chat.participants[id] === true) {
                participants.add(id);
              }
            });
          }

          // Method 2: Check hostId and guestId
          if (chat.hostId && chat.hostId !== currentUserId) {
            participants.add(chat.hostId);
          }
          if (chat.guestId && chat.guestId !== currentUserId) {
            participants.add(chat.guestId);
          }

          // Method 3: Check users array (legacy)
          if (chat.users && Array.isArray(chat.users)) {
            chat.users.forEach(id => {
              if (id !== currentUserId) {
                participants.add(id);
              }
            });
          }

          const participantArray = Array.from(participants);
          return participantArray.length > 0 ? participantArray[0] : null;
        };

        // Get other user ID using the helper function
        const otherUserId = getOtherUserId(chat, currentUser.uid);
        
        if (otherUserId) {
          // Fetch full user details from Firestore Users collection
          const userDetails = await fetchUserDetails(otherUserId);
          setOtherUser(userDetails);
        } else {
          setError('Could not load chat participant information');
        }
      } catch (err) {
        setError('Failed to load chat: ' + err.message);
      } finally {
        setLoadingUser(false);
      }
    };

    if (chatId && currentUser) {
      fetchChatInfo();
    }
  }, [chatId, currentUser, navigate]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!chatId) {
      return;
    }

    setLoading(true);
    let unsubscribe;
    
    try {
      unsubscribe = listenToMessages(chatId, (fetchedMessages) => {
        setMessages(fetchedMessages);
        setLoading(false);
        
        // Only mark as read if the current user is the RECEIVER (not the sender of the last message)
        if (currentUser && document.hasFocus() && fetchedMessages.length > 0) {
          const lastMessage = fetchedMessages[fetchedMessages.length - 1];
          // Only mark as read if last message was from someone else
          if (lastMessage.senderId !== currentUser.uid) {
            setTimeout(() => {
              markChatAsRead(chatId, currentUser.uid);
            }, 500);
          }
        }
      });
    } catch (err) {
      setError('Failed to load messages: ' + err.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatId, currentUser]);

  // Mark as read when window gains focus (only if receiver)
  useEffect(() => {
    const handleFocus = () => {
      if (currentUser && chatId && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        // Only mark as read if last message was from someone else
        if (lastMessage.senderId !== currentUser.uid) {
          setTimeout(() => {
            markChatAsRead(chatId, currentUser.uid);
          }, 1000);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [chatId, currentUser, messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const senderName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
      
      await sendMessage(chatId, currentUser.uid, newMessage.trim(), senderName);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message: ' + err.message);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) {
      return 'Just now';
    }
    
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    if (diff < 604800000) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-3 flex-1">
          {loadingUser ? (
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          ) : otherUser?.photoUrl ? (
            <img
              src={otherUser.photoUrl}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getUserInitials(otherUser?.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {loadingUser ? (
              <div className="space-y-1">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
            ) : (
              <>
                <h2 className="font-semibold text-gray-900 truncate">
                  {otherUser?.name || 'Chat'}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 truncate">
                    {otherUser?.location || 'Online'}
                  </p>
                  {otherUser?.idVerificationStatus === 'approved' && (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <svg className="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
          title="Report user"
          disabled={loadingUser}
        >
          <Flag className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
        </button>
      </div>

      {/* Safety Warning Banner */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
        <div className="flex items-start gap-3 max-w-4xl mx-auto">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Stay Safe:</span> To avoid scams, make sure to book using Cardnd. 
              If the user tries to book not from the app, you can{' '}
              <button 
                onClick={() => setShowReportModal(true)}
                className="font-semibold underline hover:text-blue-700"
                disabled={loadingUser}
              >
                report them
              </button>.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 m-4 rounded">
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No messages yet</p>
            <p className="text-gray-400 text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === currentUser.uid;
            
            return (
              <div
                key={msg.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  {!isCurrentUser && (
                    <p className="text-xs text-gray-500 mb-1 ml-2">{msg.senderName}</p>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${isCurrentUser ? 'text-right mr-2' : 'ml-2'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-full transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Report Modal */}
      <FileAReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        chatId={chatId}
        reportedUserId={otherUser?.id}
        reportedUserName={otherUser?.name}
      />
    </div>
  );
};

export default Chat;