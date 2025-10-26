import { useState } from 'react';
import { HelpCircle, Send, Loader2, Paperclip, MessageCircle } from 'lucide-react';

const SupportPage = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [faqOpen, setFaqOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'support', text: 'Hi! How can we help you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Simulate sending support message (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSuccess(true);
      setMessage('');
      setFile(null);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const faqs = [
    { q: 'How do I reset my password?', a: 'Go to your account settings and click "Reset Password".' },
    { q: 'How do I create an invoice?', a: 'Navigate to the Invoice page and click "Create New Invoice".' },
    { q: 'How do I contact support?', a: 'Use this form or email support@swiftfacture.com.' },
  ];

  const handleChatSend = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: chatInput }]);
    setTimeout(() => {
      setChatMessages((msgs) => [...msgs, { sender: 'support', text: 'Thank you for your message! Our team will reply soon.' }]);
    }, 1000);
    setChatInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 animate-fade-in">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center mb-8">
          <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-bounce" />
          <h1 className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">Support</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <textarea
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your issue or question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <div className="flex items-center space-x-2">
            <label className="flex items-center cursor-pointer">
              <Paperclip className="h-5 w-5 mr-1 text-gray-500" />
              <input type="file" className="hidden" onChange={handleFileChange} />
              <span className="text-sm text-gray-500">Attach file</span>
            </label>
            {file && <span className="text-xs text-blue-600">{file.name}</span>}
          </div>
          <button
            type="submit"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:bg-gray-400"
            disabled={loading || !message.trim()}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
            Send
          </button>
          {success && <div className="text-green-600">Message sent! Our team will get back to you soon.</div>}
          {error && <div className="text-red-600">{error}</div>}
        </form>
        <div className="mt-8 flex flex-col items-center space-y-4">
          <button
            className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            onClick={() => setFaqOpen(!faqOpen)}
          >
            {faqOpen ? 'Hide FAQ' : 'Show FAQ'}
          </button>
          {faqOpen && (
            <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">Frequently Asked Questions</h2>
              <ul className="space-y-2">
                {faqs.map((faq, idx) => (
                  <li key={idx}>
                    <div className="font-semibold text-gray-900 dark:text-white">Q: {faq.q}</div>
                    <div className="text-gray-600 dark:text-gray-400 ml-2">A: {faq.a}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            className="bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-lg text-blue-700 dark:text-blue-300 font-medium hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center"
            onClick={() => setChatOpen(!chatOpen)}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {chatOpen ? 'Close Live Chat' : 'Open Live Chat'}
          </button>
          {chatOpen && (
            <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow p-4 mt-2 animate-fade-in">
              <h2 className="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400">Live Chat</h2>
              <div className="h-40 overflow-y-auto mb-2 border border-gray-200 dark:border-gray-700 rounded p-2 bg-gray-50 dark:bg-gray-900">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <span className={`inline-block px-3 py-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>{msg.text}</span>
                  </div>
                ))}
              </div>
              <form onSubmit={handleChatSend} className="flex items-center space-x-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 dark:text-white"
                  placeholder="Type your message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Send
                </button>
              </form>
            </div>
          )}
          <div className="mt-4 text-gray-600 dark:text-gray-400 text-sm text-center">
            For urgent issues, contact us at <a href="mailto:support@swiftfacture.com" className="text-blue-600 dark:text-blue-400 underline">support@swiftfacture.com</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
