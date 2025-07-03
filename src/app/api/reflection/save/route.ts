import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleApiError } from '@/lib/utils'

// リクエストボディのバリデーションスキーマ
const saveReflectionSchema = z.object({
  content: z.string().min(1, 'コンテンツは必須です'),
  title: z.string().optional(),
  fileName: z.string().optional(),
  repository: z.string().min(1, 'リポジトリは必須です'),
  branch: z.string().default('main'),
  directory: z.string().default('reflections'),
})

export async function POST(request: NextRequest) {
  try {
    // リクエストボディを解析
    const body = await request.json()
    
    // バリデーション
    const validatedData = saveReflectionSchema.parse(body)
    
    // TODO: Supabaseから認証ユーザーを取得
    // TODO: GitHubトークンを取得
    // TODO: Octokitでファイルを保存
    
    // 現在はモックレスポンス
    return NextResponse.json({
      success: true,
      data: {
        message: '振り返りが正常に保存されました',
        fileName: validatedData.fileName || `reflection-${Date.now()}.md`,
        url: `https://github.com/${validatedData.repository}/blob/${validatedData.branch}/${validatedData.directory}/reflection.md`
      }
    })
    
  } catch (error) {
    console.error('Reflection save error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'バリデーションエラー',
          status: 400,
          code: 'VALIDATION_ERROR',
          details: error.errors
        }
      }, { status: 400 })
    }
    
    const apiError = handleApiError(error)
    return NextResponse.json({
      success: false,
      error: apiError
    }, { status: apiError.status })
  }
}