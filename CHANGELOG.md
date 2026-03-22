# Registro de alterações

Todas as alterações relevantes deste projeto são documentadas neste arquivo.

O formato segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento semântico](https://semver.org/lang/pt-BR/).

## Fluxo para quem mantém o projeto

- Após cada commit (ou conjunto lógico de mudanças), inclua um item curto em **`[Unreleased]`** descrevendo o que mudou para usuários ou operadores.
- Ao publicar uma versão, mova os itens de `[Unreleased]` para uma nova seção datada (por exemplo `## [0.1.0] - 2025-03-22`) e deixe `[Unreleased]` vazio de novo.
- Opcional: ative o hook de lembrete após `git init` com  
  `git config core.hooksPath .githooks`

## [Unreleased]

### Added

- Adiciona template inicial do projeto de rifa online
- Adiciona `CHANGELOG.md` e hook Git opcional em `.githooks/` para lembrar de atualizar quando houver mudanças em arquivos do app ou dos componentes.

### Changed

- Tipografia do site passa a usar **Roboto** (interface) e **Roboto Mono** (monoespaçada) via `next/font`, aplicadas pelos tokens de tema Tailwind compartilhados `font-sans` / `font-mono`.
