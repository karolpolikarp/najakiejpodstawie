#!/bin/bash

# Set environment variables
export SUPABASE_URL="https://topujvufxlywazazgujz.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvcHVqdnVmeGx5d2F6YXpndWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNjQ0NzcsImV4cCI6MjA1MTc0MDQ3N30.5xjvPBDCNqx6B6ufLXSQwbHVRhcRxgjKy8f7ufTuY5M"

echo "🔧 Environment configured:"
echo "  SUPABASE_URL: ${SUPABASE_URL}"
echo "  SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY:0:30}..."
echo ""
echo "🚀 Starting test suite..."
echo ""

# Run the actual test script
./run-all-tests.sh
