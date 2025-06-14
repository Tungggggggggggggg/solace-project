import { useState, useCallback } from 'react';

interface UseFileUploadProps {
  onUploadComplete: (imageUrl: string) => void;
  onError: (error: string) => void;
}

export const useFileUpload = ({ onUploadComplete, onError }: UseFileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ percent: 0 });

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadProgress({ percent: 0 });

      try {
        const formData = new FormData();
        formData.append('media', file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/upload-media`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload file');
        }

        const data = await response.json();
        onUploadComplete(data.images[0]); // Assuming API returns { url: string }
        setUploadProgress({ percent: 100 });
      } catch (error) {
        onError(error instanceof Error ? error.message : 'Failed to upload file');
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete, onError]
  );

  const uploadMultipleFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  return { uploadFile, uploadMultipleFiles, isUploading, uploadProgress };
};