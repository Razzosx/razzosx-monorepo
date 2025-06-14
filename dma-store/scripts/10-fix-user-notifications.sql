-- Criar tabela de notificações do usuário se não existir
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(read);
CREATE INDEX IF NOT EXISTS idx_user_notifications_created_at ON user_notifications(created_at DESC);

-- Habilitar RLS para a tabela
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Permitir que usuários vejam suas próprias notificações
CREATE POLICY "Users can read their own notifications"
  ON user_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permitir que usuários atualizem suas próprias notificações
CREATE POLICY "Users can update their own notifications"
  ON user_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Permitir que administradores insiram notificações para usuários
CREATE POLICY "Admins can insert user notifications"
  ON user_notifications
  FOR INSERT
  WITH CHECK ((SELECT is_admin FROM users WHERE id = auth.uid()));

-- Permitir que administradores vejam todas as notificações
CREATE POLICY "Admins can read all user notifications"
  ON user_notifications
  FOR SELECT
  USING ((SELECT is_admin FROM users WHERE id = auth.uid()));
