export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      release: {
        Row: {
          aniwaveSourceUrl: string
          aniwaveUrlForFirstUnwatchedEpisode: string | null
          createdAt: string
          id: string
          isWatching: boolean
          lastWatchedEpisode: number
          latestEpisode: number
          nyaaSourceUrl: string
          nyaaUrlForFirstUnwatchedEpisode: string | null
          season: number
          thumbnailUrl: string
          title: string
          userId: string | null
        }
        Insert: {
          aniwaveSourceUrl: string
          aniwaveUrlForFirstUnwatchedEpisode?: string | null
          createdAt?: string
          id?: string
          isWatching?: boolean
          lastWatchedEpisode?: number
          latestEpisode?: number
          nyaaSourceUrl: string
          nyaaUrlForFirstUnwatchedEpisode?: string | null
          season?: number
          thumbnailUrl: string
          title: string
          userId?: string | null
        }
        Update: {
          aniwaveSourceUrl?: string
          aniwaveUrlForFirstUnwatchedEpisode?: string | null
          createdAt?: string
          id?: string
          isWatching?: boolean
          lastWatchedEpisode?: number
          latestEpisode?: number
          nyaaSourceUrl?: string
          nyaaUrlForFirstUnwatchedEpisode?: string | null
          season?: number
          thumbnailUrl?: string
          title?: string
          userId?: string | null
        }
        Relationships: []
      }
      watchHistory: {
        Row: {
          aniwaveUrl: string
          createdAt: string
          episodeNumber: number
          id: number
          nyaaUrl: string
          releaseId: string | null
          seasonNumber: number
          userId: string
        }
        Insert: {
          aniwaveUrl: string
          createdAt?: string
          episodeNumber: number
          id?: number
          nyaaUrl: string
          releaseId?: string | null
          seasonNumber?: number
          userId?: string
        }
        Update: {
          aniwaveUrl?: string
          createdAt?: string
          episodeNumber?: number
          id?: number
          nyaaUrl?: string
          releaseId?: string | null
          seasonNumber?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_watchHistory_releaseId_fkey"
            columns: ["releaseId"]
            isOneToOne: false
            referencedRelation: "release"
            referencedColumns: ["id"]
          },
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
