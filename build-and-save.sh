#!/bin/bash

set -e  # stop if anything fails

echo "Building images..."
docker-compose -f docker-compose.prod.yml build

echo "Saving frontend image..."
docker save stockbox---catalog-tree-navigation-frontend > frontend-image.tar

echo "Saving backend image..."
docker save stockbox---catalog-tree-navigation-backend > backend-image.tar

echo "Done!"