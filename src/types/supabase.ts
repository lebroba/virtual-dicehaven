
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          rank: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          rank?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          rank?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ships: {
        Row: {
          id: string
          name: string
          class: string
          type: string
          nation: string
          description: string
          image_url: string | null
          model_url: string | null
          specifications: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          class: string
          type: string
          nation: string
          description: string
          image_url?: string | null
          model_url?: string | null
          specifications: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          class?: string
          type?: string
          nation?: string
          description?: string
          image_url?: string | null
          model_url?: string | null
          specifications?: Json
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

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Ship = Database['public']['Tables']['ships']['Row']
export type ShipSpecifications = {
  displacement: number
  length: number
  beam: number
  draft: number
  speed: number
  range: number
  crew: number
  aegisBaseline: string
  systems: {
    name: string
    type: string
    status: 'operational' | 'offline' | 'damaged' | 'destroyed'
    canToggle: boolean
    isActive: boolean
    description: string
  }[]
  weapons: {
    name: string
    type: string
    count: number
    status: 'operational' | 'offline' | 'damaged' | 'destroyed'
    ammunition?: number
    description: string
  }[]
  sensors: {
    name: string
    type: string
    status: 'operational' | 'offline' | 'damaged' | 'destroyed'
    canToggle: boolean
    isActive: boolean
    range: number
    description: string
  }[]
  vls: {
    totalCells: number
    forwardCells: number
    aftCells: number
    loadout: {
      missileType: string
      count: number
    }[]
  }
  stats: {
    firepower: number
    defense: number
    speed: number
    range: number
    antiAir: number
    antiSurface: number
    antiSubmarine: number
  }
}
