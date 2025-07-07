import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createGitHubClient } from '@/lib/github';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    );
    
    // 認証チェック
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { filename } = await params;
    
    // ファイル名のバリデーション
    if (!filename || !filename.endsWith('.md')) {
      return NextResponse.json({ 
        error: 'Invalid filename. Must be a .md file.' 
      }, { status: 400 });
    }

    // ユーザープロファイルからGitHubアクセストークンとデフォルトリポジトリを取得
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('github_access_token, default_repo_owner, default_repo_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.github_access_token) {
      return NextResponse.json({ 
        error: 'GitHub access token not found. Please reconnect your GitHub account.' 
      }, { status: 400 });
    }

    if (!profile.default_repo_owner || !profile.default_repo_name) {
      return NextResponse.json({ 
        error: 'Default repository not set. Please configure your default repository.' 
      }, { status: 400 });
    }

    // GitHub APIクライアントを作成してファイルの内容を取得
    const githubClient = createGitHubClient(profile.github_access_token);
    const repoPath = `${profile.default_repo_owner}/${profile.default_repo_name}`;
    
    try {
      console.log('Fetching file content for:', filename, 'from repo:', repoPath);
      const fileContent = await githubClient.getReflectionFile(repoPath, filename);
      console.log('File content length:', fileContent?.length || 0);
      console.log('File content preview:', fileContent?.substring(0, 100) + '...');
      
      return NextResponse.json({ 
        content: fileContent,
        filename,
        repository: repoPath
      });

    } catch (error: any) {
      console.error('GitHub file content API error:', error);
      
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

      if (error.status === 404) {
        return NextResponse.json({ 
          error: 'File not found in repository.' 
        }, { status: 404 });
      }

      return NextResponse.json({ 
        error: 'Failed to fetch file content' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('File content API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}