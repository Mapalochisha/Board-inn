export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'renter' | 'landlord' | 'admin'
  phone: string | null
  is_verified: boolean
  created_at: string
}

export interface Property {
  id: string
  landlord_id: string
  title: string
  description: string
  address_line1: string
  address_line2: string | null
  city: string
  district: string
  latitude: number | null
  longitude: number | null
  total_rooms: number
  status: 'draft' | 'published' | 'archived'
  cover_image_url: string | null
  images: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Unit {
  id: string
  property_id: string
  name: string
  unit_type: 'full_room' | 'bed_space'
  price_per_month: number
  total_capacity: number
  current_occupancy: number
  is_available: boolean
  available_from: string | null
  gender_restriction: 'male' | 'female' | 'any'
  floor_number: number | null
  description: string | null
  images: string[]
}

export interface ViewingSlot {
  id: string
  property_id: string
  landlord_id: string
  slot_date: string
  start_time: string
  end_time: string
  max_viewers: number
  current_viewers: number
  status: 'available' | 'full' | 'cancelled'
  notes: string | null
}

export interface ViewingBooking {
  id: string
  slot_id: string
  renter_id: string
  property_id: string
  unit_id: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  cancellation_reason: string | null
  is_late_cancellation: boolean
  renter_notes: string | null
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  meta?: Record<string, unknown>
}
