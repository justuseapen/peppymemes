# peppymemes

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/justuseapen/peppymemes)

## Environment Variables

The application requires the following environment variables:

Frontend (VITE) Environment Variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_PUBLIC_URL`: The public URL of your deployed application

Backend (Netlify Functions) Environment Variables:
- `OPENAI_API_KEY`: Your OpenAI API key (used by Netlify Functions)

### Deployment Notes

The application uses Netlify Functions to securely handle OpenAI API calls. The OpenAI API key is only used server-side and is never exposed to the client.
