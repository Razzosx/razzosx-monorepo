-- Verifica se a coluna 'stock' existe na tabela 'products'
DO $$
BEGIN
    -- Verifica se a coluna 'stock' já existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'products'
        AND column_name = 'stock'
    ) THEN
        -- Adiciona a coluna 'stock' se ela não existir
        ALTER TABLE products ADD COLUMN stock INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna stock adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna stock já existe';
    END IF;
    
    -- Força uma atualização do cache do esquema
    PERFORM pg_notify('pgrst', 'reload schema');
END $$;

-- Verifica a estrutura da tabela após as alterações
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products';

-- Insere um produto de teste se a tabela estiver vazia
INSERT INTO products (name, description, price, stock, active)
SELECT 'Produto Teste', 'Descrição do produto teste', 19.99, 10, true
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);
