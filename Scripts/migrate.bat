@echo off
setlocal enabledelayedexpansion

set DATABASE_URL=postgresql://payrooAdmin:payrooPassword123@localhost:5432/payroo

cd Backend

echo 📊 Running migrations...
call npx prisma migrate deploy

echo ✅ Migrations complete!


