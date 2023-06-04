const express = require('express');
const { Configuration, OpenAIApi } =  require("openai");
require('dotenv').config();
const cors = require('cors')

const app = express();
app.use(express.json()); // Add this line to parse JSON request bodies
app.use(cors({origin:'http://3.16.138.217:3000'}));
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});


// Initialize OpenAI API key
const AI = new OpenAIApi(configuration);

// Define a default route
app.get('/', (req, res) => {
  res.send('Welcome to the GPT-3 Chatbot API!');
});

// Define a route that implements GPT-3
app.post('/api/chat', async (req, res) => {
  const prompt = req.body.prompt; // Extract the prompt from the request body
  console.log("Prompt:", prompt);

  const result = await AI.createCompletion({
    model: "text-davinci-003",
    prompt,
    max_tokens:2048,
    temperature: 0.3,
  });

  console.log("result: ", result.data.choices[0])
  const response = result.data.choices[0].text;
  res.send(response);
});

app.post('/api/chat1', async (req, resp) => {
  const prompt = req.body.prompt; // Extract the prompt from the request body
  console.log("Prompt:", prompt);
  try {
    const res = await AI.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens:2048,
        temperature: 0.3,
        stream: true,
    }, { responseType: 'stream' });
    console.log("key:", AI);

    res.data.on('data', data => {
        const lines = data.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
            const message = line.replace(/^data: /, '');
            if (message === '[DONE]') {
              resp.end();
                return; // Stream finished
            }
            try {
                const parsed = JSON.parse(message);
                
                resp.write(parsed.choices[0].text);
                console.log(parsed.choices[0].text);
            } catch(error) {
                console.error('Could not JSON parse stream message', message, error);
            }
        }
    });
  } catch (error) {
    if (error.response?.status) {
        console.error(error.response.status, error.message);
        error.response.data.on('data', data => {
            const message = data.toString();
            try {
                const parsed = JSON.parse(message);
                console.error('An error occurred during OpenAI request: ', parsed);
            } catch(error) {
                console.error('An error occurred during OpenAI request: ', message);
            }
        });
    } else {
        console.error('An error occurred during OpenAI request', error);
    }
  }
});




// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}...`));
