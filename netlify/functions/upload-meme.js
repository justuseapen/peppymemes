"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const buffer_1 = require("buffer");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
const handler = async (event) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    try {
        // Verify authentication
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }
        const token = authHeader.split(' ')[1];
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }
        // Parse the request body
        const body = JSON.parse(event.body || '{}');
        const { title, imageData, contentType } = body;
        if (!title || !imageData || !contentType) {
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
        // Convert base64 to buffer
        const buffer = buffer_1.Buffer.from(imageData, 'base64');
        const fileName = `${Date.now()}-${title.toLowerCase().replace(/\s+/g, '-')}`;
        const filePath = `memes/${fileName}`;
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('memes')
            .upload(filePath, buffer, {
            contentType,
            cacheControl: '3600'
        });
        if (uploadError) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to upload file' })
            };
        }
        // Create meme record in database
        const { data: memeData, error: memeError } = await supabase
            .from('memes')
            .insert([
            {
                title,
                file_path: filePath,
                user_id: user.id,
                content_type: contentType
            }
        ])
            .select()
            .single();
        if (memeError) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create meme record' })
            };
        }
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Meme uploaded successfully',
                meme: memeData
            })
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};
exports.handler = handler;
