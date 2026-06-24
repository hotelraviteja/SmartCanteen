-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects for clean schema recreation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.menu_items CASCADE;
DROP TABLE IF EXISTS public.canteens CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;


-- 1. Create Profiles Table (extends Supabase Auth User details)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    student_id TEXT,
    phone TEXT,
    department TEXT DEFAULT 'Computer Science & Engineering',
    academic_year TEXT DEFAULT '3rd Year',
    role TEXT CHECK (role IN ('student', 'owner', 'admin')) DEFAULT 'student',
    canteen_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Helper function to check if a user is an admin without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow individual write access to profiles" ON public.profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Allow admins to manage all profiles" ON public.profiles
    FOR ALL USING (public.is_admin(auth.uid()));

-- 2. Create Canteens Table
CREATE TABLE IF NOT EXISTS public.canteens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Canteens
ALTER TABLE public.canteens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to canteens" ON public.canteens
    FOR SELECT USING (true);

CREATE POLICY "Allow owners to manage their canteens" ON public.canteens
    FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Allow admins to manage all canteens" ON public.canteens
    FOR ALL USING (public.is_admin(auth.uid()));

-- 3. Create Menu Items Table
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canteen_id UUID REFERENCES public.canteens(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    prep_time TEXT NOT NULL,
    rating TEXT DEFAULT '4.5',
    img TEXT DEFAULT '🍔',
    category TEXT NOT NULL,
    is_veg BOOLEAN DEFAULT true,
    desc_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Menu Items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to menu items" ON public.menu_items
    FOR SELECT USING (true);

CREATE POLICY "Allow owners to manage their canteen menu items" ON public.menu_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.canteens 
            WHERE public.canteens.id = public.menu_items.canteen_id 
            AND public.canteens.owner_id = auth.uid()
        )
    );

-- 4. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY, -- We use readable codes e.g. CB-3829
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    canteen_id UUID REFERENCES public.canteens(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('preparing', 'ready', 'collected')) DEFAULT 'preparing',
    total_amount DOUBLE PRECISION NOT NULL,
    items JSONB NOT NULL, -- List of order items
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Students can create orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Canteen Owners can view orders for their canteen" ON public.orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.canteens 
            WHERE public.canteens.id = public.orders.canteen_id 
            AND public.canteens.owner_id = auth.uid()
        )
    );

CREATE POLICY "Canteen Owners can update orders for their canteen" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.canteens 
            WHERE public.canteens.id = public.orders.canteen_id 
            AND public.canteens.owner_id = auth.uid()
        )
    );

-- 5. Trigger profile creation on auth sign up automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, student_id, phone, department, academic_year, role, canteen_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'student_id', ''),
    COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
    COALESCE(new.raw_user_meta_data->>'department', 'Computer Science & Engineering'),
    COALESCE(new.raw_user_meta_data->>'academic_year', '3rd Year'),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'canteen_name'
  );
  
  -- If user is a canteen owner, auto-create their canteen row
  IF (new.raw_user_meta_data->>'role') = 'owner' THEN
    INSERT INTO public.canteens (name, owner_id)
    VALUES (
      COALESCE(new.raw_user_meta_data->>'canteen_name', 'My Canteen'),
      new.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
