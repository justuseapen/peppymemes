import React from 'react';

export const DeveloperPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Developer Documentation</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
        <div className="bg-gray-100 p-6 rounded-lg mb-4">
          <p className="mb-4">All API requests require an API key to be included in the request headers:</p>
          <pre className="bg-gray-800 text-white p-4 rounded">
            {`x-api-key: your_api_key_here`}
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
      "view_count": number,
      "favorite_count": number,
      "share_count": number,
      "download_count": number
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
    "view_count": number,
    "favorite_count": number,
    "share_count": number,
    "download_count": number
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
      "view_count": number,
      "favorite_count": number,
      "share_count": number,
      "download_count": number
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
      "view_count": number,
      "favorite_count": number,
      "share_count": number,
      "download_count": number
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
            <li>400: Bad Request - Invalid parameters</li>
            <li>401: Unauthorized - Invalid or missing API key</li>
            <li>404: Not Found - Resource not found</li>
            <li>500: Internal Server Error - Server-side error</li>
          </ul>
        </div>
      </section>
    </div>
  );
};
