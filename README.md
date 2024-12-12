# peppymemes

[Edit in StackBlitz next generation editor ⚡️](https://stackblitz.com/~/github.com/justuseapen/peppymemes)

## Environment Variables

The application requires the following environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_OPENAI_API_KEY`: Your OpenAI API key (Note: This is temporarily exposed in the client-side bundle. Future updates will move OpenAI API calls to a backend service)
- `VITE_PUBLIC_URL`: The public URL of your deployed application

### Deployment Notes

Currently, the OpenAI API key is included in the client-side bundle. This is a temporary solution and should be replaced with a backend service in production. The `netlify.toml` configuration includes settings to prevent the build from failing due to exposed secrets, but this is not a long-term security solution.
