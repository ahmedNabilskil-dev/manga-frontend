import { FileText } from "lucide-react";

// Image preview component
const ImageMessagePreview = ({ message, onPreviewImage }: any) => {
  const src = message.url || message.imageUrl || message.imageData;
  if (!src) return null;
  return (
    <img
      src={src}
      alt="Chat image"
      className="max-w-xs max-h-64 rounded-xl border border-gray-200 dark:border-gray-600 shadow-md mb-2 cursor-pointer hover:opacity-80 transition"
      style={{ display: "block" }}
      onClick={() => onPreviewImage && onPreviewImage(src)}
      title="Click to preview"
    />
  );
};

// PDF and generic file preview
const FileMessagePreview = ({ message }: any) => {
  if (!message.url) return null;
  if (message.mimeType === "application/pdf") {
    return (
      <a
        href={message.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition mb-2"
        title="Open PDF"
      >
        <FileText className="w-5 h-5" />
        <span>View PDF</span>
      </a>
    );
  }
  // Generic file
  return (
    <a
      href={message.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition mb-2"
      title="Download file"
    >
      <FileText className="w-5 h-5" />
      <span>Download File</span>
    </a>
  );
};

// General preview component
export function ChatMessagePreview({ message, onPreviewImage }: any) {
  if (
    message.mimeType?.startsWith("image/") &&
    (message.url || message.imageUrl || message.imageData)
  ) {
    return (
      <ImageMessagePreview message={message} onPreviewImage={onPreviewImage} />
    );
  }
  if (message.mimeType === "application/pdf" && message.url) {
    return <FileMessagePreview message={message} />;
  }
  if (message.url) {
    return <FileMessagePreview message={message} />;
  }
  return null;
}
