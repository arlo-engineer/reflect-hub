"use client";

import * as React from "react"
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineLoadingSpinner } from "@/components/ui/loading-spinner";
import { Skeleton, SkeletonCard, SkeletonEditor, SkeletonInput } from "@/components/ui/skeleton";
import { CalendarDays, FileText, Save, Eye, Edit3, Sparkles } from "lucide-react";

interface ReflectionEditorProps {
  onSave?: (content: string, filename: string) => void;
  initialContent?: string;
  isSaving?: boolean;
}

export function ReflectionEditor({ 
  onSave, 
  initialContent = "", 
  isSaving = false 
}: ReflectionEditorProps) {
  const [content, setContent] = React.useState(initialContent);
  const [filename, setFilename] = React.useState("");
  const [currentDate, setCurrentDate] = React.useState("");
  const [mobilePreview, setMobilePreview] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Auto-set today's date and generate filename
  React.useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setCurrentDate(formattedDate);
    setFilename(`${formattedDate}.md`);
  }, []);

  // Check if mobile on client side
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Generate default content template with today's date
  React.useEffect(() => {
    if (initialContent === "" && currentDate) {
      const template = `# 振り返り - ${currentDate}

## 今日やったこと
- 

## 学んだこと
- 

## 改善点
- 

## 明日やること
- 

## 所感
`;
      setContent(template);
      // Simulate loading time for better UX
      setTimeout(() => {
        setIsInitializing(false);
      }, 800);
    } else {
      setIsInitializing(false);
    }
  }, [currentDate, initialContent]);

  const handleSave = () => {
    if (onSave) {
      onSave(content || "", filename);
    }
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Ensure .md extension
    if (value && !value.endsWith('.md')) {
      value = value.replace(/\.[^/.]+$/, "") + '.md';
    }
    setFilename(value);
  };

  // Show skeleton loader while initializing
  if (isInitializing) {
    return (
      <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:max-w-6xl xl:mx-auto space-y-4 sm:space-y-6">
        <SkeletonCard />
        <SkeletonEditor />
        <div className="flex justify-center sm:justify-end">
          <Skeleton className="h-12 w-full sm:w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 xl:max-w-6xl xl:mx-auto space-y-4 sm:space-y-6">
      {/* Header Section - Mobile Optimized */}
      <Card className="shadow-sm border-dashed border-2 border-blue-200 bg-blue-50/30 transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-900">
            <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
            振り返り作成
            <Sparkles className="w-4 h-4 text-blue-500 ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium text-blue-800">日付</Label>
              <Input
                id="date"
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-full h-10 sm:h-10 text-sm sm:text-base border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filename" className="flex items-center gap-2 text-sm font-medium text-blue-800">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                ファイル名
              </Label>
              <Input
                id="filename"
                value={filename}
                onChange={handleFilenameChange}
                placeholder="YYYY-MM-DD.md"
                className="w-full h-10 sm:h-10 text-sm sm:text-base border-blue-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Preview Toggle */}
      <div className="flex justify-center sm:hidden">
        <div className="flex bg-muted rounded-lg p-1 shadow-sm">
          <Button
            variant={!mobilePreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setMobilePreview(false)}
            className="px-3 py-1 text-xs transition-all duration-200"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            編集
          </Button>
          <Button
            variant={mobilePreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setMobilePreview(true)}
            className="px-3 py-1 text-xs transition-all duration-200"
          >
            <Eye className="w-3 h-3 mr-1" />
            プレビュー
          </Button>
        </div>
      </div>

      {/* Markdown Editor - Responsive */}
      <Card className="shadow-sm transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">振り返り内容</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full overflow-hidden">
            <MDEditor
              value={content}
              onChange={(value) => setContent(value || "")}
              preview={mobilePreview ? "preview" : "edit"}
              hideToolbar={false}
              height={isMobile ? 400 : 500}
              data-color-mode="light"
              visibleDragbar={false}
              className="!border-none transition-all duration-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button - Mobile Optimized with Enhanced Animation */}
      <div className="flex justify-center sm:justify-end pb-4 sm:pb-0">
        <Button
          onClick={handleSave}
          disabled={isSaving || !content.trim() || !filename}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 h-12 sm:h-10 text-base sm:text-sm font-medium touch-manipulation transition-all duration-300 ${
            isSaving 
              ? 'bg-blue-500 hover:bg-blue-600 scale-105 shadow-lg' 
              : 'hover:scale-105 hover:shadow-lg'
          }`}
          size="lg"
        >
          {isSaving ? (
            <>
              <InlineLoadingSpinner size="sm" variant="white" />
              <span className="animate-pulse">保存中...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 sm:w-4 sm:h-4" />
              GitHubに保存
            </>
          )}
        </Button>
      </div>
      
      {/* Saving Overlay */}
      {isSaving && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl border max-w-sm mx-4">
            <div className="flex items-center space-x-3">
              <InlineLoadingSpinner size="default" variant="default" />
              <div>
                <p className="font-medium text-gray-900">保存中...</p>
                <p className="text-sm text-gray-600">GitHubに振り返りを保存しています</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}