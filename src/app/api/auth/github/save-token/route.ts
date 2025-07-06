import { NextRequest, NextResponse } from "next/server";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });

    // 認証チェック
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { access_token, refresh_token } = await request.json();

    if (!access_token) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    // GitHubユーザー情報を取得
    const githubResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!githubResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch GitHub user info" },
        { status: 400 }
      );
    }

    const githubUser = await githubResponse.json();

    // user_profilesテーブルを更新
    const { error: updateError } = await supabase.from("user_profiles").upsert({
      id: user.id,
      github_username: githubUser.login,
      github_access_token: access_token,
      avatar_url: githubUser.avatar_url,
      updated_at: new Date().toISOString(),
    });

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
