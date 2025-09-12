"use client";

import { Facebook } from "lucide-react";

interface FacebookIntegrationManagerProps {
  userId: string;
  className?: string;
}

export function FacebookIntegrationManager({
  userId,
  className,
}: FacebookIntegrationManagerProps) {
  return (
    <div className={className}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Facebook className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Facebook Integration Coming Soon
        </h3>
        <p className="text-gray-600 mb-4">
          We're working on connecting your MangaAI creations with Facebook to
          help you share your work with a wider audience.
        </p>
        <div className="text-sm text-gray-500">User ID: {userId}</div>
      </div>
    </div>
  );
}
