export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          github_username: string | null
          github_access_token: string | null
          default_repo_owner: string | null
          default_repo_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          github_username?: string | null
          github_access_token?: string | null
          default_repo_owner?: string | null
          default_repo_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          github_username?: string | null
          github_access_token?: string | null
          default_repo_owner?: string | null
          default_repo_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type InsertUserProfile = Database['public']['Tables']['user_profiles']['Insert']
export type UpdateUserProfile = Database['public']['Tables']['user_profiles']['Update']