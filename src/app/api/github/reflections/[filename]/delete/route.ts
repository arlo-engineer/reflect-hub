import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createGitHubClient } from '@/lib/github/client';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  const params = await context.params;
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    // 認証チェック
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // ユーザープロファイルからGitHubアクセストークンとデフォルトリポジトリを取得
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('github_access_token, default_repo_owner, default_repo_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.github_access_token) {
      return NextResponse.json(
        { success: false, error: 'GitHub access token not found. Please reconnect your GitHub account.' },
        { status: 400 }
      );
    }

    if (!profile.default_repo_owner || !profile.default_repo_name) {
      return NextResponse.json(
        { success: false, error: 'Default repository not set. Please configure your default repository.' },
        { status: 400 }
      );
    }

    const filename = params.filename;
    if (!filename || !filename.endsWith('.md')) {
      return NextResponse.json(
        { success: false, error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // Create GitHub client and delete file
    const githubClient = createGitHubClient(profile.github_access_token);
    
    await githubClient.deleteReflectionFile(
      profile.default_repo_owner,
      profile.default_repo_name,
      filename
    );

    return NextResponse.json({
      success: true,
      message: 'Reflection deleted successfully',
      data: {
        filename,
        repository: `${profile.default_repo_owner}/${profile.default_repo_name}`,
      },
    });

  } catch (error: any) {
    console.error('Delete reflection error:', error);
    
    // Handle specific GitHub API errors
    if (error.status === 404) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }
    
    if (error.status === 403) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Please check repository permissions.' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete reflection'
      },
      { status: 500 }
    );
  }
}