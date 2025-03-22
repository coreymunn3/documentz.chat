# Technical Context: Documentz.chat

## Technologies Used

### Frontend Technologies

- **Next.js**: React framework for server-side rendering and client-side navigation
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for React
- **Lucide React**: Icon library
- **React PDF**: PDF viewer component
- **React Dropzone**: File upload component
- **React Markdown**: Markdown rendering component
- **Sonner**: Toast notification library

### Backend Technologies

- **Next.js API Routes**: Server-side API endpoints
- **Server Actions**: Server-side functions for secure operations
- **Firebase**: Cloud database and storage
- **Firebase Admin SDK**: Server-side Firebase operations
- **Pinecone**: Vector database for embeddings
- **LangChain**: Framework for AI operations
- **OpenAI API**: AI model provider

### Authentication & Payment

- **Clerk**: Authentication and user management
- **Stripe**: Payment processing and subscription management

### Development Tools

- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Tailwind Config**: Tailwind CSS configuration

## Development Setup

### Environment Variables

The application uses two environment files:

- `.env.development`: For local development
- `.env.production`: For production deployment

Key environment variables include:

- Clerk API keys for authentication
- Firebase configuration
- Pinecone API keys and index names
- OpenAI API keys
- Stripe API keys and webhook secrets

### Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The development server runs on port 3030 by default.

### Firebase Configuration

The application uses two Firebase projects:

- Development: `documentz-chat`
- Production: `documentz-chat-prod`

Each project has its own service account key for server-side operations.

### Pinecone Configuration

The application uses two Pinecone indexes:

- Development: `documentz-chat-dev`
- Production: `documentz-chat-prod`

### Stripe Configuration

The application uses Stripe for payment processing with:

- Test mode for development
- Live mode for production
- Webhook endpoints for payment events
- Customer portal for subscription management

## Technical Constraints

### PDF Processing Limitations

- Maximum file size: Determined by Firebase Storage limits
- Text extraction: Limited by PDF structure and quality
- Processing time: Increases with document size

### AI Model Constraints

- Token limits: GPT-4o-mini has context window limitations
- Response time: Varies based on query complexity and document size
- Cost considerations: API usage costs scale with usage

### Vector Database Constraints

- Embedding dimensions: Fixed by OpenAI embedding model
- Query performance: Affected by index size and complexity
- Storage limits: Based on Pinecone tier

### Subscription Tier Limitations

- Free tier: 2 documents, 3 messages per document
- Pro tier: 20 documents, 100 messages per document

## Dependencies

### Core Dependencies

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.9.4",
    "@langchain/community": "^0.3.19",
    "@langchain/core": "^0.3.26",
    "@langchain/openai": "^0.3.16",
    "@langchain/pinecone": "^0.1.3",
    "@pinecone-database/pinecone": "^4.0.0",
    "@radix-ui/react-accordion": "^1.2.2",
    "@radix-ui/react-alert-dialog": "^1.1.5",
    "@radix-ui/react-progress": "^1.1.1",
    "@radix-ui/react-slot": "^1.1.1",
    "@radix-ui/react-tooltip": "^1.1.6",
    "@react-pdf/renderer": "^4.1.5",
    "@stripe/stripe-js": "^5.5.0",
    "byte-size": "^9.0.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "firebase": "^11.1.0",
    "firebase-admin": "^12.0.0",
    "framer-motion": "^11.15.0",
    "langchain": "^0.3.7",
    "lodash": "^4.17.21",
    "lucide-react": "^0.468.0",
    "luxon": "^3.5.0",
    "next": "^14.2.20",
    "next-themes": "^0.4.4",
    "pdf-parse": "^1.1.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-dropzone": "^14.3.5",
    "react-firebase-hooks": "^5.1.1",
    "react-markdown": "^9.0.3",
    "react-pdf": "^9.2.1",
    "sonner": "^1.7.1",
    "stripe": "^17.5.0",
    "tailwind-merge": "^2.5.5",
    "tailwindcss-animate": "^1.0.7",
    "uuid": "^11.0.3"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@types/byte-size": "^8.1.2",
    "@types/lodash": "^4.17.14",
    "@types/luxon": "^3.4.2",
    "@types/node": "^20",
    "@types/react": "^19.0.9",
    "@types/react-dom": "^19.0.3",
    "daisyui": "^4.12.23",
    "eslint": "^9",
    "eslint-config-next": "15.1.1",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

## Integration Points

### Clerk Integration

- Authentication flow
- User profile management
- Session handling

### Firebase Integration

- Document storage
- Chat history storage
- User data storage
- Real-time updates

### Pinecone Integration

- Vector embedding storage
- Semantic search
- Document retrieval

### OpenAI Integration

- Text embedding generation
- Question answering
- Context-aware responses

### Stripe Integration

- Payment processing
- Subscription management
- Webhook handling
- Customer portal

## Deployment Architecture

The application is deployed on Vercel with:

- Production environment: www.documentz.chat
- Preview environments for pull requests
- Environment variable management
- Edge caching and CDN distribution
- Serverless functions for API routes
- Automatic scaling based on traffic
