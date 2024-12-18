import React from 'react';

export const DeveloperPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Developer Documentation</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
        <div className="bg-gray-100 p-6 rounded-lg mb-4">
          <p className="mb-4">The API supports two authentication methods:</p>

          <h4 className="font-semibold mb-2">1. API Key Authentication</h4>
          <p className="mb-2">For public API access, include your API key in the request headers:</p>
          <pre className="bg-gray-800 text-white p-4 rounded mb-4">
            {`X-API-Key: your_api_key_here`}
          </pre>

          <h4 className="font-semibold mb-2">2. JWT Token Authentication</h4>
          <p className="mb-2">For user-specific operations, include a Bearer token in the Authorization header:</p>
          <pre className="bg-gray-800 text-white p-4 rounded">
            {`Authorization: Bearer your_jwt_token_here`}
          </pre>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Rate Limiting</h2>
        <div className="bg-gray-100 p-6 rounded-lg mb-4">
          <h4 className="font-semibold mb-2">Pricing Tiers</h4>
          <ul className="list-disc list-inside mb-4">
            <li>Free Tier: 100 requests per day</li>
            <li>Developer Tier ($29/month): 10,000 requests per day</li>
          </ul>
          <p className="mb-2">Rate limit information is included in response headers:</p>
          <pre className="bg-gray-800 text-white p-4 rounded">
            {`X-RateLimit-Limit: 100|10000
X-RateLimit-Remaining: number
X-RateLimit-Reset: timestamp`}
          </pre>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">API Endpoints</h2>

        {/* Memes Endpoints */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Memes</h3>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">List Memes</h4>
            <p className="text-gray-600 mb-2">GET /api/v1/memes</p>
            <p className="mb-2">Retrieve a paginated list of memes with optional sorting.</p>
            <h5 className="font-semibold mt-4 mb-2">Query Parameters:</h5>
            <ul className="list-disc list-inside mb-4">
              <li>page (optional): Page number (default: 1)</li>
              <li>per_page (optional): Items per page (default: 20)</li>
              <li>sort_by (optional): Sorting option (newest, oldest, most_viewed, most_favorited)</li>
            </ul>
            <h5 className="font-semibold mb-2">Response:</h5>
            <pre className="bg-gray-800 text-white p-4 rounded">
              {`{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "tags": ["string"],
      "image_url": "string",
      "created_at": "timestamp",
      "user_id": "string",
      "view_count": number,
      "favorite_count": number,
      "share_count": number,
      "download_count": number,
      "is_favorited": boolean
    }
  ],
  "metadata": {
    "page": number,
    "per_page": number,
    "total": number
  }
}`}
            </pre>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Create Meme</h4>
            <p className="text-gray-600 mb-2">POST /api/v1/memes</p>
            <p className="mb-2">Create a new meme. Requires JWT authentication.</p>
            <h5 className="font-semibold mt-4 mb-2">Request Body:</h5>
            <pre className="bg-gray-800 text-white p-4 rounded mb-4">
              {`{
  "title": "string",
  "imageData": "base64 string",
  "contentType": "image/jpeg|image/png|image/gif",
  "tags": ["string"]
}`}
            </pre>
            <p className="text-sm text-gray-600 mb-4">Note: Maximum file size is 10MB. Supported formats: JPEG, PNG, GIF</p>
            <h5 className="font-semibold mb-2">Response:</h5>
            <pre className="bg-gray-800 text-white p-4 rounded">
              {`{
  "data": {
    "id": "uuid",
    "title": "string",
    "tags": ["string"],
    "image_url": "string",
    "created_at": "timestamp",
    "user_id": "string"
  }
}`}
            </pre>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Get Meme by ID</h4>
            <p className="text-gray-600 mb-2">GET /api/v1/memes/:id</p>
            <p className="mb-2">Retrieve a specific meme by its ID.</p>
            <h5 className="font-semibold mb-2">Response:</h5>
            <pre className="bg-gray-800 text-white p-4 rounded">
              {`{
  "data": {
    "id": "uuid",
    "title": "string",
    "tags": ["string"],
    "image_url": "string",
    "created_at": "timestamp",
    "user_id": "string",
    "view_count": number,
    "favorite_count": number,
    "share_count": number,
    "download_count": number,
    "is_favorited": boolean
  }
}`}
            </pre>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Search Memes</h4>
            <p className="text-gray-600 mb-2">GET /api/v1/memes/search</p>
            <p className="mb-2">Search memes by title and tags.</p>
            <h5 className="font-semibold mt-4 mb-2">Query Parameters:</h5>
            <ul className="list-disc list-inside mb-4">
              <li>query (optional): Search term for meme titles</li>
              <li>tags (optional): Comma-separated list of tags</li>
              <li>page (optional): Page number (default: 1)</li>
              <li>per_page (optional): Items per page (default: 20)</li>
            </ul>
            <h5 className="font-semibold mb-2">Response:</h5>
            <pre className="bg-gray-800 text-white p-4 rounded">
              {`{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "tags": ["string"],
      "image_url": "string",
      "created_at": "timestamp",
      "user_id": "string",
      "view_count": number,
      "favorite_count": number,
      "share_count": number,
      "download_count": number,
      "is_favorited": boolean
    }
  ],
  "metadata": {
    "page": number,
    "per_page": number,
    "total": number,
    "query": string | null,
    "tags": string[] | null
  }
}`}
            </pre>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Favorite/Unfavorite Meme</h4>
            <p className="mb-2">Manage meme favorites. Requires JWT authentication.</p>

            <div className="mb-4">
              <p className="text-gray-600">POST /api/v1/memes/:id/favorite</p>
              <p className="mb-2">Add meme to favorites</p>
            </div>

            <div>
              <p className="text-gray-600">DELETE /api/v1/memes/:id/favorite</p>
              <p className="mb-2">Remove meme from favorites</p>
            </div>

            <h5 className="font-semibold mb-2">Response:</h5>
            <pre className="bg-gray-800 text-white p-4 rounded">
              {`{
  "data": {
    "id": "uuid",
    "user_id": "string",
    "meme_id": "string",
    "created_at": "timestamp"
  }
}`}
            </pre>
          </div>
        </div>

        {/* Tags Endpoints */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Tags</h3>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">List Tags</h4>
            <p className="text-gray-600 mb-2">GET /api/v1/tags</p>
            <p className="mb-2">Retrieve a list of all tags with their meme counts.</p>
            <h5 className="font-semibold mb-2">Response:</h5>
            <pre className="bg-gray-800 text-white p-4 rounded">
              {`{
  "data": [
    {
      "name": "string",
      "meme_count": number
    }
  ],
  "metadata": {
    "total": number
  }
}`}
            </pre>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-6">
            <h4 className="font-semibold mb-2">Get Memes by Tag</h4>
            <p className="text-gray-600 mb-2">GET /api/v1/tags/:tag/memes</p>
            <p className="mb-2">Retrieve a paginated list of memes with a specific tag.</p>
            <h5 className="font-semibold mt-4 mb-2">Query Parameters:</h5>
            <ul className="list-disc list-inside mb-4">
              <li>page (optional): Page number (default: 1)</li>
              <li>per_page (optional): Items per page (default: 20)</li>
            </ul>
            <h5 className="font-semibold mb-2">Response:</h5>
            <pre className="bg-gray-800 text-white p-4 rounded">
              {`{
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "tags": ["string"],
      "image_url": "string",
      "created_at": "timestamp",
      "user_id": "string",
      "view_count": number,
      "favorite_count": number,
      "share_count": number,
      "download_count": number,
      "is_favorited": boolean
    }
  ],
  "metadata": {
    "page": number,
    "per_page": number,
    "total": number,
    "tag": string
  }
}`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Error Handling</h2>
        <div className="bg-gray-100 p-6 rounded-lg">
          <p className="mb-4">All endpoints return error responses in the following format:</p>
          <pre className="bg-gray-800 text-white p-4 rounded">
            {`{
  "error": "Error message"
}`}
          </pre>
          <h5 className="font-semibold mt-4 mb-2">Common Error Status Codes:</h5>
          <ul className="list-disc list-inside">
            <li>400: Bad Request - Invalid parameters or file type</li>
            <li>401: Unauthorized - Invalid or missing authentication</li>
            <li>403: Forbidden - Rate limit exceeded</li>
            <li>404: Not Found - Resource not found</li>
            <li>413: Payload Too Large - File size exceeds limit</li>
            <li>500: Internal Server Error - Server-side error</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
