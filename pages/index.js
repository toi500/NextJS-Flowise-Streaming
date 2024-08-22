import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { cloneDeep } from 'lodash';

let socket;
const FLOWISE_URL = 'http://localhost:3000';
const CHATFLOW_ID = 'fe1145fa-1b2b-45b7-b2ba-bcc5aaeb5ffd';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
        message: 'Hi there! How can I help?',
        type: 'apiMessage'
    }
  ]);
  const [socketIOClientId, setSocketIOClientId] = useState('')

  useEffect(() => {
    socketInitializer();
  }, []);

  const socketInitializer = async () => {
    socket = io(FLOWISE_URL);

    socket.on('connect', () => {
      console.log('connected');
      setSocketIOClientId(socket.id)
    });

    // set empty new message
    socket.on('start', () => {
        setMessages((prevMessages) => [...prevMessages, { message: '', type: 'apiMessage' }])
    })

    socket.on('token', (text) => {
        setMessages((prevMessages) => {
            let allMessages = [...cloneDeep(prevMessages)]
            if (allMessages.length) {
                if (allMessages[allMessages.length - 1].type === 'userMessage') return allMessages
                allMessages[allMessages.length - 1].message += text
                return allMessages
            } else {
                return [{type: 'apimessage', message: text}]
            }
        })
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input) {
        // Set user message
        setMessages((prevMessages) => [...prevMessages, { message: input, type: 'userMessage' }])

        await fetch(`${FLOWISE_URL}/api/v1/prediction/${CHATFLOW_ID}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              question: 'hello',
              socketIOClientId: socketIOClientId
            }),
        });
        
        setInput('');
    }
  };

  return (
    <div>
      <h1>Flowise Socket.IO Chat</h1>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg.message}</li>
        ))}
      </ul>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}