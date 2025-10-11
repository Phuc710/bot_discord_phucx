const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

async function testGeminiAPI() {
    console.log('🧪 Testing Gemini API for Boo Bot...');
    console.log('API Key:', GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
    
    if (!GEMINI_API_KEY) {
        console.log('❌ GEMINI_API_KEY not found in environment variables');
        console.log('💡 Make sure your .env file contains: GEMINI_API_KEY=your_api_key_here');
        return;
    }
    
    try {
        console.log('📡 Sending request to Gemini API...');
        
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    role: "user",
                    parts: [{ text: "Hello! Can you introduce yourself as Boo and respond with a simple greeting?" }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 200,
                }
            },
            {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('📊 Response Status:', response.status);
        
        if (response.data && 
            response.data.candidates && 
            response.data.candidates[0] && 
            response.data.candidates[0].content &&
            response.data.candidates[0].content.parts) {
            
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            console.log('✅ Gemini API Response:');
            console.log('🤖 Boo:', aiResponse);
            console.log('🎉 AI Chat functionality is working perfectly!');
            
            // Test conversation history
            console.log('\n🔄 Testing conversation history...');
            await testConversationHistory();
            
        } else {
            console.log('❌ Unexpected response format:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error testing Gemini API:');
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Error:', JSON.stringify(error.response.data, null, 2));
            
            if (error.response.status === 400) {
                console.log('💡 This might be an API key issue or quota exceeded');
            } else if (error.response.status === 403) {
                console.log('💡 API key might be invalid or restricted');
                console.log('💡 Check if your API key has proper permissions');
            } else if (error.response.status === 429) {
                console.log('💡 Rate limit exceeded, try again later');
            }
        } else {
            console.log('Error:', error.message);
        }
    }
}

async function testConversationHistory() {
    try {
        const conversationTest = [
            {
                role: "user",
                parts: [{ text: "You are Boo, a helpful Discord bot assistant. Keep your responses concise and friendly. Don't use markdown formatting. Always introduce yourself as Boo when appropriate." }]
            },
            {
                role: "model", 
                parts: [{ text: "I'll act as Boo, a helpful Discord assistant. I'll keep my responses concise and friendly, and I won't use markdown formatting. I'll introduce myself as Boo when appropriate." }]
            },
            {
                role: "user",
                parts: [{ text: "What's your name?" }]
            }
        ];
        
        const response = await axios.post(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                contents: conversationTest,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 100,
                }
            }
        );
        
        if (response.data && 
            response.data.candidates && 
            response.data.candidates[0] && 
            response.data.candidates[0].content &&
            response.data.candidates[0].content.parts) {
            
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            console.log('✅ Conversation Test Response:');
            console.log('🤖 Boo:', aiResponse);
            console.log('🎉 Conversation history is working!');
        }
        
    } catch (error) {
        console.log('❌ Conversation test failed:', error.message);
    }
}

// Run the test
testGeminiAPI();
