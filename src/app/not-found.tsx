"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ページが見つかりません
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Home size={20} />
            ホームに戻る
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={20} />
            前のページに戻る
          </button>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>
            問題が続く場合は、
            <Link href="/" className="text-blue-600 hover:underline">
              ホームページ
            </Link>
            からやり直してください。
          </p>
        </div>
      </div>
    </div>
  );
}