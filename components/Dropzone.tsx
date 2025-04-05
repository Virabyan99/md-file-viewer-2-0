'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// Define the file types we accept
const acceptedFileTypes = {
  'text/markdown': ['.md'],
};

export default function Dropzone({ onFileAccepted }: { onFileAccepted: (file: File) => void }) {
  const [fileName, setFileName] = useState<string | null>(null);

  // Handle drop event
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      onFileAccepted(file);
    }
  }, [onFileAccepted]);

  // Hook config
  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    multiple: false,
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition hover:bg-gray-50"
    >
      <input {...getInputProps()} />
      <p className="text-gray-700">
        {isDragActive ? 'Drop your markdown file here...' : 'Drag & drop a .md file, or click to select'}
      </p>

      {/* Show file name if accepted */}
      {fileName && <p className="mt-2 text-sm text-green-600">Accepted: {fileName}</p>}

      {/* Show error if file rejected */}
      {fileRejections.length > 0 && (
        <p className="mt-2 text-sm text-red-600">❌ Invalid file type. Please drop a `.md` file.</p>
      )}
    </div>
  );
}