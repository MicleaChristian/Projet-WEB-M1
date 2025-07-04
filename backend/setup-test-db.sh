#!/bin/bash

# Database configuration
DB_NAME="document_management_test"
DB_USER="postgres"
DB_PASSWORD="postgres"

echo "Setting up test database..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Error: PostgreSQL client (psql) is not installed"
    exit 1
fi

# Drop database if it exists
psql -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;" 2>/dev/null

# Create database
psql -U $DB_USER -c "CREATE DATABASE $DB_NAME;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "Database created successfully"
else
    echo "Error: Failed to create database. Make sure PostgreSQL is running and credentials are correct"
    exit 1
fi

# Set DATABASE_URL for Prisma
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?schema=public"

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "Test database setup completed successfully"
else
    echo "Error: Failed to run migrations"
    exit 1
fi 