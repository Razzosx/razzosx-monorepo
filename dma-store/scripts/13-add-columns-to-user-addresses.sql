-- Adicionar colunas necessárias à tabela user_addresses
ALTER TABLE IF EXISTS public.user_addresses 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS mobile TEXT;

-- Comentários para as novas colunas
COMMENT ON COLUMN public.user_addresses.full_name IS 'Nome completo associado ao endereço';
COMMENT ON COLUMN public.user_addresses.email IS 'Email associado ao endereço';
COMMENT ON COLUMN public.user_addresses.mobile IS 'Número de telefone móvel associado ao endereço';

-- Atualizar as políticas RLS para incluir as novas colunas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios endereços" ON public.user_addresses;
CREATE POLICY "Usuários podem ver seus próprios endereços" 
ON public.user_addresses FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem inserir seus próprios endereços" ON public.user_addresses;
CREATE POLICY "Usuários podem inserir seus próprios endereços" 
ON public.user_addresses FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios endereços" ON public.user_addresses;
CREATE POLICY "Usuários podem atualizar seus próprios endereços" 
ON public.user_addresses FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem excluir seus próprios endereços" ON public.user_addresses;
CREATE POLICY "Usuários podem excluir seus próprios endereços" 
ON public.user_addresses FOR DELETE 
USING (auth.uid() = user_id);

-- Administradores podem ver todos os endereços
DROP POLICY IF EXISTS "Administradores podem ver todos os endereços" ON public.user_addresses;
CREATE POLICY "Administradores podem ver todos os endereços" 
ON public.user_addresses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.is_admin = true
  )
);
