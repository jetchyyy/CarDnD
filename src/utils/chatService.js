// Updated chatService.js with better handling of incomplete chat structures
import { ref, push, set, onValue, off, get, update } from 'firebase/database';
import { realtimeDb } from '../firebase/firebase';

/**
 * Get unread message count for a user across all chats
 * @param {string} userId - User ID
 * @param {Array} userChats - Array of user's chats
 * @returns {number} Total unread message count
 */
export const getUnreadMessageCount = (userId, userChats) => {
  let totalUnread = 0;

  userChats.forEach(chat => {
    if (chat.lastMessage && chat.updatedAt) {
      const lastSeenKey = `lastSeen_${userId}`;
      const lastSeenTime = chat[lastSeenKey] || 0;
      const lastMessageTime = chat.updatedAt || 0;

      // If message is newer than last seen AND wasn't sent by current user
      if (lastMessageTime > lastSeenTime && chat.lastMessageSenderId !== userId) {
        totalUnread++;
      }
    }
  });

  return totalUnread;
};

/**
 * Get unread chats (chats with unread messages)
 * @param {string} userId - User ID
 * @param {Array} userChats - Array of user's chats
 * @returns {Array} Array of chats with unread messages
 */
export const getUnreadChats = (userId, userChats) => {
  return userChats.filter(chat => {
    if (!chat.lastMessage || !chat.updatedAt) return false;

    const lastSeenKey = `lastSeen_${userId}`;
    const lastSeenTime = chat[lastSeenKey] || 0;
    const lastMessageTime = chat.updatedAt || 0;

    return lastMessageTime > lastSeenTime && chat.lastMessageSenderId !== userId;
  });
};

/**
 * Extract participant IDs from a chat object
 * @param {Object} chat - Chat object
 * @param {string} currentUserId - Current user's ID
 * @returns {Array} Array of participant IDs (excluding current user)
 */
const getOtherParticipants = (chat, currentUserId) => {
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

  return Array.from(participants);
};

/**
 * Get all participant IDs from a chat (including current user)
 * @param {Object} chat - Chat object
 * @returns {Array} Array of all participant IDs
 */
const getAllParticipants = (chat) => {
  const participants = new Set();

  // Method 1: Check participants object
  if (chat.participants && typeof chat.participants === 'object') {
    Object.keys(chat.participants).forEach(id => {
      if (id !== 'true' && id !== 'false' && chat.participants[id] === true) {
        participants.add(id);
      }
    });
  }

  // Method 2: Check hostId and guestId
  if (chat.hostId) {
    participants.add(chat.hostId);
  }
  if (chat.guestId) {
    participants.add(chat.guestId);
  }

  // Method 3: Check users array (legacy)
  if (chat.users && Array.isArray(chat.users)) {
    chat.users.forEach(id => participants.add(id));
  }

  return Array.from(participants);
};

/**
 * Fix incomplete chat structure by adding missing participants
 * @param {string} chatId - Chat ID
 * @param {Object} chat - Chat object
 */
const fixChatStructure = async (chatId, chat) => {
  try {
    const allParticipants = getAllParticipants(chat);
    
    // If we have participants but no participants object, fix it
    if (allParticipants.length > 0 && (!chat.participants || Object.keys(chat.participants).length === 0)) {
      const participantsObj = {};
      allParticipants.forEach(id => {
        participantsObj[id] = true;
      });

      await update(ref(realtimeDb, `chats/${chatId}`), {
        participants: participantsObj
      });

      console.log(`Fixed chat structure for ${chatId}`);
    }
  } catch (error) {
    console.error('Error fixing chat structure:', error);
  }
};

/**
 * Create or get existing chat between host and guest
 * @param {string} hostId - Host user ID
 * @param {string} guestId - Guest user ID
 * @param {string} bookingId - Booking ID (optional, for context)
 * @returns {Promise<string>} Chat ID
 */
export const createOrGetChat = async (hostId, guestId, bookingId = null) => {
  try {
    const chatsRef = ref(realtimeDb, 'chats');
    const snapshot = await get(chatsRef);

    if (snapshot.exists()) {
      const chats = snapshot.val();

      // Look for existing chat between these users
      for (const [chatId, chat] of Object.entries(chats)) {
        const participants = getAllParticipants(chat);
        
        // Check if both users are in this chat
        if (participants.includes(hostId) && participants.includes(guestId)) {
          // Fix structure if needed
          await fixChatStructure(chatId, chat);
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
      lastMessageSenderId: '',
      updatedAt: Date.now(),
      bookingId: bookingId || null,
      createdAt: Date.now(),
      [`lastSeen_${hostId}`]: Date.now(),
      [`lastSeen_${guestId}`]: Date.now()
    };

    await set(newChatRef, chatData);

    return chatId;
  } catch (error) {
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
    
    // Update chat's last message - DO NOT update sender's lastSeen
    const chatUpdates = {
      lastMessage: message,
      lastMessageSender: senderName,
      lastMessageSenderId: senderId,
      updatedAt: Date.now()
    };
    
    await update(ref(realtimeDb, `chats/${chatId}`), chatUpdates);
    
    return messageId;
  } catch (error) {
    throw error;
  }
};

/**
 * Mark chat as read for a user
 * @param {string} chatId - Chat ID
 * @param {string} userId - User ID
 */
export const markChatAsRead = async (chatId, userId) => {
  try {
    const chatUpdates = {
      [`lastSeen_${userId}`]: Date.now()
    };

    await update(ref(realtimeDb, `chats/${chatId}`), chatUpdates);
  } catch (error) {
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

      for (const [messageId, messageData] of Object.entries(messagesData)) {
        messages.push({
          id: messageId,
          ...messageData
        });
      }

      messages.sort((a, b) => a.timestamp - b.timestamp);
    }

    callback(messages);
  }, (error) => {
    throw error;
  });

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
        const participants = getAllParticipants(chat);
        
        if (participants.includes(userId)) {
          // Fix structure if needed
          await fixChatStructure(chatId, chat);
          
          userChats.push({
            id: chatId,
            ...chat
          });
        }
      }
    }

    userChats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    return userChats;
  } catch (error) {
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
        const participants = getAllParticipants(chat);
        
        if (participants.includes(userId)) {
          userChats.push({
            id: chatId,
            ...chat
          });
        }
      }
    }

    userChats.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    callback(userChats);
  });

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
      
      // Fix structure if needed
      await fixChatStructure(chatId, chat);
      
      return {
        id: chatId,
        ...chat,
        participants: chat.participants || {}
      };
    }

    throw new Error('Chat not found');
  } catch (error) {
    throw error;
  }
};

/**
 * Get other user ID from a chat
 * @param {Object} chat - Chat object
 * @param {string} currentUserId - Current user's ID
 * @returns {string|null} Other user's ID
 */
export const getOtherUserId = (chat, currentUserId) => {
  const others = getOtherParticipants(chat, currentUserId);
  return others.length > 0 ? others[0] : null;
};