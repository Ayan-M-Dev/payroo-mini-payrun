@echo off
setlocal enabledelayedexpansion

echo 🐘 Starting PostgreSQL container...
docker-compose up -d postgres

echo ⏳ Waiting for PostgreSQL to be ready...
:wait
docker-compose exec -T postgres pg_isready -U payrooAdmin >nul 2>&1
if errorlevel 1 (
  timeout /t 1 >nul
  goto wait
)

echo ✅ PostgreSQL is ready!

set DATABASE_URL=postgresql://payrooAdmin:payrooPassword123@localhost:5432/payroo

cd Backend

echo 📦 Installing dependencies...
call npm install

echo 🔄 Generating Prisma client...
call npx prisma generate

echo 📊 Running migrations...
call npx prisma migrate dev --name init_postgresql

echo 🌱 Seeding database...
call npm run seed

echo ✅ Setup complete!
echo.
echo Database URL: postgresql://payrooAdmin:payrooPassword123@localhost:5432/payroo
echo To stop PostgreSQL: docker-compose down


