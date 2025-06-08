import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DocumentManager = ({ selectedDocuments, onDocumentSelection, onStartChat }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/documents`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', file.name);
        formData.append('category', 'Regulation');

        await axios.post(`${API_URL}/documents/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }
    
    setUploading(false);
    fetchDocuments();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDocumentToggle = (document) => {
    const isSelected = selectedDocuments.some(doc => doc.id === document._id);
    let newSelection;
    
    if (isSelected) {
      newSelection = selectedDocuments.filter(doc => doc.id !== document._id);
    } else {
      newSelection = [...selectedDocuments, {
        id: document._id,
        title: document.title,
        category: document.category
      }];
    }
    
    onDocumentSelection(newSelection);
  };

  const handleStartChat = async () => {
    if (selectedDocuments.length === 0) {
      alert('Please select at least one document to start chatting.');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/chat/session`, {
        documentIds: selectedDocuments.map(doc => doc.id)
      });
      
      onStartChat(response.data);
    } catch (error) {
      console.error('Error creating chat session:', error);
      alert('Failed to start chat session. Please try again.');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await axios.delete(`${API_URL}/documents/${documentId}`);
      fetchDocuments();
      // Remove from selection if selected
      onDocumentSelection(selectedDocuments.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete document.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Regulatory Documents</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOCX, and TXT files up to 10MB
            </p>
          </div>
          
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Choose Files
          </label>
        </div>
        
        {uploading && (
          <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Uploading and processing documents...</span>
          </div>
        )}
      </div>

      {/* Document List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Document Library</h2>
            <div className="text-sm text-gray-500">
              {selectedDocuments.length} of {documents.length} selected
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading documents...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No documents uploaded yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload your first regulatory document to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {documents.map((document) => {
              const isSelected = selectedDocuments.some(doc => doc.id === document._id);
              
              return (
                <div
                  key={document._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleDocumentToggle(document)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <FileText className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {document.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{document.category}</span>
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>{new Date(document.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {isSelected && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                      <button
                        onClick={() => handleDeleteDocument(document._id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Start Chat Button */}
      {selectedDocuments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ready to Chat</h3>
              <p className="text-sm text-gray-500 mt-1">
                {selectedDocuments.length} document{selectedDocuments.length > 1 ? 's' : ''} selected for Q&A
              </p>
            </div>
            <button
              onClick={handleStartChat}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Start Chat Session
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;