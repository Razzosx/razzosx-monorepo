-- Dados iniciais para DMA Store
-- Este script insere produtos de exemplo no banco de dados

-- Inserir produtos de exemplo
INSERT INTO public.products (name, description, price, image_url, active) VALUES
('Curso de Marketing Digital', 'Aprenda as melhores estratégias de marketing digital para alavancar seu negócio online. Este curso completo aborda SEO, redes sociais, email marketing e muito mais.', 197.00, '/placeholder.svg?height=300&width=400&text=Marketing+Digital', true),
('E-book: Vendas Online', 'Guia completo para dominar as vendas na internet e aumentar sua conversão. Descubra técnicas avançadas de copywriting e psicologia de vendas.', 47.00, '/placeholder.svg?height=300&width=400&text=E-book+Vendas', true),
('Template de Landing Page', 'Pack com 10 templates profissionais de landing pages para alta conversão. Inclui designs para diferentes nichos e modelos de negócio.', 97.00, '/placeholder.svg?height=300&width=400&text=Landing+Pages', true),
('Curso de Copywriting', 'Domine a arte da escrita persuasiva e aumente suas vendas com copy irresistível. Aprenda a criar headlines que convertem e textos que vendem.', 297.00, '/placeholder.svg?height=300&width=400&text=Copywriting', true),
('Planilha de Gestão Financeira', 'Controle completo das suas finanças pessoais e empresariais. Inclui dashboard, controle de despesas, receitas e projeções financeiras.', 27.00, '/placeholder.svg?height=300&width=400&text=Planilha+Financeira', true);

-- Nota: Para criar um usuário admin, primeiro crie uma conta normal pelo sistema
-- e depois execute o comando abaixo substituindo o email pelo seu:
-- UPDATE public.users SET is_admin = true WHERE email = 'seu-email@exemplo.com';
