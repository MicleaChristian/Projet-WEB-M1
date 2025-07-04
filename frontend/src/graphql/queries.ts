import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      access_token
      user {
        id
        email
        role
        firstName
        lastName
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    register(registerInput: { email: $email, password: $password, firstName: $firstName, lastName: $lastName }) {
      access_token
      user {
        id
        email
        role
        firstName
        lastName
      }
    }
  }
`;

export const GET_DOCUMENTS_QUERY = gql`
  query GetDocuments {
    documents {
      id
      title
      content
      fileName
      fileSize
      mimeType
      createdAt
      updatedAt
    }
  }
`;

export const GET_DOCUMENTS_BY_USER_QUERY = gql`
  query GetDocumentsByUser {
    documentsByUser {
      id
      title
      content
      fileName
      fileSize
      mimeType
      createdAt
      updatedAt
    }
  }
`;

export const GET_DOCUMENT_QUERY = gql`
  query GetDocument($id: ID!) {
    document(id: $id) {
      id
      title
      content
      fileName
      fileSize
      mimeType
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_DOCUMENT_MUTATION = gql`
  mutation CreateDocument($input: CreateDocumentInput!) {
    createDocument(createDocumentInput: $input) {
      id
      title
      content
      fileName
      fileSize
      mimeType
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_DOCUMENT_MUTATION = gql`
  mutation UpdateDocument($input: UpdateDocumentInput!) {
    updateDocument(updateDocumentInput: $input) {
      id
      title
      content
      fileName
      fileSize
      mimeType
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_DOCUMENT_MUTATION = gql`
  mutation DeleteDocument($id: ID!) {
    removeDocument(id: $id) {
      id
      title
    }
  }
`; 