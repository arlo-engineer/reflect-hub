"use client";

import * as React from "react"
import MDEditor from "@uiw/react-md-editor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarDays, FileText, Save } from "lucide-react";

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

  // Auto-set today's date and generate filename
  React.useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setCurrentDate(formattedDate);
    setFilename(`${formattedDate}.md`);
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

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            振り返り作成
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">日付</Label>
              <Input
                id="date"
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filename" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                ファイル名
              </Label>
              <Input
                id="filename"
                value={filename}
                onChange={handleFilenameChange}
                placeholder="YYYY-MM-DD.md"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Markdown Editor */}
      <Card>
        <CardHeader>
          <CardTitle>振り返り内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <MDEditor
              value={content}
              onChange={(value) => setContent(value || "")}
              preview="edit"
              height={500}
              data-color-mode="light"
              toolbarHeight={60}
              visibleDragBar={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || !content.trim() || !filename}
          className="flex items-center gap-2"
          size="lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              保存中...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              GitHubに保存
            </>
          )}
        </Button>
      </div>
    </div>
  );
}