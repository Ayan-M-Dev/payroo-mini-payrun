#!/bin/bash

# Script to run Prisma migrations on existing Docker PostgreSQL

set -e

export DATABASE_URL="postgresql://payrooAdmin:payrooPassword123@localhost:5432/payroo"

cd Backend

echo "📊 Running migrations..."
npx prisma migrate deploy

echo "✅ Migrations complete!"


