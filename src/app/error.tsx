"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <AlertCircle className="text-red-500" size={64} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            申し訳ございません。予期しないエラーが発生しました。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={20} />
            再試行
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <Home size={20} />
            ホームに戻る
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>
            問題が続く場合は、しばらく時間をおいてから再度お試しください。
          </p>
          {error.digest && (
            <p className="mt-2 font-mono text-xs text-gray-400">
              エラーID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}