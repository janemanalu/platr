/**
 * Hand-maintained to mirror supabase/migrations. Keep in sync when the schema
 * changes (or regenerate with `supabase gen types` once a CLI login is available).
 */

export type LogStatus = 'visited' | 'wishlist' | 'blacklisted' | 'go_to';
export type TagCategory = 'cuisine' | 'occasion' | 'vibe' | 'price_point' | 'dietary';
export type ListVisibility = 'public' | 'private';

type Timestamped = { created_at: string };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          username: string;
          avatar_url: string | null;
          area: string | null;
          city: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          username: string;
          avatar_url?: string | null;
          area?: string | null;
          city?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          google_place_id: string | null;
          name: string;
          cuisine: string | null;
          price_level: number | null;
          area: string | null;
          city: string | null;
          address: string | null;
          lat: number | null;
          lng: number | null;
          about: string | null;
          website_url: string | null;
          cover_photo_url: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          google_place_id?: string | null;
          name: string;
          cuisine?: string | null;
          price_level?: number | null;
          area?: string | null;
          city?: string | null;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          about?: string | null;
          website_url?: string | null;
          cover_photo_url?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>;
        Relationships: [];
      };
      tags: {
        Row: { id: string; category: TagCategory; label: string; slug: string };
        Insert: { id?: string; category: TagCategory; label: string; slug: string };
        Update: Partial<Database['public']['Tables']['tags']['Insert']>;
        Relationships: [];
      };
      logs: {
        Row: {
          id: string;
          user_id: string;
          restaurant_id: string;
          status: LogStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          restaurant_id: string;
          status: LogStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['logs']['Insert']>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          log_id: string;
          user_id: string;
          restaurant_id: string;
          food_rating: number | null;
          vibe_rating: number | null;
          notes: string | null;
          visited_on: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          log_id: string;
          user_id?: string;
          restaurant_id?: string;
          food_rating?: number | null;
          vibe_rating?: number | null;
          notes?: string | null;
          visited_on?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
        Relationships: [];
      };
      review_photos: {
        Row: { id: string; review_id: string; storage_path: string; position: number };
        Insert: { id?: string; review_id: string; storage_path: string; position?: number };
        Update: Partial<Database['public']['Tables']['review_photos']['Insert']>;
        Relationships: [];
      };
      review_tags: {
        Row: { review_id: string; tag_id: string };
        Insert: { review_id: string; tag_id: string };
        Update: Partial<Database['public']['Tables']['review_tags']['Insert']>;
        Relationships: [];
      };
      review_friend_tags: {
        Row: { review_id: string; friend_id: string };
        Insert: { review_id: string; friend_id: string };
        Update: Partial<Database['public']['Tables']['review_friend_tags']['Insert']>;
        Relationships: [];
      };
      review_suggestions: {
        Row: {
          id: string;
          restaurant_id: string;
          author_id: string;
          review_id: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          author_id: string;
          review_id?: string | null;
          body: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['review_suggestions']['Insert']>;
        Relationships: [];
      };
      custom_lists: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          visibility: ListVisibility;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          visibility?: ListVisibility;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['custom_lists']['Insert']>;
        Relationships: [];
      };
      list_items: {
        Row: { list_id: string; restaurant_id: string; position: number; added_at: string };
        Insert: { list_id: string; restaurant_id: string; position?: number; added_at?: string };
        Update: Partial<Database['public']['Tables']['list_items']['Insert']>;
        Relationships: [];
      };
      status_list_privacy: {
        Row: { user_id: string; status: LogStatus; is_public: boolean };
        Insert: { user_id: string; status: LogStatus; is_public?: boolean };
        Update: Partial<Database['public']['Tables']['status_list_privacy']['Insert']>;
        Relationships: [];
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['follows']['Insert']>;
        Relationships: [];
      };
      likes: {
        Row: { id: string; review_id: string; user_id: string; created_at: string };
        Insert: { id?: string; review_id: string; user_id: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['likes']['Insert']>;
        Relationships: [];
      };
      comments: {
        Row: { id: string; review_id: string; user_id: string; body: string; created_at: string };
        Insert: { id?: string; review_id: string; user_id: string; body: string; created_at?: string };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      restaurant_scores: {
        Row: {
          restaurant_id: string;
          review_count: number;
          food_avg: number | null;
          vibe_avg: number | null;
          overall_avg: number | null;
        };
        Relationships: [];
      };
      restaurant_tags_view: {
        Row: {
          restaurant_id: string;
          tag_id: string;
          category: TagCategory;
          label: string;
          slug: string;
          uses: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      current_streak: { Args: { _user_id: string }; Returns: number };
      mutual_follows: {
        Args: { _target: string };
        Returns: Database['public']['Tables']['profiles']['Row'][];
      };
      is_status_public: { Args: { _user_id: string; _status: LogStatus }; Returns: boolean };
      review_is_visible: { Args: { _review_id: string }; Returns: boolean };
    };
    Enums: {
      log_status: LogStatus;
      tag_category: TagCategory;
      list_visibility: ListVisibility;
    };
  };
}

/** Convenience row aliases. */
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Restaurant = Database['public']['Tables']['restaurants']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Log = Database['public']['Tables']['logs']['Row'];
export type Review = Database['public']['Tables']['reviews']['Row'];
export type CustomList = Database['public']['Tables']['custom_lists']['Row'];
export type RestaurantScore = Database['public']['Views']['restaurant_scores']['Row'];

export type { Timestamped };
