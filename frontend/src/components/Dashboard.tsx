import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Logout as LogoutIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import {
  GET_DOCUMENTS_BY_USER_QUERY,
  CREATE_DOCUMENT_MUTATION,
  UPDATE_DOCUMENT_MUTATION,
  DELETE_DOCUMENT_MUTATION,
} from '../graphql/queries';
import FileUpload from './FileUpload';

interface Document {
  id: string;
  title: string;
  content: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const { data, loading, refetch } = useQuery(GET_DOCUMENTS_BY_USER_QUERY, {
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
    // Skip the query if no user is logged in
    skip: !user?.id,
  });

  // Refetch documents when user changes
  React.useEffect(() => {
    if (user?.id) {
      refetch();
    }
  }, [user?.id, refetch]);

  const [createDocument, { loading: creating }] = useMutation(CREATE_DOCUMENT_MUTATION, {
    onCompleted: () => {
      handleCloseDialog();
      refetch();
    },
    onError: (error) => setError(error.message),
  });

  const [updateDocument, { loading: updating }] = useMutation(UPDATE_DOCUMENT_MUTATION, {
    onCompleted: () => {
      handleCloseDialog();
      refetch();
    },
    onError: (error) => setError(error.message),
  });

  const [deleteDocument] = useMutation(DELETE_DOCUMENT_MUTATION, {
    onCompleted: () => refetch(),
    onError: (error) => setError(error.message),
  });

  const handleOpenDialog = (document?: Document) => {
    if (document) {
      setEditingDocument(document);
      setTitle(document.title);
      setContent(document.content);
    } else {
      setEditingDocument(null);
      setTitle('');
      setContent('');
    }
    setError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDocument(null);
    setTitle('');
    setContent('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      const isEditing = editingDocument && editingDocument.id;
      
      if (isEditing) {
        await updateDocument({
          variables: {
            input: { 
              id: editingDocument.id,
              title: title.trim(), 
              content: content.trim()
            },
          },
        });
      } else {
        await createDocument({
          variables: {
            input: { title: title.trim(), content: content.trim() },
          },
        });
      }
    } catch (err) {
      // Error handled by onError callback
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteDocument({ variables: { id } });
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/documents/download/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download file');
      }
    } catch (error) {
      setError('Failed to download file');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const documents = data?.documentsByUser || [];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            📚 Document Manager - Welcome {user?.email}
          </Typography>
          <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1">
            My Documents ({documents.length})
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => setOpenUploadDialog(true)}
              sx={{ mr: 2 }}
            >
              Upload File
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              New Document
            </Button>
          </Box>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box 
            display="grid" 
            gridTemplateColumns="repeat(auto-fill, minmax(350px, 1fr))" 
            gap={3}
          >
            {documents.map((document: Document) => (
              <Card elevation={2} key={document.id}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="h2" noWrap>
                        {document.title}
                      </Typography>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {document.content}
                    </Typography>

                    {document.fileName && (
                      <Box mb={1}>
                        <Chip
                          label={`📎 ${document.fileName}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                        {document.fileSize && (
                          <Chip
                            label={formatFileSize(document.fileSize)}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    )}

                    <Typography variant="caption" display="block" color="text.secondary">
                      Created: {new Date(document.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(document)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    
                    {document.fileName && (
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(document.id, document.fileName!)}
                        title="Download"
                      >
                        <DownloadIcon />
                      </IconButton>
                    )}
                    
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(document.id)}
                      title="Delete"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
            ))}
          </Box>
        )}

        {documents.length === 0 && !loading && (
          <Box textAlign="center" py={8}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No documents yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your first document or upload a file to get started
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              size="large"
            >
              Create Document
            </Button>
          </Box>
        )}
      </Container>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDocument ? 'Edit Document' : 'Create New Document'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={creating || updating}
          >
            {creating || updating ? <CircularProgress size={20} /> : (editingDocument ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={() => setOpenUploadDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload File</DialogTitle>
        <DialogContent>
          <FileUpload
            onUploadSuccess={() => {
              setOpenUploadDialog(false);
              refetch();
            }}
            onError={setError}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Dashboard; 