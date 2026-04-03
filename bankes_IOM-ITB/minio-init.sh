#!/bin/sh
set -e

echo "Configuring MinIO..."

until mc alias set minio http://minio:9000 "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}"; do
  echo "Waiting for MinIO to be ready..."
  sleep 2
done

echo "MinIO is ready"

BUCKET_NAME="${MINIO_BUCKET_NAME:-new-bucket}"

if ! mc ls "minio/${BUCKET_NAME}" > /dev/null 2>&1; then
  echo "Creating bucket: ${BUCKET_NAME}"
  mc mb "minio/${BUCKET_NAME}"
else
  echo "Bucket ${BUCKET_NAME} already exists"
fi

echo "Setting anonymous download policy for bucket: ${BUCKET_NAME}"
mc anonymous set download "minio/${BUCKET_NAME}"

echo "MinIO configuration completed!"
