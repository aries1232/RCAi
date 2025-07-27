# Configuration Guide

## Environment Variables Setup

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/regulatory-chatbot

# AI Provider API Keys
MISTRAL_API_KEY=your_mistral_api_key_here
HF_API_KEY=your_huggingface_api_key_here
HF_EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Vector Database Configuration
CHROMADB_URL=http://localhost:8000

# Server Configuration
PORT=5000
NODE_ENV=development
```

## API Keys Setup

### 1. Mistral AI (for Chat)

1. Sign up at [Mistral Console](https://console.mistral.ai/)
2. Navigate to API Keys section
3. Create a new API key
4. Copy the key and add it to `MISTRAL_API_KEY`

### 2. Hugging Face (for Embeddings) - FREE!

**Option 1: No API Key Required (Recommended)**

- Many models work without an API key
- Just set `HF_EMBEDDINGS_MODEL=sentence-transformers/all-MiniLM-L6-v2` in your `.env`

**Option 2: With API Key (Higher Rate Limits)**

1. Sign up at [Hugging Face](https://huggingface.co/)
2. Navigate to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
3. Create a new API key
4. Copy the key and add it to `HF_API_KEY`

## Vector Database Setup

### Option 1: Docker (Recommended)

```bash
# Start ChromaDB
docker-compose up -d chromadb

# Check if it's running
docker ps
```

### Option 2: Local Installation

```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host 0.0.0.0 --port 8000
```

## Database Setup

### Option 1: Local MongoDB

```bash
# Start MongoDB with Docker
docker-compose up -d mongodb

# Or install MongoDB locally
# Follow MongoDB installation guide for your OS
```

### Option 2: MongoDB Atlas

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Replace `MONGODB_URI` with your Atlas connection string

## Verification

After setup, verify that all services are running:

1. **ChromaDB**: http://localhost:8000
2. **MongoDB**: Check with MongoDB Compass or CLI
3. **Backend**: http://localhost:5000/api/documents
4. **Frontend**: http://localhost:5173

## Troubleshooting

### ChromaDB Connection Issues

- Ensure ChromaDB is running on port 8000
- Check Docker logs: `docker-compose logs chromadb`
- Verify firewall settings

### API Key Issues

- Ensure API keys are valid and have sufficient credits
- Check API key permissions
- Verify environment variables are loaded correctly
- Hugging Face models work without API keys for basic usage

### MongoDB Connection Issues

- Check MongoDB connection string format
- Ensure MongoDB is running
- Verify network connectivity
