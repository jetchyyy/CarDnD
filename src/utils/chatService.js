// src/utils/chatService.js
import { ref, push, set, onValue, off, get, update } from 'firebase/database';
import { realtimeDb } from '../firebase/firebase';

/**
 * Create or get existing chat between host and guest
 * @param {string} hostId - Host user ID
 * @param {string} guestId - Guest user ID
 * @param {string} bookingId - Booking ID (optional, for context)
 * @returns {Promise<string>} Chat ID
 */
export const createOrGetChat = async (hostId, guestId, bookingId = null) => {
  try {
    // Check if chat already exists
    const chatsRef = ref(realtimeDb, 'chats');
    const snapshot = await get(chatsRef);
    
    if (snapshot.exists()) {
      const chats = snapshot.val();
      
      // Find existing chat between these users
      for (const [chatId, chat] of Object.entries(chats)) {
        if (chat.participants) {
          if (
            chat.participants[hostId] &&
            chat.participants[guestId]
          ) {
            console.log('Existing chat found:', chatId);
            return chatId;
          }
        } else if (chat.bookingId === bookingId && bookingId) {
          // Fallback: find by booking ID for old chats
          console.log('Existing chat found by booking ID:', chatId);
          // Update it with participants
          await update(ref(realtimeDb, `chats/${chatId}`), {
            participants: {
              [hostId]: true,
              [guestId]: true
            }
          });
          return chatId;
        }
      }
    }
    
    // Create new chat if none exists
    const newChatRef = push(ref(realtimeDb, 'chats'));
    const chatId = newChatRef.key;
    
    const chatData = {
      participants: {
        [hostId]: true,
        [guestId]: true
      },
      hostId: hostId,
      guestId: guestId,
      lastMessage: '',
      lastMessageSender: '',
      updatedAt: Date.now(),
      bookingId: bookingId || null,
      createdAt: Date.now(),
      messages: {}
    };
    
    await set(newChatRef, chatData);
    console.log('New chat created:', chatId);
    
    return chatId;
  } catch (error) {
    console.error('Error creating/getting chat:', error);
    throw error;
  }
};

/**
 * Send a message in a chat
 * @param {string} chatId - Chat ID
 * @param {string} senderId - Sender user ID
 * @param {string} message - Message text
 * @param {string} senderName - Sender's name
 * @returns {Promise<string>} Message ID
 */
export const sendMessage = async (chatId, senderId, message, senderName) => {
  try {
    const messageRef = push(ref(realtimeDb, `chats/${chatId}/messages`));
    const messageId = messageRef.key;
    
    const messageData = {
      senderId,
      senderName,
      message,
      timestamp: Date.now()
    };
    
    // Set the message
    await set(messageRef, messageData);
    
    // Update chat's last message
    const chatUpdates = {
      lastMessage: message,
      lastMessageSender: senderName,
      updatedAt: Date.now()
    };
    
    await update(ref(realtimeDb, `chats/${chatId}`), chatUpdates);
    
    console.log('Message sent:', messageId);
    return messageId;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Listen to messages in a chat (real-time)
 * @param {string} chatId - Chat ID
 * @param {Function} callback - Callback function to handle messages
 * @returns {Function} Unsubscribe function
 */
export const listenToMessages = (chatId, callback) => {
  const messagesRef = ref(realtimeDb, `chats/${chatId}/messages`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const messages = [];
    if (snapshot.exists()) {
      const messagesData = snapshot.val();
      
      // Convert object to array
      for (const [messageId, messageData] of Object.entries(messagesData)) {
        messages.push({
          id: messageId,
          ...messageData
        });
      }
      
      // Sort by timestamp (oldest first)
      messages.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    console.log('Messages updated:', messages);
    callback(messages);
  }, (error) => {
    console.error('Error listening to messages:', error);
  });
  
  // Return unsubscribe function
  return unsubscribe;
};

/**
 * Get all chats for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of chats
 */
export const getUserChats = async (userId) => {
  try {
    const chatsRef = ref(realtimeDb, 'chats');
    const snapshot = await get(chatsRef);
    
    const userChats = [];
    if (snapshot.exists()) {
      const chats = snapshot.val();
      
      for (const [chatId, chat] of Object.entries(chats)) {
        if (chat.participants && chat.participants[userId]) {
          userChats.push({
            id: chatId,
            ...chat
          });
        }
      }
    }
    
    // Sort by most recent
    userChats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    
    return userChats;
  } catch (error) {
    console.error('Error getting user chats:', error);
    throw error;
  }
};

/**
 * Listen to user's chats (real-time)
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle chats
 * @returns {Function} Unsubscribe function
 */
export const listenToUserChats = (userId, callback) => {
  const chatsRef = ref(realtimeDb, 'chats');
  
  const unsubscribe = onValue(chatsRef, (snapshot) => {
    const userChats = [];
    if (snapshot.exists()) {
      const chats = snapshot.val();
      
      for (const [chatId, chat] of Object.entries(chats)) {
        if (chat.participants && chat.participants[userId]) {
          userChats.push({
            id: chatId,
            ...chat
          });
        }
      }
    }
    
    // Sort by most recent
    userChats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    
    callback(userChats);
  });
  
  // Return unsubscribe function
  return unsubscribe;
};

/**
 * Get chat details
 * @param {string} chatId - Chat ID
 * @returns {Promise<Object>} Chat data
 */
export const getChatDetails = async (chatId) => {
  try {
    const chatRef = ref(realtimeDb, `chats/${chatId}`);
    const snapshot = await get(chatRef);
    
    if (snapshot.exists()) {
      const chat = snapshot.val();
      return {
        id: chatId,
        ...chat,
        participants: chat.participants || {}
      };
    }
    
    throw new Error('Chat not found');
  } catch (error) {
    console.error('Error getting chat details:', error);
    throw error;
  }
};
