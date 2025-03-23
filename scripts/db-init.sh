#!/bin/bash

echo "🚀 Running db-init.sh to create test DB: $POSTGRES_TEST_DB"

set -e

# Create the additional test database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE "$POSTGRES_TEST_DB";
EOSQL