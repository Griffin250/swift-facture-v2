import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageCircle, Minus, X, UserCircle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
// import { useTranslation } from 'react-i18next'; // Uncomment if you use translations

const ChatPanel = () => {
  // const { t } = useTranslation('chatbot'); // Uncomment if you use translations
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [realtimeSub, setRealtimeSub] = useState(null);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  // Helper: get display name and avatar/icon
  const getUserDisplay = (msg) => {
    if (msg.text && msg.text.startsWith('[ADMIN]')) {
      return {
        name: 'Support Team',
        icon: <Shield className="w-6 h-6 text-orange-500" />, // admin icon
        isAdmin: true,
      };
    } else {
      return {
        name: msg.first_name || msg.username?.split('@')[0] || 'User',
        icon: <UserCircle className="w-6 h-6 text-blue-500" />, // user icon
        isAdmin: false,
      };
    }
  };
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  // No chatMode, only live support

  // Fetch all users who have sent messages (for admin/super_admin)
  // Always keep allUsers and selectedUser in sync for admin
  // Debug state for admin user selection
  // Fetch all users who have sent messages (for admin/super_admin)
  // Now fetch first_name from messages table for each user
  const fetchAllUsers = React.useCallback(async () => {
    const { data: msgData, error: msgError } = await supabase
      .from('messages')
      .select('username,first_name')
      .neq('username', null);
    let uniqueUsers = [];
    if (!msgError && msgData) {
      // Get unique users by email, but keep first_name
      const userMap = new Map();
      msgData.forEach(u => {
        if (!userMap.has(u.username)) {
          userMap.set(u.username, u.first_name || u.username);
        }
      });
      uniqueUsers = Array.from(userMap, ([email, first_name]) => ({ email, first_name }));
      setAllUsers(uniqueUsers);
      // If selectedUser is not in the list, pick the first
      if (!selectedUser || !uniqueUsers.some(u => u.email === selectedUser)) {
        setSelectedUser(uniqueUsers[0]?.email || null);
      }
  // Debug info removed
    } else {
      setAllUsers([]);
      setSelectedUser(null);
  // Debug info removed
    }
  }, [selectedUser]);

  // Fetch user role and all users (for admin)
  // Robust role detection
  useEffect(() => {
    if (!user) return;
    // Try all possible locations for role
    let role = null;
    if (user.role) role = user.role;
    else if (user.app_metadata && user.app_metadata.role) role = user.app_metadata.role;
    else if (user.user_metadata && user.user_metadata.role) role = user.user_metadata.role;
    setUserRole(role);
    if (role === 'admin' || role === 'super_admin') {
      fetchAllUsers();
    }
  }, [user, fetchAllUsers]);

  // Fetch messages for user or admin
  const fetchMessages = async () => {
    // Make all messages public: fetch all messages, show to everyone
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('timestamp', { ascending: true });
    if (!error) setMessages(data || []);
  };

  // Export messages as CSV
  const exportMessages = () => {
    // Export all messages in the chat
    const csv = [
      ['Time', 'Sender', 'Message'],
      ...messages.map(m => [
        new Date(m.timestamp).toLocaleString(),
        getUserDisplay(m).name,
        m.text && m.text.startsWith('[ADMIN]') ? m.text.replace('[ADMIN]', '').trim() : m.text
      ])
    ].map(row => row.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear messages for current user or selected user (admin)
  const clearMessages = async () => {
    // Clear all messages in the chat for everyone
    // Clear all messages in the chat for everyone
    // Clear only the chat panel for the current user (UI only)
    setMessages([]);
  };

  // Fetch messages when user, role, or selectedUser changes
  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userRole, selectedUser]);

  // Supabase Realtime subscription for messages
  useEffect(() => {
    if (!user) return;
    // Remove previous subscription
    if (realtimeSub) {
      supabase.removeChannel(realtimeSub);
      setRealtimeSub(null);
    }
    // Subscribe to all message changes
    const channel = supabase.channel('messages-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        // Only update if relevant to current user/admin
        if (userRole === 'admin' || userRole === 'super_admin') {
          // If admin, update if selectedUser matches
          if (payload.new && payload.new.username === selectedUser) fetchMessages();
          if (payload.old && payload.old.username === selectedUser) fetchMessages();
          // Also update user list if new user
          fetchAllUsers();
        } else {
          // If user, update if message is for them
          if ((payload.new && payload.new.username === user.email) ||
              (payload.old && payload.old.username === user.email)) {
            fetchMessages();
          }
        }
      })
      .subscribe();
    setRealtimeSub(channel);
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userRole, selectedUser]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    setLoading(true);
    // Get first_name from profiles for current user
    let firstName = user?.user_metadata?.first_name || user?.first_name || user?.email;
    // fallback: fetch from profiles table if not present
    if (!firstName && user?.email) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('email', user.email)
        .single();
      firstName = profileData?.first_name || user.email;
    }
    if (userRole === 'admin' || userRole === 'super_admin') {
      // Admin: reply to selected user, mark as admin, use email as username
      // Also fetch first_name for selectedUser
      let selectedFirstName = selectedUser;
      const selectedProfile = allUsers.find(u => u.email === selectedUser);
      if (selectedProfile) selectedFirstName = selectedProfile.first_name;
      await supabase.from('messages').insert({
        username: selectedUser, // selectedUser is email
        first_name: selectedFirstName,
        text: `[ADMIN] ${input}`,
        country: user?.country || '',
        is_authenticated: true,
        timestamp: new Date().toISOString(),
      });
      setInput('');
      setLoading(false);
      fetchMessages();
    } else {
      // User: send own message, use email as username
      await supabase.from('messages').insert({
        username: user.email,
        first_name: firstName,
        text: input,
        country: user.country || '',
        is_authenticated: true,
        timestamp: new Date().toISOString(),
      });
      setInput('');
      setLoading(false);
      fetchMessages();
    }
  };

  // Optionally, add export/clear for user only if you want

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // No escalation or AI rating, live support only

  // Fallback UI for admin if no users
  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-500 to-orange-400 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:scale-105 transition-transform"
          onClick={() => { setOpen(true); setMinimized(false); }}
          aria-label="Open Chat"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}
      {/* Minimized Chat Button */}
      {minimized && (
        <button
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-blue-500 to-orange-400 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:scale-105 transition-transform"
          onClick={() => { setMinimized(false); setOpen(true); }}
          aria-label="Restore chat"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}
      {/* User selector removed: all messages are public now */}
      {/* Chat Panel Drawer/Modal */}
      {open && !minimized && (
        <div className="fixed inset-0 z-50 flex items-end justify-end">
          <div className="bg-black/40 absolute inset-0" onClick={() => { setOpen(false); setMessages([]); }} />
          <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg h-[70vh] bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl flex flex-col overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-orange-400 text-white">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                <span className="font-bold text-lg">Live Support <span className="ml-2 px-2 py-1 text-xs rounded-full bg-white/20 text-white border border-white/30">Online</span></span>
                <span className="ml-2 w-2 h-2 rounded-full bg-green-400 animate-pulse" title="Online" />
              </div>
              <div className="flex gap-2">
                {/* Improved Refresh icon button */}
                <button
                  onClick={() => fetchMessages()}
                  className="p-2 rounded-full bg-gradient-to-br from-blue-400 to-orange-400 shadow hover:scale-110 transition-transform text-white border border-white/30"
                  title="Refresh Chat"
                  aria-label="Refresh Chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12a4 4 0 014-4V5l4 4-4 4V9a3 3 0 00-3 3z" />
                  </svg>
                </button>
                <button
                  onClick={() => setMinimized(true)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
                  title="Minimize"
                  aria-label="Minimize"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { setOpen(false); setMessages([]); }}
                  className="p-2 rounded-full hover:bg-red-500/70 transition-colors text-white"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {/* Body: Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50 dark:bg-gray-800">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  No messages yet.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  // Determine if this message is from the current user
                  const isCurrentUser = msg.username === user.email;
                  const { name, icon } = getUserDisplay(msg);
                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} items-end`}
                    >
                      {/* Left side: other users' messages */}
                      {!isCurrentUser && (
                        <div className="flex flex-col items-center mr-2">
                          {icon}
                          <span className="text-xs text-orange-600 font-semibold mt-1">{name}</span>
                        </div>
                      )}
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl shadow text-sm flex flex-col
                          ${isCurrentUser
                            ? 'bg-gradient-to-br from-blue-500 to-blue-400 text-white border border-blue-700'
                            : 'bg-gradient-to-br from-orange-100 to-blue-100 text-blue-900 dark:from-orange-900 dark:to-blue-900 dark:text-white border border-orange-200 dark:border-orange-800'}
                        `}
                      >
                        <span>{msg.text && msg.text.startsWith('[ADMIN]') ? msg.text.replace('[ADMIN]', '').trim() : msg.text}</span>
                        <div className={`text-xs mt-1 self-end ${isCurrentUser ? 'text-blue-200' : 'text-orange-400'}`}>{new Date(msg.timestamp).toLocaleString()}</div>
                      </div>
                      {/* Right side: current user's messages */}
                      {isCurrentUser && (
                        <div className="flex flex-col items-center ml-2">
                          {icon}
                          <span className="text-xs text-blue-600 font-semibold mt-1">{name}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Footer: Input + Export/Clear */}
            <form className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center gap-2" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
              {/* File/Image upload button */}
              <input
                type="file"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                className="hidden"
                id="chat-file-upload"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  // Upload to Supabase Storage (bucket: 'chat-files')
                  const filePath = `${user.email}/${Date.now()}_${file.name}`;
                  const { error } = await supabase.storage.from('chat-files').upload(filePath, file);
                  if (error) {
                    alert('File upload failed: ' + error.message);
                  } else {
                    // Get public URL
                    const { publicURL } = supabase.storage.from('chat-files').getPublicUrl(filePath);
                    // Send as a chat message
                    setInput(publicURL);
                    sendMessage();
                  }
                  e.target.value = '';
                }}
              />
              <label htmlFor="chat-file-upload" className="p-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-400 shadow hover:scale-110 transition-transform text-white cursor-pointer border border-white/30" title="Upload file/image">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
                </svg>
              </label>
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                placeholder={userRole === 'admin' || userRole === 'super_admin' ? 'Type your reply...' : 'Type your message...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading || (userRole === 'admin' && !selectedUser)}
                onKeyDown={e => e.key==='Enter' && sendMessage()}
              />
              <button
                type="submit"
                disabled={loading || !(typeof input === 'string' && input.trim()) || (userRole === 'admin' && !selectedUser)}
                className="bg-gradient-to-br from-blue-500 to-orange-400 text-white rounded-full p-2 shadow hover:scale-105 transition-transform"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
              {/* Export/Clear buttons for user and admin */}
              <button
                type="button"
                onClick={() => exportMessages()}
                className="ml-2 flex items-center gap-1 px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600 shadow text-xs sm:px-2 sm:py-1 sm:text-xs sm:ml-1"
                title="Export"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                type="button"
                onClick={() => clearMessages()}
                className="ml-2 flex items-center gap-1 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 shadow text-xs sm:px-2 sm:py-1 sm:text-xs sm:ml-1"
                title="Clear"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                <span className="hidden sm:inline">Clear</span>
              </button>


            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatPanel;
