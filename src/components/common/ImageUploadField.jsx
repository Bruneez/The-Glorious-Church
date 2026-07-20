import { useCallback, useEffect, useRef, useState } from 'react';
import { ImageOff, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import UserAvatar from '@/components/ui/UserAvatar';

const DEFAULT_ACCEPT = {
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  acceptString: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
};

export default function ImageUploadField({
  label = 'Image',
  existingImageUrl = '',
  selectedFile = null,
  onFileSelect,
  onRemove,
  accept = DEFAULT_ACCEPT.acceptString,
  maxSizeMB = 5,
  disabled = false,
  loading = false,
  previewShape = 'circle',
  helperText = 'JPG, PNG, or WEBP up to 5 MB.',
  error = '',
  previewName = 'Image',
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');

  useEffect(() => {
    if (!selectedFile) {
      setLocalPreviewUrl('');
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setLocalPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const previewUrl = localPreviewUrl || existingImageUrl || '';
  const hasPreview = Boolean(previewUrl);
  const isSquare = previewShape === 'square';

  const openFilePicker = () => {
    if (disabled || loading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelection = useCallback(
    (file) => {
      if (!file || disabled || loading) return;
      onFileSelect?.(file);
    },
    [disabled, loading, onFileSelect],
  );

  const handleInputChange = (event) => {
    const file = event.target.files?.[0];
    handleFileSelection(file);
    event.target.value = '';
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    if (disabled || loading) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled || loading) return;
    handleFileSelection(event.dataTransfer.files?.[0]);
  };

  const handleRemove = () => {
    if (disabled || loading) return;
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      {label ? (
        <label className="block text-slate-400 mb-1 font-medium text-xs">{label}</label>
      ) : null}

      <div
        className={`rounded-lg border bg-slate-900 p-3 space-y-3 transition ${
          error
            ? 'border-rose-500/50'
            : isDragging
              ? 'border-indigo-500 bg-indigo-500/5'
              : 'border-slate-700'
        } ${disabled ? 'opacity-60' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center gap-3">
          {isSquare ? (
            <div className="w-16 h-16 rounded-lg border border-indigo-400/30 overflow-hidden bg-indigo-600/20 shrink-0 flex items-center justify-center">
              {hasPreview ? (
                <img src={previewUrl} alt={previewName} className="w-full h-full object-cover" />
              ) : (
                <ImageOff className="w-6 h-6 text-slate-500" aria-hidden="true" />
              )}
            </div>
          ) : (
            <UserAvatar name={previewName} photo={hasPreview ? previewUrl : ''} size="lg" />
          )}

          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white">
              {loading
                ? 'Uploading...'
                : hasPreview
                  ? selectedFile
                    ? 'New image selected'
                    : 'Current image'
                  : 'No image uploaded'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {helperText || `Accepted files up to ${maxSizeMB} MB.`}
            </p>
            {!disabled && !loading ? (
              <p className="text-[10px] text-slate-500 mt-1 hidden sm:block">
                Drag and drop an image here, or use the buttons below.
              </p>
            ) : null}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled || loading}
          className="hidden"
        />

        <div className="flex flex-wrap gap-2">
          {!hasPreview ? (
            <Button
              type="button"
              variant="secondary"
              icon={Upload}
              onClick={openFilePicker}
              disabled={disabled || loading}
            >
              Upload Image
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={openFilePicker}
                disabled={disabled || loading}
              >
                Replace Image
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleRemove}
                disabled={disabled || loading}
              >
                Remove Image
              </Button>
            </>
          )}
        </div>
      </div>

      {error ? <p className="text-rose-400 text-[11px]">{error}</p> : null}
    </div>
  );
}
