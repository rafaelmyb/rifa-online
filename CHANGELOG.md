# Registro de alterações

Todas as alterações relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento semântico](https://semver.org/lang/pt-BR/).

## Fluxo para quem mantém o projeto

- Após cada commit (ou conjunto lógico de mudanças), inclua um item curto em **`[Não publicado]`** descrevendo o que mudou para usuários ou operadores.
- Ao publicar uma versão, mova os itens de `[Não publicado]` para uma nova seção datada (por exemplo `## [0.1.0] - 2025-03-22`) e deixe `[Não publicado]` vazio de novo.
- Opcional: ative o hook de lembrete após `git init` com  
  `git config core.hooksPath .githooks`

## [Não publicado]

### Added

- Adiciona template inicial do projeto de rifa online
- Adiciona `CHANGELOG.md` e hook Git opcional em `.githooks/` para lembrar de atualizar quando houver mudanças em arquivos do app ou dos componentes.
- Painel: página **Editar rifa** (`/painel/rifas/[id]/editar`), exclusão com **modal de confirmação** (Radix Alert Dialog) e componente `alert-dialog` em `components/ui`.
- Modelo `Raffle`: campo **`whatsappPhone`** (migração Prisma) e helper `lib/whatsapp-wa-me.ts` para link `https://wa.me/…` (DDI 55 quando aplicável).

### Changed

- Tipografia do site passa a usar **Roboto** (interface) e **Roboto Mono** (monoespaçada) via `next/font`, aplicadas pelos tokens de tema Tailwind compartilhados `font-sans` / `font-mono`.
- Página pós-compra (`obrigado`): ícone de check verde ao lado de “Compra realizada”; chave PIX copiada para a área de transferência ao clicar (com feedback por toast).
- **Rifas:** na criação, o slug da URL é gerado automaticamente a partir do **título** (minúsculas, hífens; sufixo numérico se houver colisão). Coluna **Slug** removida da tabela do painel; ações **Editar** e **Excluir** na listagem.
- **Edição:** atualiza título, chave PIX, **WhatsApp (comprovante)** e status; não altera preço, quantidade de números nem slug. **Publicada → Rascunho** bloqueada no servidor se já existir algum pedido.
- Página **obrigado:** texto do WhatsApp usa o número cadastrado na rifa; quando válido, exibe link para **wa.me** em nova aba. Sem número cadastrado, mensagem orientando o organizador.
- Compra pública: **telefone** com máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX ao digitar; validação por quantidade de dígitos; gravação só com números. Grade: números indisponíveis em **cinza mais escuro**; selecionados em **verde**.
