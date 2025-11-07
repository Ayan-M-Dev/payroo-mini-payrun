#!/bin/bash

# Script to run Prisma migrations using Docker PostgreSQL

set -e

echo "🐘 Starting PostgreSQL container..."
docker-compose up -d postgres

echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U payrooAdmin > /dev/null 2>&1; do
  sleep 1
done

echo "✅ PostgreSQL is ready!"

export DATABASE_URL="postgresql://payrooAdmin:payrooPassword123@localhost:5432/payroo"

cd Backend

echo "📦 Installing dependencies..."
npm install

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "📊 Running migrations..."
npx prisma migrate dev --name init_postgresql

echo "🌱 Seeding database..."
npm run seed

echo "✅ Setup complete!"
echo ""
echo "Database URL: postgresql://payrooAdmin:payrooPassword123@localhost:5432/payroo"
echo "To stop PostgreSQL: docker-compose down"


