export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_config: {
        Row: {
          id: string
          pin: string
          updated_at: string
        }
        Insert: {
          id?: string
          pin: string
          updated_at?: string
        }
        Update: {
          id?: string
          pin?: string
          updated_at?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          active: boolean
          created_at: string
          display_order: number
          ends_at: string | null
          id: string
          link: string | null
          message: string
          starts_at: string | null
          title: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          display_order?: number
          ends_at?: string | null
          id?: string
          link?: string | null
          message: string
          starts_at?: string | null
          title: string
        }
        Update: {
          active?: boolean
          created_at?: string
          display_order?: number
          ends_at?: string | null
          id?: string
          link?: string | null
          message?: string
          starts_at?: string | null
          title?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string
          display_order: number
          id: string
          image_url: string | null
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          city: string
          created_at: string
          customer_name: string
          district: string
          id: string
          items: Json
          mobile: string
          order_code: string
          pincode: string
          savings: number
          status: string
          subtotal: number
          total: number
          whatsapp: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          customer_name: string
          district: string
          id?: string
          items?: Json
          mobile: string
          order_code?: string
          pincode: string
          savings?: number
          status?: string
          subtotal?: number
          total?: number
          whatsapp: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          customer_name?: string
          district?: string
          id?: string
          items?: Json
          mobile?: string
          order_code?: string
          pincode?: string
          savings?: number
          status?: string
          subtotal?: number
          total?: number
          whatsapp?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          brand: string
          category_id: string | null
          colors: string[]
          created_at: string
          description: string
          discount_percentage: number
          discount_price: number | null
          featured: boolean
          gender: string
          id: string
          images: string[]
          is_new: boolean
          is_sale: boolean
          name: string
          original_price: number
          sizes: string[]
          slug: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand?: string
          category_id?: string | null
          colors?: string[]
          created_at?: string
          description?: string
          discount_percentage?: number
          discount_price?: number | null
          featured?: boolean
          gender?: string
          id?: string
          images?: string[]
          is_new?: boolean
          is_sale?: boolean
          name: string
          original_price?: number
          sizes?: string[]
          slug: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand?: string
          category_id?: string | null
          colors?: string[]
          created_at?: string
          description?: string
          discount_percentage?: number
          discount_price?: number | null
          featured?: boolean
          gender?: string
          id?: string
          images?: string[]
          is_new?: boolean
          is_sale?: boolean
          name?: string
          original_price?: number
          sizes?: string[]
          slug?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address: string
          delivery_info: string
          email: string
          id: string
          instagram_url: string
          logo_url: string | null
          opening_hours: string
          phone: string
          policies: string
          store_name: string
          tagline: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          address?: string
          delivery_info?: string
          email?: string
          id?: string
          instagram_url?: string
          logo_url?: string | null
          opening_hours?: string
          phone?: string
          policies?: string
          store_name?: string
          tagline?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          address?: string
          delivery_info?: string
          email?: string
          id?: string
          instagram_url?: string
          logo_url?: string | null
          opening_hours?: string
          phone?: string
          policies?: string
          store_name?: string
          tagline?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
