import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

const api = axios.create({
  baseURL: 'http://localhost:5000'
});



function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(msgs => [...msgs, { text: userMessage, sender: 'user' }]);
    setIsLoading(true);

    try {
      const location = await getCurrentLocation();
      const response = await api.post('/api/chat', {
        message: userMessage,
        location
      });

      setMessages(msgs => [...msgs, { 
        text: response.data.response, 
        sender: 'bot',
        locationImage: response.data.locationImage
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(msgs => [...msgs, { 
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="chat-container">
        <div className="chat-header">
          <div className="logo">🌤️</div>
          <h1>Chat with JD</h1>
          <p className="subtitle">Your Friendly Weather Assistant</p>
        </div>
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={"message " + message.sender}>
              <div className="message-content">
                {message.sender === 'bot' ? (
                  <>
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                    {message.locationImage && (
                      <div className="location-image-container">
                        <img 
                          src={message.locationImage} 
                          alt="Location" 
                          className="location-image"
                          onLoad={() => scrollToBottom()}
                        />
                        <div className="image-credit">Image from Pexels</div>
                      </div>
                    )}
                  </>
                ) : (
                  message.text
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-content loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the weather..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
