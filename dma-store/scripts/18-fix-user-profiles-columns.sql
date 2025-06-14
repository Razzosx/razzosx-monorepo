-- Verificar si la tabla user_profiles existe
DO $$
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles'
    ) THEN
        -- Verificar y añadir la columna first_name si no existe
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles' 
            AND column_name = 'first_name'
        ) THEN
            ALTER TABLE public.user_profiles ADD COLUMN first_name TEXT;
            RAISE NOTICE 'Columna first_name añadida a la tabla user_profiles';
        ELSE
            RAISE NOTICE 'La columna first_name ya existe en la tabla user_profiles';
        END IF;

        -- Verificar y añadir la columna last_name si no existe
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles' 
            AND column_name = 'last_name'
        ) THEN
            ALTER TABLE public.user_profiles ADD COLUMN last_name TEXT;
            RAISE NOTICE 'Columna last_name añadida a la tabla user_profiles';
        ELSE
            RAISE NOTICE 'La columna last_name ya existe en la tabla user_profiles';
        END IF;

        -- Verificar y añadir la columna phone si no existe
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'user_profiles' 
            AND column_name = 'phone'
        ) THEN
            ALTER TABLE public.user_profiles ADD COLUMN phone TEXT;
            RAISE NOTICE 'Columna phone añadida a la tabla user_profiles';
        ELSE
            RAISE NOTICE 'La columna phone ya existe en la tabla user_profiles';
        END IF;

        -- Forzar actualización del caché del esquema
        PERFORM pg_notify('pgrst', 'reload schema');
        RAISE NOTICE 'Caché del esquema actualizado';
    ELSE
        -- Crear la tabla user_profiles si no existe
        CREATE TABLE public.user_profiles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name TEXT,
            last_name TEXT,
            phone TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Habilitar RLS para la tabla
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

        -- Crear políticas RLS básicas
        CREATE POLICY "Users can read their own profile"
            ON public.user_profiles
            FOR SELECT
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can update their own profile"
            ON public.user_profiles
            FOR UPDATE
            USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own profile"
            ON public.user_profiles
            FOR INSERT
            WITH CHECK (auth.uid() = user_id);

        -- Forzar actualización del caché del esquema
        PERFORM pg_notify('pgrst', 'reload schema');
        RAISE NOTICE 'Tabla user_profiles creada con todas las columnas necesarias';
    END IF;

    -- Verificar la estructura de la tabla después de las modificaciones
    RAISE NOTICE 'Estructura actual de la tabla user_profiles:';
    FOR r IN (
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
        ORDER BY ordinal_position
    ) LOOP
        RAISE NOTICE '% - %', r.column_name, r.data_type;
    END LOOP;
END $$;

-- Verificar las políticas de seguridad
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';
