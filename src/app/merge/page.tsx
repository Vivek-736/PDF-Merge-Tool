'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument } from 'pdf-lib';
import { ArrowUpTrayIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export default function MergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setMergedPdfUrl(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  });

  const mergePDFs = async () => {
    if (files.length < 2) return;
    
    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
      }

      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setMergedPdfUrl(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Merge PDF Files
          </h1>
          <p className="mt-3 text-lg leading-8 text-gray-600">
            Upload multiple PDF files and merge them into a single document
          </p>
        </div>

        <div className="mt-10">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'}`}
          >
            <input {...getInputProps()} />
            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              {isDragActive
                ? 'Drop the PDF files here'
                : 'Drag and drop PDF files here, or click to select files'}
            </p>
          </div>

          {files.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Selected Files</h2>
              <ul className="mt-4 divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="py-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-3 text-sm text-gray-900">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <button
                  onClick={mergePDFs}
                  disabled={files.length < 2 || isProcessing}
                  className={`w-full rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm
                    ${files.length < 2 || isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500'}`}
                >
                  {isProcessing ? 'Merging...' : 'Merge PDFs'}
                </button>
              </div>
            </div>
          )}

          {mergedPdfUrl && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Merged PDF</h2>
              <div className="mt-4">
                <a
                  href={mergedPdfUrl}
                  download="merged.pdf"
                  className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Download Merged PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 