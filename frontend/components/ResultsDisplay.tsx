'use client';

import React, { useState, useMemo } from 'react';
import { ExtractionResult } from '../lib/api';

interface ResultsDisplayProps {
  results: ExtractionResult[];
  onClear?: () => void;
}

export default function ResultsDisplay({ results, onClear }: ResultsDisplayProps) {
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const selectedResult = results[selectedResultIndex];

  // Reset page when switching files
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedResultIndex]);

  const highlightText = (text: string, term: string) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 rounded-sm px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const filteredPages = useMemo(() => {
    if (!selectedResult) return [];
    if (!searchTerm) return selectedResult.pages;

    return selectedResult.pages.filter(page => 
      page.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedResult, searchTerm]);

  if (results.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Extraction Results</h2>
        <button
          onClick={onClear}
          className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
        >
          Clear all results
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar / File list */}
        <div className="w-full md:w-64 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">Files</p>
          <div className="space-y-1">
            {results.map((result, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedResultIndex(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedResultIndex === idx
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="truncate">{result.filename || `Document ${idx + 1}`}</div>
                <div className={`text-[10px] ${selectedResultIndex === idx ? 'text-blue-100' : 'text-gray-400'}`}>
                  {result.page_count} {result.page_count === 1 ? 'page' : 'pages'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border rounded-xl shadow-sm flex flex-col min-h-[600px]">
          {/* Header */}
          <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10 rounded-t-xl">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search in text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <svg 
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="flex items-center space-x-4">
               <span className="text-xs text-gray-500">
                {searchTerm ? `Found in ${filteredPages.length} pages` : `Page ${currentPage} of ${selectedResult.page_count}`}
               </span>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[700px]">
            {searchTerm ? (
              <div className="space-y-8">
                {filteredPages.length > 0 ? (
                  filteredPages.map((page) => (
                    <div key={page.page_number} className="space-y-2">
                      <div className="text-xs font-semibold text-blue-600 bg-blue-50 w-max px-2 py-0.5 rounded">
                        Page {page.page_number}
                      </div>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                        {highlightText(page.text, searchTerm)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                    <svg className="w-12 h-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No matches found for "{searchTerm}"</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-blue-600 bg-blue-50 w-max px-2 py-0.5 rounded">
                  Page {selectedResult.pages[currentPage - 1].page_number}
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                  {selectedResult.pages[currentPage - 1].text}
                </div>
              </div>
            )}
          </div>

          {/* Footer / Pagination */}
          {!searchTerm && selectedResult.page_count > 1 && (
            <div className="p-4 border-t flex items-center justify-between bg-gray-50 rounded-b-xl">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 transition-all shadow-sm"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, selectedResult.page_count) }, (_, i) => {
                  let pageNum = i + 1;
                  // Simple sliding window for pagination
                  if (selectedResult.page_count > 5 && currentPage > 3) {
                    pageNum = currentPage - 3 + i + 1;
                    if (pageNum > selectedResult.page_count) {
                      pageNum = selectedResult.page_count - (4 - i);
                    }
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'hover:bg-white border border-transparent hover:border-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                disabled={currentPage === selectedResult.page_count}
                onClick={() => setCurrentPage(p => Math.min(selectedResult.page_count, p + 1))}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-white disabled:opacity-50 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
