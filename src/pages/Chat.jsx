import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User } from 'lucide-react';
import { auth } from '../firebase/firebase';
import { sendMessage, listenToMessages, getChatDetails } from '../utils/chatService';

const Chat = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [chatDetails, setChatDetails] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUser = auth.currentUser;

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat details and other user info
  useEffect(() => {
    const fetchChatInfo = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching chat details for chatId:', chatId);
        const chat = await getChatDetails(chatId);
        console.log('Chat details received:', chat);
        setChatDetails(chat);

        // Get other user ID from participants (new format) or users (old format)
        let otherUserId = null;
        
        if (chat.participants && typeof chat.participants === 'object') {
          const participantIds = Object.keys(chat.participants).filter(id => id !== 'true' && id !== 'false');
          otherUserId = participantIds.find(uid => uid !== currentUser.uid);
          console.log('Other user ID from participants:', otherUserId);
        } else if (chat.users && Array.isArray(chat.users)) {
          otherUserId = chat.users.find(uid => uid !== currentUser.uid);
          console.log('Other user ID from users array:', otherUserId);
        }
        
        if (otherUserId) {
          setOtherUser({
            id: otherUserId,
            name: 'User'
          });
        } else {
          console.warn('Could not determine other user:', chat);
          setError('Could not load chat participant information');
        }
      } catch (err) {
        console.error('Error fetching chat info:', err);
        setError('Failed to load chat: ' + err.message);
      }
    };

    if (chatId && currentUser) {
      fetchChatInfo();
    }
  }, [chatId, currentUser, navigate]);

  // Listen to messages in real-time
  useEffect(() => {
    if (!chatId) {
      console.log('No chatId provided');
      return;
    }

    console.log('Setting up message listener for chatId:', chatId);
    setLoading(true);
    let unsubscribe;
    
    try {
      unsubscribe = listenToMessages(chatId, (fetchedMessages) => {
        console.log('Messages received from listener:', fetchedMessages);
        setMessages(fetchedMessages);
        setLoading(false);
      });
    } catch (err) {
      console.error('Error setting up message listener:', err);
      setError('Failed to load messages: ' + err.message);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        console.log('Unsubscribing from messages');
        unsubscribe();
      }
    };
  }, [chatId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const senderName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
      console.log('Sending message:', { chatId, senderId: currentUser.uid, message: newMessage, senderName });
      
      await sendMessage(chatId, currentUser.uid, newMessage.trim(), senderName);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
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
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {otherUser?.name || 'Chat'}
            </h2>
            <p className="text-xs text-gray-500">Online</p>
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
    </div>
  );
};

export default Chat;
