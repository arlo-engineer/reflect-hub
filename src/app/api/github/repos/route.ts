import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createGitHubClient } from '@/lib/github';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // 認証チェック
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ユーザープロファイルからGitHubアクセストークンを取得
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('github_access_token')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.github_access_token) {
      return NextResponse.json({ 
        error: 'GitHub access token not found. Please reconnect your GitHub account.' 
      }, { status: 400 });
    }

    // GitHub APIクライアントを作成してリポジトリを取得
    const githubClient = createGitHubClient(profile.github_access_token);
    const repositories = await githubClient.getRepositories();

    // プッシュ権限があるリポジトリのみフィルタリング
    const writableRepos = repositories.filter(repo => 
      repo.permissions?.push !== false
    );

    return NextResponse.json({ 
      repositories: writableRepos,
      total: writableRepos.length 
    });

  } catch (error: any) {
    console.error('GitHub repos API error:', error);
    
    // GitHub APIエラーの場合は適切なエラーメッセージを返す
    if (error.status === 401) {
      return NextResponse.json({ 
        error: 'GitHub authentication failed. Please reconnect your account.' 
      }, { status: 401 });
    }
    
    if (error.status === 403) {
      return NextResponse.json({ 
        error: 'GitHub API rate limit exceeded. Please try again later.' 
      }, { status: 403 });
    }

    return NextResponse.json({ 
      error: 'Failed to fetch repositories' 
    }, { status: 500 });
  }
}