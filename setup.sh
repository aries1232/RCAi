#!/bin/bash

echo "🚀 Setting up Regulatory Compliance Chatbot with Vector Embeddings"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

echo "🐳 Starting ChromaDB with Docker..."
docker-compose up -d chromadb

echo "⏳ Waiting for ChromaDB to be ready..."
sleep 10

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add your API keys to backend/.env:"
echo "   - MISTRAL_API_KEY (for chat)"
echo "   - OPENAI_API_KEY (for embeddings)"
echo "   - MONGODB_URI (for document storage)"
echo ""
echo "2. Start the application:"
echo "   npm run dev"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:5000"
echo "   - ChromaDB: http://localhost:8000"
echo ""
echo "🔧 To stop ChromaDB:"
echo "   docker-compose down" 