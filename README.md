# Amigo Secreto Fraudes

Aplicação Next.js + Supabase para criar grupos de amigo secreto, cadastrar participantes, respeitar restrições de casais e entregar resultados por links individuais.

## Requisitos
- Node.js 18+
- Projeto Supabase
- Variáveis de ambiente configuradas (veja `.env.example`)

## Configuração local
1. Instale as dependências: `npm install`.
2. Copie `.env.example` para `.env.local`.
3. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os valores do projeto Supabase.
4. Preencha `SUPABASE_SERVICE_ROLE_KEY` com a chave secreta do Supabase. **Nunca use o prefixo `NEXT_PUBLIC_` nessa chave e nunca a envie ao GitHub.**
5. Execute no SQL Editor do Supabase, nesta ordem, os arquivos em `supabase/migrations/` que ainda não foram executados. Para uma instalação já existente, execute especialmente `20261125160000_secure_private_draw.sql`.
6. Rode `npm run dev` e acesse `http://localhost:3000`.

## Regras do sorteio
- Entre 3 e 20 participantes.
- Ninguém tira a si próprio.
- Cada pessoa é sorteada exatamente uma vez.
- Casais são cadastrados vinculando um ao outro no campo “Não pode tirar”; a restrição é recíproca.
- O sorteio usa aleatoriedade criptográfica e procura uma combinação válida. Se as restrições tornarem o sorteio impossível, informa o problema em vez de gerar resultado inválido.

## Segurança
- A chave `service_role` é usada somente nas rotas de servidor.
- Os links individuais usam tokens aleatórios de 256 bits; somente o hash SHA-256 é armazenado no banco.
- O navegador não consulta diretamente a tabela `assignments`.
- A migration de segurança remove permissões públicas e políticas abertas.
- Nesta versão, o organizador recebe a lista de links para compartilhamento manual e, portanto, tecnicamente pode abrir os resultados. Para impedir isso, é necessário enviar os links diretamente aos participantes por um provedor de e-mail/WhatsApp sem exibi-los ao organizador.

## Compartilhamento
Os botões de WhatsApp abrem uma mensagem pronta. O botão de e-mail abre um rascunho no aplicativo de e-mail; nenhum e-mail é enviado automaticamente.


## Importar e reutilizar participantes

Na etapa **Quem participa?**, é possível importar um arquivo CSV com as colunas `Nome`, `Telefone`, `E-mail` e `Casal`. O importador aceita separador ponto e vírgula ou vírgula, preserva telefones como texto e valida nomes duplicados, e-mails e vínculos de casal. Para bloquear o sorteio entre duas pessoas, informe o nome do parceiro na coluna `Casal` nos dois registros (por exemplo, Anna → Geison e Geison → Anna).

Também é possível salvar a lista como **lista-base** e reutilizá-la no mesmo navegador. Essa lista fica no armazenamento local do navegador daquele dispositivo; não é enviada ao Supabase nem sincronizada entre dispositivos. Como contém dados pessoais, use essa opção apenas em um dispositivo confiável e apague os dados do navegador se deixar de utilizá-lo.
