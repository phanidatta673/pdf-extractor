const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PresignedPost {
  url: string;
  fields: Record<string, string>;
}

export interface ExtractionResult {
  filename?: string;
  page_count: number;
  pages: Array<{
    page_number: number;
    text: string;
    width: number;
    height: number;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Gets a pre-signed S3 POST URL and fields from the backend.
 */
export async function getUploadUrl(): Promise<PresignedPost> {
  const response = await fetch(`${API_BASE_URL}/upload-url`);
  if (!response.ok) {
    throw new Error('Failed to get upload URL');
  }
  return response.json();
}

/**
 * Uploads a file directly to S3 using pre-signed POST data.
 * Includes progress tracking.
 */
export function uploadToS3(
  presignedPost: PresignedPost,
  file: File,
  onProgress: (percent: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();

    // S3 requires fields to be added to FormData before the file
    Object.entries(presignedPost.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Return the S3 key (which is in presignedPost.fields.key)
        resolve(presignedPost.fields.key);
      } else {
        reject(new Error(`S3 upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('S3 upload network error')));
    xhr.addEventListener('abort', () => reject(new Error('S3 upload aborted')));

    xhr.open('POST', presignedPost.url);
    xhr.send(formData);
  });
}

/**
 * Tells the backend to extract text from a file already in S3.
 */
export async function extractText(s3Key: string): Promise<ExtractionResult> {
  const response = await fetch(`${API_BASE_URL}/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ s3_key: s3Key }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Extraction failed');
  }

  return response.json();
}
