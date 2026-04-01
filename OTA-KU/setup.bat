@echo off
setlocal enabledelayedexpansion

:: Define environment variables
set BE_ENV_FILE=backend\.env
set FE_ENV_FILE=frontend\.env
set DOCKER_COMPOSE_FILE=docker-compose.yml

:: Check if .env files exist
if not exist "%BE_ENV_FILE%" (
    echo %BE_ENV_FILE% not found! Please create it before running this script.
    exit /b 1
)

if not exist "%FE_ENV_FILE%" (
    echo %FE_ENV_FILE% not found! Please create it before running this script.
    exit /b 1
)

:: Ensure script is run from the project root
cd /d "%~dp0"

:: Choose mode
echo.
echo Select mode:
echo 1) Development (Run with npm)
echo 2) Production (Run with Docker)
set /p mode="Enter choice [1/2]: "

if "%mode%"=="1" (
    echo Starting in DEVELOPMENT mode...

    :: Install dependencies
    echo Installing Backend dependencies...
    pushd backend
    npm install
    popd

    echo Installing Frontend dependencies...
    pushd frontend
    npm install --force
    popd
    
    echo Development setup complete!
    exit /b 0
) else if "%mode%"=="2" (
    echo Starting in PRODUCTION mode...
    
    :: Run Docker Compose
    docker-compose -f "%DOCKER_COMPOSE_FILE%" up --build -d

    echo Production setup complete!
    exit /b 0
) else (
    echo Invalid choice! Exiting.
    exit /b 1
)
