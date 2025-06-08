import React, { useState, useEffect } from 'react';
import { FileText, MessageCircle, Upload, Settings, Bot, Zap } from 'lucide-react';
import DocumentManager from './components/DocumentManager';
import ChatInterface from './components/ChatInterface';

function App() {
  const [activeTab, setActiveTab] = useState('documents');
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [chatSession, setChatSession] = useState(null);
  const [aiProvider, setAiProvider] = useState('mistral');

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    
  ];

  const handleDocumentSelection = (documents) => {
    setSelectedDocuments(documents);
  };

  const handleStartChat = (sessionData) => {
    setChatSession(sessionData);
    setActiveTab('chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Regulatory AI Assistant</h1>
                <p className="text-sm text-gray-500">Intelligent document Q&A system</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <Zap className="w-4 h-4" />
                <span>{aiProvider === 'mistral' ? 'Mistral AI' : 'OpenAI'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'documents' && (
          <DocumentManager
            selectedDocuments={selectedDocuments}
            onDocumentSelection={handleDocumentSelection}
            onStartChat={handleStartChat}
          />
        )}
        
        {activeTab === 'chat' && (
          <ChatInterface
            chatSession={chatSession}
            selectedDocuments={selectedDocuments}
            onBackToDocuments={() => setActiveTab('documents')}
          />
        )}
        
      </main>
    </div>
  );
}

export default App;