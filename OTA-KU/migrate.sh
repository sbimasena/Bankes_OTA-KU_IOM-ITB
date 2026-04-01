#!/bin/bash
set -e # Exit on error

echo "Starting database migration..."

# Step 1: Start the database container
echo "Starting the database container..."
sudo docker-compose up -d db

# Step 2: Wait for the database to be ready
echo "Waiting for the database to be ready..."
while ! sudo docker ps -q --filter "name=db" | grep -q .; do
    sleep 2
done

echo "Database is ready!"

# Step 3: Run Drizzle ORM migration
echo "Running Drizzle ORM migration..."
(cd backend && npm run drizzle-kit:migrate)

if [ $? -eq 0 ]; then
    echo "Database migration completed successfully!"
else
    echo "Migration failed! Please check the logs."
    exit 1
fi

# Step 4: Stop the database container
echo "Stopping the database container..."
sudo docker-compose down
