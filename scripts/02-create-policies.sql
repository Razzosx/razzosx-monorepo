-- Políticas de segurança (RLS) para DMA Store
-- Este script configura as permissões de acesso às tabelas

-- Políticas para tabela users
-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Políticas para tabela products
-- Qualquer pessoa pode ver produtos ativos
CREATE POLICY "Anyone can view active products" 
  ON public.products FOR SELECT 
  USING (active = true);

-- Apenas administradores podem gerenciar produtos
CREATE POLICY "Admins can manage products" 
  ON public.products FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Políticas para tabela orders
-- Usuários podem ver apenas seus próprios pedidos
CREATE POLICY "Users can view own orders" 
  ON public.orders FOR SELECT 
  USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios pedidos
CREATE POLICY "Users can create own orders" 
  ON public.orders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Administradores podem ver todos os pedidos
CREATE POLICY "Admins can view all orders" 
  ON public.orders FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Administradores podem atualizar pedidos
CREATE POLICY "Admins can update orders" 
  ON public.orders FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
