import React, { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const apiResponse = await fetch('http://localhost:5000/api/chat1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      const reader = apiResponse.body.getReader();

      if (reader) {
        let chunks = '';

        reader.read().then(function processText({ done, value }) {
          if (done) {
            setResponse(chunks);
            return;
          }

          const text = new TextDecoder('utf-8').decode(value);
          chunks += text;
          setResponse(chunks);

          return reader.read().then(processText);
        });
      }
    } catch (error) {
      console.error('An error occurred while sending the request:', error);
    }
  };

  return (
    <div>
      <h1>Chatbot UI</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="prompt">Enter a prompt:</label>
        <br/>
        <input
          type="text"
          id="prompt"
          value={prompt}
          onChange={handleInputChange}
        />
        <button type="submit">Submit</button>
      </form>
      <div className="response-container">
        <h2>Response:</h2>
        <pre className="chat-bubble">{response}</pre>
      </div>
    </div>
  );
}

export default App;
