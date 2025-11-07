@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting AWS deployment...

echo 📦 Building backend...
cd Backend
call npm install
call npm run build
cd ..

echo 🏗️ Building frontend...
cd Frontend
call npm install
call npm run build
cd ..

echo ☁️ Deploying infrastructure...
cd infrastructure
call npm install
call npx cdk deploy --require-approval never

echo ✅ Deployment complete!
echo.
echo Next steps:
echo 1. Get the API URL and Frontend URL from the CDK output
echo 2. Update Frontend/.env.production with the API URL
echo 3. Rebuild and redeploy frontend
echo 4. Run database migrations on RDS

