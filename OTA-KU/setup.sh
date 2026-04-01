#!/bin/bash

# Define environment variables
BE_ENV_FILE="backend/.env"
FE_ENV_FILE="frontend/.env"
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Check if .env file exists
if [ ! -f "$BE_ENV_FILE" ]; then
    echo "$BE_ENV_FILE not found! Please create it before running this script."
    exit 1
fi

if [ ! -f "$FE_ENV_FILE" ]; then
    echo "$FE_ENV_FILE not found! Please create it before running this script."
    exit 1
fi

# Choose mode
echo "Select mode:"
echo "1) Development (Run with npm)"
echo "2) Production (Run with Docker)"
read -p "Enter choice [1/2]: " mode

if [ "$mode" == "1" ]; then
    echo "Starting in DEVELOPMENT mode..."

    # Install dependencies
    echo "Installing Backend dependencies..."
    cd backend && npm install && cd ..

    echo "Installing Frontend dependencies..."
    cd frontend && npm install --force && cd ..

    echo "Development setup complete!"
elif [ "$mode" == "2" ]; then
    echo "Starting in PRODUCTION mode..."

    # Run Docker Compose
    export COMPOSE_PROJECT_NAME=prod
    sudo docker-compose -f "$DOCKER_COMPOSE_FILE" up --build -d

    echo "Production setup complete!"
else
    echo "Invalid choice! Exiting."
    exit 1
fi
