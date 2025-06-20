import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface FileUploadProps {
  onUploadSuccess: () => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess, onError }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    if (!title) {
      setTitle(file.name);
    }
    if (!content) {
      setContent(`Uploaded file: ${file.name}`);
    }
  }, [title, content]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      onError('Please select a file');
      return;
    }

    if (!title.trim()) {
      onError('Please enter a title');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('content', content);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        onUploadSuccess();
        setSelectedFile(null);
        setTitle('');
        setContent('');
      } else {
        const errorData = await response.json();
        onError(errorData.message || 'Upload failed');
      }
    } catch (error) {
      onError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Drag and Drop Area */}
      <Paper
        elevation={1}
        sx={{
          p: 4,
          textAlign: 'center',
          border: dragOver ? '2px dashed #1976d2' : '2px dashed #ccc',
          backgroundColor: dragOver ? '#f5f5f5' : 'transparent',
          cursor: 'pointer',
          mb: 2,
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {selectedFile ? selectedFile.name : 'Drop files here or click to browse'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedFile
            ? `${formatFileSize(selectedFile.size)} - ${selectedFile.type}`
            : 'Supported: Images, PDFs, Documents (Max 10MB)'}
        </Typography>
        <input
          id="file-input"
          type="file"
          hidden
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.md"
          onChange={handleFileInputChange}
        />
      </Paper>

      {selectedFile && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            File selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
          </Alert>

          <TextField
            fullWidth
            label="Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            fullWidth
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload; 