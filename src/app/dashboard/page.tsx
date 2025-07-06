"use client";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/supabase";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [reflection, setReflection] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("ログアウトエラー:", error);
    }
  };

  const handleSave = async () => {
    if (!reflection.trim()) return;

    setSaveStatus("saving");
    try {
      // TODO: GitHub API保存実装
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 仮の遅延
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (error) {
      console.error("保存エラー:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case "saving":
        return "保存中...";
      case "success":
        return "保存完了";
      case "error":
        return "保存失敗";
      default:
        return "GitHubに保存";
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              振り返りサービス
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.user_metadata?.user_name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-72px)]">
          {/* サイドバー */}
          <aside className="w-64 bg-white border-r border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              メニュー
            </h2>
            <nav className="space-y-2">
              <a
                href="#"
                className="flex items-center px-3 py-2 text-gray-700 bg-gray-100 rounded-lg"
              >
                新規作成
              </a>
              <a
                href="#"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                過去の振り返り
              </a>
            </nav>
          </aside>

          {/* メインコンテンツ */}
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">
              {/* エディターヘッダー */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    今日の振り返り
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date().toLocaleDateString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saveStatus === "saving" || !reflection.trim()}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    saveStatus === "saving" || !reflection.trim()
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : saveStatus === "success"
                      ? "bg-green-600 text-white"
                      : saveStatus === "error"
                      ? "bg-red-600 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {getSaveButtonText()}
                </button>
              </div>

              {/* Markdownエディター */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="border-b border-gray-200 px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Markdown</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>
                </div>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="今日の振り返りを書いてください...&#10;&#10;## 今日やったこと&#10;- &#10;&#10;## 学んだこと&#10;- &#10;&#10;## 明日やること&#10;- "
                  className="w-full h-96 p-4 text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  spellCheck="false"
                />
              </div>

              {/* プレビュー */}
              {reflection && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <div className="border-b border-gray-200 px-4 py-2">
                    <span className="text-sm text-gray-600">プレビュー</span>
                  </div>
                  <div className="p-4 prose max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {reflection}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
