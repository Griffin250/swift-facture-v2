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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      billing_events: {
        Row: {
          event_type: string
          id: string
          metadata: Json | null
          org_id: string
          timestamp: string | null
        }
        Insert: {
          event_type: string
          id?: string
          metadata?: Json | null
          org_id: string
          timestamp?: string | null
        }
        Update: {
          event_type?: string
          id?: string
          metadata?: Json | null
          org_id?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          org_id: string
          plan_id: string
          status: string
          subscription_end: string | null
          subscription_start: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          org_id: string
          plan_id: string
          status?: string
          subscription_end?: string | null
          subscription_start?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          org_id?: string
          plan_id?: string
          status?: string
          subscription_end?: string | null
          subscription_start?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_subscriptions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      estimate_items: {
        Row: {
          created_at: string | null
          description: string
          estimate_id: string
          id: string
          quantity: number
          sort_order: number | null
          tax_rate: number | null
          total: number
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          estimate_id: string
          id?: string
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          total?: number
          unit_price?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          estimate_id?: string
          id?: string
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          total?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimate_items_estimate_id_fkey"
            columns: ["estimate_id"]
            isOneToOne: false
            referencedRelation: "estimates"
            referencedColumns: ["id"]
          },
        ]
      }
      estimates: {
        Row: {
          created_at: string | null
          customer_id: string | null
          date: string
          estimate_number: string
          expiry_date: string | null
          id: string
          notes: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          template_name: string | null
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          date: string
          estimate_number: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          template_name?: string | null
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          date?: string
          estimate_number?: string
          expiry_date?: string | null
          id?: string
          notes?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          template_name?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estimates_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number | null
          tax_rate: number | null
          total: number
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          total?: number
          unit_price?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number | null
          tax_rate?: number | null
          total?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_id: string | null
          date: string
          due_date: string | null
          id: string
          invoice_number: string
          notes: string | null
          status: string | null
          subtotal: number | null
          tax: number | null
          template_name: string | null
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          date: string
          due_date?: string | null
          id?: string
          invoice_number: string
          notes?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          template_name?: string | null
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          date?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          notes?: string | null
          status?: string | null
          subtotal?: number | null
          tax?: number | null
          template_name?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      org_members: {
        Row: {
          id: string
          joined_at: string | null
          org_id: string
          role: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          org_id: string
          role?: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          org_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          customer_id: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_method: string | null
          status: string | null
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          customer_id?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      receipt_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          quantity: number
          receipt_id: string
          sort_order: number | null
          tax_rate: number | null
          total: number
          unit_price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          quantity?: number
          receipt_id: string
          sort_order?: number | null
          tax_rate?: number | null
          total?: number
          unit_price?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          quantity?: number
          receipt_id?: string
          sort_order?: number | null
          tax_rate?: number | null
          total?: number
          unit_price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipt_items_receipt_id_fkey"
            columns: ["receipt_id"]
            isOneToOne: false
            referencedRelation: "receipts"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string | null
          customer_id: string | null
          date: string
          id: string
          notes: string | null
          payment_method: string | null
          receipt_number: string
          subtotal: number | null
          tax: number | null
          template_name: string | null
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          date: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_number: string
          subtotal?: number | null
          tax?: number | null
          template_name?: string | null
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          date?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          receipt_number?: string
          subtotal?: number | null
          tax?: number | null
          template_name?: string | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string | null
          date_format: string | null
          default_currency: string | null
          default_tax_rate: number | null
          default_template: string | null
          estimate_prefix: string | null
          id: string
          invoice_prefix: string | null
          language: string | null
          receipt_prefix: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_format?: string | null
          default_currency?: string | null
          default_tax_rate?: number | null
          default_template?: string | null
          estimate_prefix?: string | null
          id?: string
          invoice_prefix?: string | null
          language?: string | null
          receipt_prefix?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_format?: string | null
          default_currency?: string | null
          default_tax_rate?: number | null
          default_template?: string | null
          estimate_prefix?: string | null
          id?: string
          invoice_prefix?: string | null
          language?: string | null
          receipt_prefix?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "admin" | "super_admin"
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
    Enums: {
      app_role: ["user", "admin", "super_admin"],
    },
  },
} as const
