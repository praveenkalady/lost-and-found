import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, TextInput, Button, Badge, Avatar } from 'flowbite-react';
import api from '../utils/api';
import { initializeSocket, getSocket } from '../utils/socket';

function Messages() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (currentUser) {
      // Initialize socket
      const socket = initializeSocket(currentUser.id);
      fetchConversations();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (message) => {
      console.log('New message received:', message);
      
      // Update messages if in the same conversation
      if (selectedConversation && 
          message.item_id === selectedConversation.item_id &&
          message.sender_id === selectedConversation.other_user_id) {
        setMessages(prev => [...prev, message]);
      }
      
      // Always update conversation list
      fetchConversations();
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [currentUser, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.other_user_id, selectedConversation.item_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      let convList = response.data.conversations;
      
      // Auto-select conversation if navigated from link
      if (location.state?.ownerId !== undefined) {
        const targetConv = convList.find(
          conv => conv.item_id === location.state.itemId && 
                  conv.other_user_id === location.state.ownerId
        );
        
        if (targetConv) {
          // Existing conversation found
          setSelectedConversation(targetConv);
        } else {
          // Create a temporary conversation object if no messages exist yet
          const tempConv = {
            item_id: location.state.itemId,
            other_user_id: location.state.ownerId,
            other_user_name: location.state.ownerName,
            item_title: location.state.itemTitle,
            message_text: '',
            created_at: new Date().toISOString()
          };
          // Add to conversation list so it shows in sidebar
          convList = [tempConv, ...convList];
          setSelectedConversation(tempConv);
        }
        // Clear the navigation state
        window.history.replaceState({}, document.title);
      }
      
      setConversations(convList);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId, itemId) => {
    try {
      const itemIdParam = itemId === null ? 'null' : itemId;
      const response = await api.get(`/messages/conversation/${userId}/${itemIdParam}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        receiver_id: selectedConversation.other_user_id,
        item_id: selectedConversation.item_id,
        message_text: messageText
      });

      // Send via socket for real-time update
      const socket = getSocket();
      if (socket) {
        socket.emit('send_message', {
          receiver_id: selectedConversation.other_user_id,
          item_id: selectedConversation.item_id,
          message_text: messageText,
          sender_id: currentUser.id,
          sender_name: currentUser.full_name
        });
      }

      // Add to local messages
      setMessages(prev => [...prev, response.data.data]);
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>

      <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 16rem)' }}>
        {/* Conversations List */}
        <div className="col-span-12 md:col-span-4">
          <Card className="h-full flex flex-col">
            <h2 className="text-lg font-bold mb-4 pb-3 border-b">Conversations</h2>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No conversations yet</p>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <div
                      key={`${conv.item_id}-${conv.other_user_id}`}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-3 rounded-lg cursor-pointer transition-all ${
                        selectedConversation?.item_id === conv.item_id &&
                        selectedConversation?.other_user_id === conv.other_user_id
                          ? 'bg-black text-white'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar 
                          placeholderInitials={conv.other_user_name.charAt(0)} 
                          rounded
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <p className={`font-semibold text-sm truncate ${
                              selectedConversation?.item_id === conv.item_id &&
                              selectedConversation?.other_user_id === conv.other_user_id
                                ? 'text-white'
                                : 'text-gray-900'
                            }`}>
                              {conv.other_user_name}
                            </p>
                            <span className={`text-xs ml-2 flex-shrink-0 ${
                              selectedConversation?.item_id === conv.item_id &&
                              selectedConversation?.other_user_id === conv.other_user_id
                                ? 'text-gray-300'
                                : 'text-gray-400'
                            }`}>
                              {formatDate(conv.created_at)}
                            </span>
                          </div>
                          <p className={`text-xs truncate mb-1 ${
                            selectedConversation?.item_id === conv.item_id &&
                            selectedConversation?.other_user_id === conv.other_user_id
                              ? 'text-gray-300'
                              : 'text-gray-500'
                          }`}>
                            {conv.item_title}
                          </p>
                          <p className={`text-xs truncate ${
                            selectedConversation?.item_id === conv.item_id &&
                            selectedConversation?.other_user_id === conv.other_user_id
                              ? 'text-gray-300'
                              : 'text-gray-600'
                          }`}>
                            {conv.message_text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="col-span-12 md:col-span-8">
          <Card className="h-full flex flex-col p-0 overflow-hidden">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="border-b px-6 py-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      placeholderInitials={selectedConversation.other_user_name.charAt(0)} 
                      rounded 
                      size="md"
                    />
                    <div>
                      <h3 className="font-bold text-lg">{selectedConversation.other_user_name}</h3>
                      <p className="text-sm text-gray-600">About: {selectedConversation.item_title}</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwn = msg.sender_id === currentUser.id;
                      return (
                        <div key={index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${
                            isOwn ? 'order-2' : 'order-1'
                          }`}>
                            <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                              isOwn 
                                ? 'bg-black text-white rounded-br-sm' 
                                : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.message_text}</p>
                            </div>
                            <p className={`text-xs text-gray-500 mt-1 px-1 ${
                              isOwn ? 'text-right' : 'text-left'
                            }`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t px-6 py-4 bg-white">
                  <form onSubmit={sendMessage} className="flex gap-3">
                    <TextInput
                      type="text"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button 
                      type="submit" 
                      color="dark" 
                      disabled={sending || !messageText.trim()}
                      className="px-6"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-50">
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-lg font-semibold text-gray-700 mb-2">No conversation selected</p>
                  <p className="text-sm text-gray-500">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Messages;
