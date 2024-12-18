"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const buffer_1 = require("buffer");
const node_fetch_1 = __importDefault(require("node-fetch"));
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// For demo purposes - in production this would be in a database
const API_KEYS = {
    'd9f8db4881c44aa9a6ab5a5cfd51d1e2': {
        tier: 'developer',
        requestsPerDay: 10000
    }
};
const handler = async (event) => {
    console.log('Received request:', {
        method: event.httpMethod,
        headers: event.headers,
        body: event.body
    });
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    try {
        // Verify API key
        const apiKey = event.headers['x-api-key'];
        if (!apiKey || !API_KEYS[apiKey]) {
            console.log('Invalid API key:', apiKey);
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid API key' })
            };
        }
        // Parse the request body
        const body = JSON.parse(event.body || '{}');
        const { title, imageData, imageUrl, contentType, tags } = body;
        console.log('Parsed request body:', { title, imageUrl, contentType, tags });
        if (!title || (!imageData && !imageUrl) || !contentType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }
        // Validate content type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(contentType)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid file type' })
            };
        }
        let buffer;
        if (imageUrl) {
            console.log('Fetching image from URL:', imageUrl);
            // Fetch image from URL
            const response = await (0, node_fetch_1.default)(imageUrl);
            if (!response.ok) {
                console.error('Failed to fetch image:', response.statusText);
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Failed to fetch image from URL' })
                };
            }
            buffer = buffer_1.Buffer.from(await response.arrayBuffer());
            console.log('Successfully fetched image, size:', buffer.length);
        }
        else {
            // Convert base64 to buffer
            buffer = buffer_1.Buffer.from(imageData, 'base64');
        }
        const fileName = `${Date.now()}-${title.toLowerCase().replace(/\s+/g, '-')}`;
        const filePath = `memes/${fileName}`;
        console.log('Uploading to Supabase storage:', filePath);
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('memes')
            .upload(filePath, buffer, {
            contentType,
            cacheControl: '3600'
        });
        if (uploadError) {
            console.error('Upload error:', uploadError);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to upload file' })
            };
        }
        console.log('Successfully uploaded to storage:', uploadData);
        // Create meme record in database
        const { data: memeData, error: memeError } = await supabase
            .from('memes')
            .insert([
            {
                title,
                image_url: filePath,
                tags: tags || []
            }
        ])
            .select()
            .single();
        if (memeError) {
            console.error('Database error:', memeError);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create meme record' })
            };
        }
        console.log('Successfully created meme record:', memeData);
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Meme uploaded successfully',
                meme: memeData
            })
        };
    }
    catch (error) {
        console.error('Unexpected error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.handler = handler;
