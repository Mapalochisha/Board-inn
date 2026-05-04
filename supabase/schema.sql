-- SECTION 1: EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- SECTION 2: PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'renter' CHECK (role IN ('renter','landlord','admin')),
  phone TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECTION 3: PROFILE AUTO-CREATE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SECTION 4: AMENITIES
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT
);

-- SECTION 5: PROPERTIES
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  district TEXT,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  total_rooms INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  cover_image_url TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- SECTION 6: PROPERTY_AMENITIES
CREATE TABLE public.property_amenities (
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

-- SECTION 7: UNITS
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL CHECK (unit_type IN ('full_room','bed_space')),
  price_per_month NUMERIC(10,2) NOT NULL CHECK (price_per_month > 0),
  total_capacity INT NOT NULL DEFAULT 1 CHECK (total_capacity >= 1),
  current_occupancy INT NOT NULL DEFAULT 0 CHECK (current_occupancy >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  available_from DATE,
  gender_restriction TEXT NOT NULL DEFAULT 'any' CHECK (gender_restriction IN ('male','female','any')),
  floor_number INT,
  description TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT units_occupancy_cap CHECK (current_occupancy <= total_capacity)
);

-- SECTION 8: VIEWING_SLOTS
CREATE TABLE public.viewing_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES public.profiles(id),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_viewers INT NOT NULL DEFAULT 1 CHECK (max_viewers >= 1),
  current_viewers INT NOT NULL DEFAULT 0 CHECK (current_viewers >= 0),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','full','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT slots_time_order CHECK (start_time < end_time),
  CONSTRAINT slots_viewers_cap CHECK (current_viewers <= max_viewers),
  UNIQUE (property_id, slot_date, start_time)
);

-- SECTION 9: VIEWING_BOOKINGS
CREATE TABLE public.viewing_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.viewing_slots(id) ON DELETE RESTRICT,
  renter_id UUID NOT NULL REFERENCES public.profiles(id),
  property_id UUID NOT NULL REFERENCES public.properties(id),
  unit_id UUID REFERENCES public.units(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN
    ('pending','confirmed','declined','cancelled_by_renter',
     'cancelled_by_landlord','completed','no_show')),
  cancellation_reason TEXT,
  is_late_cancellation BOOLEAN NOT NULL DEFAULT false,
  renter_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (renter_id, slot_id)
);

-- SECTION 10: INDEXES
CREATE INDEX idx_properties_landlord ON public.properties(landlord_id);
CREATE INDEX idx_properties_status ON public.properties(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_units_property ON public.units(property_id);
CREATE INDEX idx_units_available ON public.units(property_id, is_available);
CREATE INDEX idx_slots_lookup ON public.viewing_slots(property_id, slot_date, status);
CREATE INDEX idx_bookings_renter ON public.viewing_bookings(renter_id, status);
CREATE INDEX idx_bookings_slot ON public.viewing_bookings(slot_id, status);

-- SECTION 11: ATOMIC SLOT CLAIM RPC
CREATE OR REPLACE FUNCTION public.claim_viewing_slot(p_slot_id UUID)
RETURNS boolean AS $$
DECLARE
  v_current_viewers int;
  v_max_viewers int;
BEGIN
  -- Acquire row-level lock
  SELECT current_viewers, max_viewers
  INTO v_current_viewers, v_max_viewers
  FROM public.viewing_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND OR v_current_viewers >= v_max_viewers THEN
    RETURN FALSE;
  END IF;

  UPDATE public.viewing_slots
  SET 
    current_viewers = current_viewers + 1,
    status = CASE WHEN current_viewers + 1 = max_viewers THEN 'full' ELSE status END
  WHERE id = p_slot_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SECTION 12: ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_bookings ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Properties Policies
CREATE POLICY "Published properties are viewable by everyone." ON public.properties
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Landlords can see all their own properties." ON public.properties
  FOR SELECT USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert their own properties." ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update their own properties." ON public.properties
  FOR UPDATE USING (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete their own properties." ON public.properties
  FOR DELETE USING (auth.uid() = landlord_id);

-- Units Policies
CREATE POLICY "Units are viewable if property is published or user is landlord." ON public.units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = units.property_id 
      AND (properties.status = 'published' OR properties.landlord_id = auth.uid())
    )
  );

CREATE POLICY "Landlords can manage units for their properties." ON public.units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = units.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

-- Viewing Slots Policies
CREATE POLICY "Available slots are viewable by everyone." ON public.viewing_slots
  FOR SELECT USING (status = 'available' OR auth.uid() = landlord_id);

CREATE POLICY "Landlords can insert viewing slots." ON public.viewing_slots
  FOR INSERT WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can update or delete their slots." ON public.viewing_slots
  FOR ALL USING (auth.uid() = landlord_id);

-- Viewing Bookings Policies
CREATE POLICY "Users can see their own bookings and landlords can see bookings for their properties." ON public.viewing_bookings
  FOR SELECT USING (
    auth.uid() = renter_id OR 
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = viewing_bookings.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can book a slot." ON public.viewing_bookings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = renter_id);

CREATE POLICY "Renters can cancel own or landlords can manage bookings." ON public.viewing_bookings
  FOR UPDATE USING (
    auth.uid() = renter_id OR 
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = viewing_bookings.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

-- Amenities Policies
CREATE POLICY "Amenities are viewable by everyone." ON public.amenities
  FOR SELECT USING (true);

-- Property Amenities Policies
CREATE POLICY "Property amenities are viewable by everyone." ON public.property_amenities
  FOR SELECT USING (true);

CREATE POLICY "Landlords can manage amenities for their properties." ON public.property_amenities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties 
      WHERE properties.id = property_amenities.property_id 
      AND properties.landlord_id = auth.uid()
    )
  );

-- SECTION 13: SEED DATA
INSERT INTO public.amenities (name, icon) VALUES
  ('WiFi', 'wifi'),
  ('Water Included', 'droplets'),
  ('Security Guard', 'shield'),
  ('CCTV', 'camera'),
  ('On-Site Parking', 'car');
