'use client';

import React, { useState, useCallback } from 'react';
import { getUploadUrl, uploadToS3, extractText, ExtractionResult } from '../lib/api';

interface FileUploadState {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'extracting' | 'completed' | 'error';
  error?: string;
  result?: ExtractionResult;
}

interface UploadZoneProps {
  onComplete?: (results: ExtractionResult[]) => void;
}

export default function UploadZone({ onComplete }: UploadZoneProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processUpload = useCallback(async (uploadId: string, file: File) => {
    setUploads(prev => prev.map(u => 
      u.id === uploadId ? { ...u, status: 'uploading' as const } : u
    ));

    try {
      // 1. Get pre-signed URL
      const presignedPost = await getUploadUrl();

      // 2. Upload to S3
      const s3Key = await uploadToS3(presignedPost, file, (progress) => {
        setUploads(prev => prev.map(u => 
          u.id === uploadId ? { ...u, progress } : u
        ));
      });

      // 3. Extract text
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: 'extracting' as const, progress: 100 } : u
      ));

      const result = await extractText(s3Key);

      setUploads(prev => {
        const resultWithFilename = { ...result, filename: file.name };
        const updated = prev.map(u => 
          u.id === uploadId ? { ...u, status: 'completed' as const, result: resultWithFilename } : u
        );
        
        // Notify parent if all uploads are completed
        const allCompleted = updated.every(u => u.status === 'completed' || u.status === 'error');
        if (allCompleted && onComplete) {
          onComplete(updated.map(u => u.result!).filter(Boolean));
        }
        
        return updated;
      });

    } catch (error: any) {
      console.error(`Error uploading ${file.name}:`, error);
      setUploads(prev => prev.map(u => 
        u.id === uploadId ? { ...u, status: 'error' as const, error: error.message } : u
      ));
    }
  }, [onComplete]);

  const onFilesSelected = useCallback((files: FileList | null) => {
    if (!files) return;

    const newUploads: FileUploadState[] = Array.from(files)
      .filter(file => file.type === 'application/pdf')
      .map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'pending',
      }));

    if (newUploads.length === 0) return;

    setUploads(prev => [...prev, ...newUploads]);

    // Start uploads sequentially or in parallel?
    // Plan says "Use Promise.all or sequential uploads".
    // I'll do them in parallel with a small delay or just start them all.
    newUploads.forEach(upload => {
      processUpload(upload.id, upload.file);
    });
  }, [processUpload]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFilesSelected(e.dataTransfer.files);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out ${
          isDragging 
            ? 'border-blue-500 bg-blue-50 scale-[1.02]' 
            : 'border-gray-300 hover:border-gray-400 bg-white'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,application/pdf"
          onChange={(e) => onFilesSelected(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="space-y-4">
          <div className="flex justify-center">
            <svg 
              className={`w-12 h-12 transition-colors ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-xl font-semibold text-gray-700">
              {isDragging ? 'Drop to upload' : 'Click or drag PDF files here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Supports multiple PDF files up to 50MB each</p>
          </div>
        </div>
      </div>

      {uploads.length > 0 && (
        <div className="space-y-3">
          {uploads.map((upload) => (
            <div key={upload.id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                  upload.status === 'completed' ? 'bg-green-100 text-green-800' :
                  upload.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {upload.status.toUpperCase()}
                </span>
              </div>
              
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${upload.progress}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-300 ${
                      upload.status === 'error' ? 'bg-red-500' :
                      upload.status === 'completed' ? 'bg-green-500' :
                      'bg-blue-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{upload.progress}%</span>
                  {upload.error && <span className="text-red-500 font-medium">{upload.error}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
