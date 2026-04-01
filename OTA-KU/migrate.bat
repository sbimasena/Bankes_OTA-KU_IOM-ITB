@echo off
echo Starting database migration...

:: Step 1: Start the database container
echo Starting the database container...
docker-compose up -d db

:: Step 2: Wait for the database to be ready
echo Waiting for the database to be ready...
:waitloop
for /f %%i in ('docker ps -q --filter "name=db"') do set DB_CONTAINER_ID=%%i
if "%DB_CONTAINER_ID%"=="" (
    timeout /t 2 /nobreak >nul
    goto waitloop
)

echo Database is ready!

:: Step 3: Run Drizzle ORM migration
echo Running Drizzle ORM migration...
pushd backend
npm run drizzle-kit:migrate:local
popd

if %errorlevel%==0 (
    echo Database migration completed successfully!
) else (
    echo Migration failed! Please check the logs.
)

:: Step 4: Stop the database container
echo Stopping the database container...
docker-compose down db
