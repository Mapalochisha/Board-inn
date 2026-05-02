export type UserRole = 'STUDENT' | 'LANDLORD' | 'ADMIN'

export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  landlord_id: string
  title: string
  description: string | null
  address: string
  city: string
  images: string[]
  amenities: string[]
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Unit {
  id: string
  property_id: string
  name: string
  type: string
  price: number
  deposit: number | null
  available_from: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface ViewingSlot {
  id: string
  property_id: string
  start_time: string
  end_time: string
  max_capacity: number
  current_bookings: number
}

export interface ViewingBooking {
  id: string
  slot_id: string
  student_id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  notes: string | null
  created_at: string
}
