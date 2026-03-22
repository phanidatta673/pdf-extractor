'use client';

import { useState } from 'react';
import UploadZone from '@/components/UploadZone';
import ResultsDisplay from '@/components/ResultsDisplay';
import { ExtractionResult } from '@/lib/api';

export default function Home() {
  const [results, setResults] = useState<ExtractionResult[]>([]);

  const handleExtractionComplete = (newResults: ExtractionResult[]) => {
    setResults(prev => [...prev, ...newResults]);
  };

  const handleClear = () => {
    setResults([]);
  };

  return (
    <main className="container mx-auto px-4 py-12 min-h-screen">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          PDF Text Extractor
        </h1>
        <p className="text-lg text-gray-600">
          Upload your PDF files to extract text and metadata instantly.
        </p>
      </div>

      <UploadZone onComplete={handleExtractionComplete} />

      {results.length > 0 && (
        <ResultsDisplay results={results} onClear={handleClear} />
      )}
    </main>
  );
}
