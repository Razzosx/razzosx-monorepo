-- Verifica se a tabela orders existe e adiciona a coluna address_id se necessário
DO $$
BEGIN
    -- Verifica se a tabela orders existe
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'orders'
    ) THEN
        -- Verifica se a coluna address_id NÃO existe na tabela orders
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'address_id'
        ) THEN
            -- Adiciona a coluna address_id
            ALTER TABLE public.orders ADD COLUMN address_id UUID REFERENCES public.addresses(id);
            
            -- Adiciona um índice para melhorar a performance
            CREATE INDEX IF NOT EXISTS idx_orders_address_id ON public.orders(address_id);
            
            RAISE NOTICE 'Coluna address_id adicionada à tabela orders';
        ELSE
            RAISE NOTICE 'Coluna address_id já existe na tabela orders';
        END IF;
        
        -- Verifica se a coluna shipping_address_id existe
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'shipping_address_id'
        ) THEN
            -- Atualiza os registros existentes para usar shipping_address_id como address_id se address_id for nulo
            UPDATE public.orders 
            SET address_id = shipping_address_id 
            WHERE address_id IS NULL AND shipping_address_id IS NOT NULL;
            
            RAISE NOTICE 'Registros atualizados com shipping_address_id';
        END IF;
        
        -- Verifica se a coluna payment_method existe
        IF NOT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_method'
        ) THEN
            -- Adiciona a coluna payment_method
            ALTER TABLE public.orders ADD COLUMN payment_method TEXT;
            RAISE NOTICE 'Coluna payment_method adicionada à tabela orders';
        END IF;
    ELSE
        -- Cria a tabela orders se ela não existir
        CREATE TABLE public.orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            product_id UUID,
            address_id UUID,
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Cria índices para melhorar a performance
        CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
        CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
        CREATE INDEX IF NOT EXISTS idx_orders_address_id ON public.orders(address_id);
        
        -- Configura RLS (Row Level Security)
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        
        -- Política para permitir que usuários vejam apenas seus próprios pedidos
        CREATE POLICY select_own_orders ON public.orders
            FOR SELECT USING (auth.uid() = user_id);
            
        -- Política para permitir que usuários criem seus próprios pedidos
        CREATE POLICY insert_own_orders ON public.orders
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        -- Política para permitir que usuários atualizem apenas seus próprios pedidos
        CREATE POLICY update_own_orders ON public.orders
            FOR UPDATE USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Tabela orders criada com sucesso';
    END IF;
    
    -- Verifica se a tabela user_addresses existe e se a tabela addresses não existe
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'user_addresses'
    ) AND NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'addresses'
    ) THEN
        -- Cria a tabela addresses baseada na user_addresses
        CREATE TABLE public.addresses (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            street TEXT,
            city TEXT,
            state TEXT,
            zip TEXT,
            country TEXT,
            full_name TEXT,
            email TEXT,
            mobile TEXT,
            is_default BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Copia os dados de user_addresses para addresses
        INSERT INTO public.addresses (id, user_id, street, city, state, zip)
        SELECT id, user_id, street, city, state, zip
        FROM public.user_addresses;
        
        -- Configura RLS (Row Level Security)
        ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
        
        -- Política para permitir que usuários vejam apenas seus próprios endereços
        CREATE POLICY select_own_addresses ON public.addresses
            FOR SELECT USING (auth.uid() = user_id);
            
        -- Política para permitir que usuários criem seus próprios endereços
        CREATE POLICY insert_own_addresses ON public.addresses
            FOR INSERT WITH CHECK (auth.uid() = user_id);
            
        -- Política para permitir que usuários atualizem apenas seus próprios endereços
        CREATE POLICY update_own_addresses ON public.addresses
            FOR UPDATE USING (auth.uid() = user_id);
            
        -- Política para permitir que usuários excluam apenas seus próprios endereços
        CREATE POLICY delete_own_addresses ON public.addresses
            FOR DELETE USING (auth.uid() = user_id);
            
        RAISE NOTICE 'Tabela addresses criada e dados migrados de user_addresses';
    END IF;
    
    -- Atualiza as referências de shipping_address_id para address_id nos pedidos existentes
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'shipping_address_id'
    ) AND EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'address_id'
    ) THEN
        UPDATE public.orders 
        SET address_id = shipping_address_id 
        WHERE address_id IS NULL AND shipping_address_id IS NOT NULL;
        
        RAISE NOTICE 'Referências de shipping_address_id atualizadas para address_id';
    END IF;
END$$;
