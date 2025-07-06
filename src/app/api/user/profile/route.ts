import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

// プロファイル更新用のバリデーションスキーマ
const updateProfileSchema = z.object({
  github_username: z.string().optional(),
  github_access_token: z.string().optional(),
  default_repo_owner: z.string().optional(),
  default_repo_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

// GET - プロファイル取得
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // 認証チェック
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザープロファイルを取得
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // アクセストークンは除外してレスポンス
    const { github_access_token, ...publicProfile } = profile;

    return NextResponse.json({ 
      profile: publicProfile,
      hasGitHubToken: !!github_access_token
    });

  } catch (error: any) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// POST - プロファイル更新
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // 認証チェック
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // リクエストボディを取得・バリデーション
    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // プロファイル更新
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update(validatedData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // アクセストークンは除外してレスポンス
    const { github_access_token, ...publicProfile } = updatedProfile;

    return NextResponse.json({ 
      profile: publicProfile,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Profile POST error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

// PUT - デフォルトリポジトリ設定
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // 認証チェック
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { repoOwner, repoName } = body;

    if (!repoOwner || !repoName) {
      return NextResponse.json({ 
        error: 'Repository owner and name are required' 
      }, { status: 400 });
    }

    // デフォルトリポジトリを更新
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        default_repo_owner: repoOwner,
        default_repo_name: repoName
      })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Default repo update error:', updateError);
      return NextResponse.json({ error: 'Failed to update default repository' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Default repository updated successfully',
      defaultRepo: {
        owner: updatedProfile.default_repo_owner,
        name: updatedProfile.default_repo_name
      }
    });

  } catch (error: any) {
    console.error('Default repo PUT error:', error);
    return NextResponse.json({ error: 'Failed to update default repository' }, { status: 500 });
  }
}