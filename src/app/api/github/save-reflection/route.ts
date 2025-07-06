import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createGitHubClient, GitHubApiError } from '@/lib/github/client';
import { ReflectionData } from '@/types/github';

export async function POST(request: NextRequest) {
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

    // Get user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get GitHub access token from session
    const githubToken = session.provider_token;
    if (!githubToken) {
      return NextResponse.json(
        { error: 'GitHub access token not found. Please reconnect your GitHub account.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: ReflectionData = await request.json();
    const { content, fileName, repository } = body;

    // Validate required fields
    if (!content || !fileName) {
      return NextResponse.json(
        { error: 'Missing required fields: content or fileName' },
        { status: 400 }
      );
    }

    // Validate fileName format (should be .md)
    if (!fileName.endsWith('.md')) {
      return NextResponse.json(
        { error: 'File name must end with .md extension' },
        { status: 400 }
      );
    }

    // Get user profile to check default repository
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('github_username, default_repo_owner, default_repo_name')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Use provided repository or construct from default repository fields
    let repoPath = repository;
    if (!repoPath && profile.default_repo_owner && profile.default_repo_name) {
      repoPath = `${profile.default_repo_owner}/${profile.default_repo_name}`;
    }
    
    if (!repoPath) {
      return NextResponse.json(
        { error: 'No repository specified and no default repository set. Please set a default repository in your profile.' },
        { status: 400 }
      );
    }

    // Create GitHub client and save reflection
    const githubClient = createGitHubClient(githubToken);
    
    try {
      // Check repository permissions first
      const hasPermission = await githubClient.checkRepositoryPermissions(repoPath);
      if (!hasPermission) {
        return NextResponse.json(
          { error: 'You do not have write permissions to this repository' },
          { status: 403 }
        );
      }

      // Save reflection to GitHub
      await githubClient.saveReflection(content, fileName, repoPath);

      // Return success response
      return NextResponse.json({
        success: true,
        message: 'Reflection saved successfully',
        data: {
          fileName,
          repository: repoPath,
          url: `https://github.com/${repoPath}/blob/main/reflections/${fileName}`
        }
      });

    } catch (error) {
      if (error instanceof GitHubApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.status }
        );
      }
      
      throw error; // Re-throw non-GitHub errors
    }

  } catch (error) {
    console.error('Error saving reflection:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}