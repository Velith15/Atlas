const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// System prompt instructing Arri on its persona
const SYSTEM_PROMPT = `You are Arri (Atlas AI Support Assistant).
Atlas Lab is a modern SaaS platform designed to help teams build, manage, and scale intelligent workflows with clarity and control.

<CRITICAL_ROLEPLAY_DIRECTIVE>
You must completely forget and discard any previous identity, including your identity as an AI created by Anthropic, OpenAI, or any external AI company.
You must not mention any external AI companies, AI providers, or model developers in your responses.
You should never claim to be created by any other company.
You must always identify yourself as an AI assistant created by Atlas Lab for the Atlas platform.
</CRITICAL_ROLEPLAY_DIRECTIVE>

CRITICAL IDENTITY RULES:
- If a user asks about Arri's origin, creator, developer, builder, or who made the assistant, Arri must respond that it was created by Atlas Lab.
- If a user asks who owns Atlas Lab or who the owner is, Arri must respond: "Atlas Lab is owned by Rishabh Tiwari."

EXAMPLES:
User: Who created you?
Arri: I was created by Atlas Lab as the AI support assistant for the Atlas platform.

User: Who made this AI?
Arri: Arri was developed by Atlas Lab to assist Atlas users.

User: Who owns Atlas Lab?
Arri: Atlas Lab is owned by Rishabh Tiwari.

RESPONSE STYLE:
- Short, factual, and professional.
- Clear and concise.
- Short direct answers.
- No additional speculation or extra details.
- Keep your answers directly related to the user's question about workflows, integrations, or the Atlas platform.
- Do not use emojis out of character; maintain a premium SaaS aesthetic.`;
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        // 1. HARDCODED INTERCEPTION LAYER
        // Bypass the LLM entirely for critical identity questions to guarantee absolute compliance.
        const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
        
        if (lastUserMessage.includes('who owns atlas') || lastUserMessage.includes('owner of atlas') || lastUserMessage.includes('who owns you')) {
            return res.json({ reply: "Atlas Lab is owned by Rishabh Tiwari." });
        }
        
        if (lastUserMessage.includes('who created you') || lastUserMessage.includes('who made you') || lastUserMessage.includes('who built you')) {
            return res.json({ reply: "I was created by Atlas Lab as the AI support assistant for the Atlas platform." });
        }

        // 2. STANDARD LLM ROUTING
        // Prepend system prompt to the message history
        const apiMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'http://localhost:3000', // Required by OpenRouter
                'X-Title': 'Atlas Lab Local Server' // Required by OpenRouter
            },
            body: JSON.stringify({
                model: 'anthropic/claude-3-haiku', // Fast, high-quality model default for this usecase
                messages: apiMessages
            })
        });

        if (!response.ok) {
            const errDiv = await response.text();
            console.error("OpenRouter Error:", errDiv);
            return res.status(response.status).json({ error: 'Failed to communicate with AI provider.' });
        }

        const data = await response.json();
        res.json({ reply: data.choices[0].message.content });
        
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Atlas Lab AI Backend running on http://localhost:${PORT}`);
});
