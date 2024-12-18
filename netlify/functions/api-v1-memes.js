"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
    // Check for authorization header
    const authHeader = event.headers.authorization;
    if (!authHeader) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Unauthorized' })
        };
    }
    // Verify token and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
        return {
            statusCode: 401,
            body: JSON.stringify({ error: 'Invalid token' })
        };
    }
    try {
        const { title, imageData, contentType } = JSON.parse(event.body || '{}');
        // Validate required fields
        if (!title || !imageData || !contentType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }
        // Validate content type
        if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid file type' })
            };
        }
        // Generate unique filename
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
        const filePath = `memes/${filename}`;
        // Upload file to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('memes')
            .upload(filePath, Buffer.from(imageData, 'base64'), {
            contentType,
            upsert: false
        });
        if (uploadError) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to upload file' })
            };
        }
        // Create meme record in database
        const { data: meme, error: dbError } = await supabase
            .from('memes')
            .insert({
            title,
            file_path: filePath,
            user_id: user.id,
            content_type: contentType
        })
            .select()
            .single();
        if (dbError) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to create meme record' })
            };
        }
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: 'Meme uploaded successfully',
                meme
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
