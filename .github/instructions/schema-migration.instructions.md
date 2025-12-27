# GitTrends Schema Migration Instructions

## 1. Visão Geral

Este documento orienta o processo de migração do esquema do GitTrends core quando há atualizações na API GraphQL do GitHub.

**Documentação relacionada**:
- [architecture.instructions.md](./architecture.instructions.md) - Entenda a arquitetura do sistema, componentes e fluxo de dados

## 2. Processo de Migração

### 2.1. Pré-requisitos

Antes de iniciar qualquer migração:

- [ ] Verificar `schemaRevision` atual em `package.json` (seção `gittrends.schemaRevision`)
- [ ] Garantir que todos os testes passam: `npm test`
- [ ] Garantir que o build está funcionando: `npm run build`
- [ ] Criar branch específica para migração: `git checkout -b feat/schema-YYYY-MM-DD`
- [ ] Não ter mudanças não commitadas no repositório

### 2.2. Identificar Mudanças

1. Acesse o [changelog da API GraphQL do GitHub](https://docs.github.com/pt/graphql/overview/changelog)

2. Identifique mudanças desde a última revisão aplicada:
   ```bash
   # Verificar revisão atual
   cat package.json | grep schemaRevision
   # Resultado exemplo: "schemaRevision": "2024-06-25"
   ```

3. Liste todas as revisões entre a data atual e a próxima a aplicar:
   - Exemplo: Se `schemaRevision` é `2024-06-25`, procure por `Schema changes for 2024-07-01`, depois `2024-07-15`, etc.
   - **Importante**: Aplique revisões em ordem cronológica (da mais antiga para a mais recente)

4. Para cada revisão, registre:
   - Campos/tipos removidos
   - Campos/tipos adicionados
   - Campos/tipos modificados
   - Campos/tipos deprecados (mas ainda disponíveis)

### 2.3. Analisar Impacto

Para cada mudança identificada, mapeie os arquivos afetados:

| Tipo de Mudança | Arquivos Afetados | Ordem de Atualização |
|-----------------|-------------------|----------------------|
| Campo removido | Fragment → Entity → Lookup (se necessário) | 1. Fragment, 2. Entity, 3. Lookup |
| Campo adicionado | Entity → Fragment → Lookup (opcional) | 1. Entity, 2. Fragment, 3. Lookup |
| Campo renomeado | Fragment → Entity → Lookup → Resources | 1. Fragment, 2. Entity, 3. Lookup, 4. Resources |
| Tipo removido | Entity → Fragment → Lookup → Resources | Todos simultaneamente |
| Tipo adicionado | Entity → Fragment (opcional) | Conforme necessidade |
| Campo mudou tipo | Entity → Fragment (validar) | 1. Fragment (garantir compatibilidade), 2. Entity |

**Ferramentas úteis para buscar impacto**:
```bash
# Buscar onde um campo é usado
grep -r "stateReason" src/

# Buscar em fragments especificamente
grep -r "stateReason" src/services/github/graphql/fragments/

# Buscar em entities
grep -r "state_reason" src/entities/
```

### 2.4. Implementar Mudanças

**Importante**: Consulte [architecture.instructions.md](./architecture.instructions.md) para entender o relacionamento entre Entity, Fragment, Lookup e Resource.

#### 2.4.1. Remoção de Campos

**Exemplo**: Remover campo `stateReason` de `ClosedEvent`

**ANTES**:
```ton ClosedEvent {
  __typename
  crea4. Implementar Mudanças

#### 2tedAt
  stateReason  // ← Será removido
}

// src/entities/TimelineItem.ts
const ClosedEventSchema = z.object({
  __typename: z.literal('ClosedEvent'),
  created_at: z.coerce.date(),
  state_reason: z.string()  // ← Será removido
});
```

**DEPOIS**:
```typescript
// src/services/github/graphql/fragments/TimelineItemFragment.ts
... on ClosedEvent {
  __typename
  createdAt
  // stateReason removido
}

// src/entities/TimelineItem.ts
const ClosedEventSchema = z.object({
  __typename: z.literal('ClosedEvent'),
  created_at: z.coerce.date()
  // state_reason removido
});
```

#### 2.4.2. Adição de Campos

**Exemplo**: Adicionar campo `duplicateOf` ao tipo `Issue`

**Passos**:

1. **Consultar documentação**:
   - Schema oficial: https://docs.github.com/public/fpt/schema.docs.graphql
   - Manual de referência: https://docs.github.com/pt/graphql/reference/objects#issue
   - Verificar tipo do campo, se é obrigatório, descrição, etc.

2. **Avaliar relevância**:
   - O campo é útil para os casos de uso do GitTrends?
   - Adiciona valor significativo?
   - Se sim, prosseguir; se não, documentar decisão de não incluir
   - *Importante:* 
      - Ignore todos os campos inciados com viewer* (e.g., viewerCan*)
      - Verifique se já existe um campo similar


3. **Implementar** (se relevante):

```typescript
// 1. ENTITY (src/entities/Issue.ts)
const baseIssue = NodeSchema.extend({
  __typename: z.literal('Issue'),
  // ... campos existentes
  duplicate_of: z.string().optional(),  // ← Novo campo
});

// 2. FRAGMENT (src/services/github/graphql/fragments/IssueFragment.ts)
fragment ${this.alias} on Issue {
  __typename
  // ... campos existentes
  duplicateOf { id }  // ← Novo campo
}

// 3. LOOKUP (geralmente não precisa mudar)
// IssuesLookup.ts continua igual, usa o fragment atualizado
```

#### 2.4.3. Renomeação de Campos

**Exemplo**: Campo `assignees` renomeado para `assignedActors`

**Importante**: Durante período de transição, ambos podem existir. Verifique a data de remoção efetiva.

```typescript
// OPÇÃO 1: Usar novo nome imediatamente (se o antigo será removido em breve)
// Fragment
assignedActors(first: 100) { nodes { ...ActorFrag } }

// Entity
assigned_actors: z.array(ActorSchema).optional()

// OPÇÃO 2: Suportar ambos temporariamente (se há tempo de transição)
// Fragment
assignees(first: 100) { nodes { ...ActorFrag } }
assignedActors(first: 100) { nodes { ...ActorFrag } }

// Entity - usar transform para unificar
assigned_actors: z.array(ActorSchema).optional()
// Lógica de parsing no Fragment para usar assignedActors se disponível, senão assignees
```

#### 2.4.4. Mudança de Tipo

**Exemplo**: Campo `state` muda de `String` para `IssueState` (enum)

```typescript
// ANTES
state: z.string()

// DEPOIS - Mais específico
state: z.enum(['OPEN', 'CLOSED'])

// OU - Se quiser manter compatibilidade
state: z.union([z.string(), z.enum(['OPEN', 'CLOSED'])])
```

#### 2.4.5. Remoção de Tipos

**Exemplo**: Tipo `BotOrUser` foi removido

1. Buscar todas as ocorrências:
   ```bash
   grep -r "BotOrUser" src/
   ```

2. Analisar o que substituiu (consultar changelog)

3. Atualizar entities, fragments e lookups conforme necessário

### 2.5. Validação

Após cada mudança, execute a validação completa:

```bash
# 1. Lint
npm run lint

# 2. Build
npm run build

# 3. Testes
npm test

# 4. Testes com cobertura (opcional, mais demorado)
npm run test:coverage
```

**Checklist de Validação**:
- [ ] Código compila sem erros TypeScript
- [ ] Todos os testes passam
- [ ] Lint passa sem erros
- [ ] Build gera arquivos em `dist/`
- [ ] Tipos exportados estão corretos (`dist/index.d.ts`)
- [ ] Não há breaking changes não documentadas

### 2.6. Documentação

1. **Atualizar `schemaRevision`** em `package.json`:
   ```json
   {
     "gittrends": {
       "schemaRevision": "2024-07-15"  // Data da revisão aplicada
     }
   }
   ```

2. **Reportar decisões**:
   - Se optou por NÃO adicionar um campo disponível, documente o porquê
   - Se manteve compatibilidade temporária, documente até quando

## 3. Casos Especiais

### 3.1. Campos Deprecados (mas não removidos)

Quando um campo é marcado como deprecated mas ainda funciona:

1. **Avalie a data de remoção efetiva**: 
   - Se > 6 meses: pode manter por enquanto
   - Se < 6 meses: migre imediatamente

2. **Adicione comentário no código**:
   ```typescript
   // @deprecated Will be removed on 2024-12-01. Use `newField` instead.
   old_field: z.string().optional()
   ```

3. **Planeje migração futura**: Adicione issue no GitHub

### 3.2. Breaking Changes (Mudanças Incompatíveis)

Se a mudança quebra compatibilidade com código existente:

1. **Avaliar impacto**: Quem usa esse campo?
2. **Versionar adequadamente**: 
   - Patch (1.0.x): Apenas correções
   - Minor (1.x.0): Adições compatíveis
   - Major (x.0.0): Breaking changes

3. **Documentar claramente** no CHANGELOG e README

4. **Considerar período de transição**: Suportar ambas as versões temporariamente

### 3.3. Campos Opcionais vs Obrigatórios

```typescript
// Sempre confira na documentação oficial se o campo é nullable

// Campo obrigatório
name: z.string()

// Campo opcional (pode ser null/undefined)
description: z.string().optional()

// Campo nullable (pode ser explicitamente null)
locked_reason: z.string().nullable()

// Campo opcional E nullable
license: z.string().optional().nullable()
```

### 3.4. Mudanças em Campos Aninhados

**Exemplo**: `repository.owner` mudou de `User` para `Actor`

```typescript
// ANTES
owner: z.object({
  login: z.string(),
  email: z.string()  // Apenas User tem email
})

// DEPOIS
owner: ActorSchema  // Actor é union de User | Organization
// Email pode não existir se for Organization
```

Buscar e atualizar todos os usos de `repository.owner.email` no código.

## 4. Workflow Completo

### Exemplo: Migração da revisão 2024-07-01

```bash
# 1. Preparação
git checkout main
git pull
git checkout -b feat/schema-2024-07-01
cat package.json | grep schemaRevision  # Confirmar versão atual

# 2. Pesquisa
# Abrir: https://docs.github.com/pt/graphql/overview/changelog
# Procurar: "Schema changes for 2024-07-01"
# Listar mudanças em documento/comentário

# 3. Análise
# Para cada mudança, identificar arquivos impactados
grep -r "campoAfetado" src/

# 4. Implementação
# Editar arquivos na ordem: Fragment → Entity → Lookup

# 5. Validação (após cada mudança)
npm run lint && npm run build && npm test

# 6. Documentação
# Atualizar package.json schemaRevision
# Atualizar CHANGELOG.md

# 7. Commit
git add .
git commit -m "feat: update schema to 2024-07-01 revision"
git push origin feat/schema-2024-07-01

# 8. Pull Request
# Criar PR com descrição detalhada das mudanças
```

## 5. Troubleshooting

### Problema: Testes falhando após mudança

**Sintoma**: `npm test` falha com erro de validação Zod

**Solução**:
1. Verificar se o fragment retorna os campos esperados
2. Verificar se o schema Zod está sincronizado com fragment
3. Usar `console.log(data)` no método `parse()` para ver estrutura real
4. Confirmar na documentação oficial o formato correto

### Problema: Build falha com erro TypeScript

**Sintoma**: Tipo não encontrado ou incompatível

**Solução**:
1. Verificar se todos os imports estão corretos
2. Regenerar schema TypeScript: `npm run generate:schema`
3. Verificar se `graphql-schema.d.ts` está atualizado
4. Limpar build: `npm run build:clean && npm run build`

### Problema: Campo retorna null inesperadamente

**Sintoma**: Runtime error ou validation error

**Solução**:
1. Confirmar na API oficial se o campo pode ser null
2. Atualizar schema para `.optional()` ou `.nullable()`
3. Adicionar tratamento de null no código consumidor

### Problema: Mudança não aparece na query

**Sintoma**: Fragment atualizado mas API retorna dados antigos

**Solução**:
1. Verificar se o fragment está sendo usado no lookup correto
2. Verificar cache (se usando CacheService)
3. Imprimir query gerada: `console.log(lookup.toString())`
4. Testar query diretamente no [GraphQL Explorer](https://docs.github.com/pt/graphql/overview/explorer)

## 7. Checklist Final

Antes de considerar a migração completa:

- [ ] Todas as mudanças da revisão foram aplicadas
- [ ] `schemaRevision` atualizado em `package.json`
- [ ] `CHANGELOG.md` documentado
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` completa com sucesso
- [ ] `npm test` passa 100%
- [ ] Testes manuais executados nas áreas afetadas
- [ ] Breaking changes documentados (se houver)
- [ ] PR criado com descrição detalhada
- [ ] Código revisado por outro desenvolvedor
- [ ] Aprovação recebida antes do merge

## 8. Recursos e Referências

- [GitHub GraphQL API Changelog](https://docs.github.com/pt/graphql/overview/changelog)
- [GitHub GraphQL Schema](https://docs.github.com/public/fpt/schema.docs.graphql)
- [GitHub GraphQL Reference](https://docs.github.com/pt/graphql/reference/objects)
- [GitHub GraphQL Explorer](https://docs.github.com/pt/graphql/overview/explorer) - Para testar queries
- [Zod Documentation](https://zod.dev/) - Para schemas de validação
- [Semantic Versioning](https://semver.org/) - Para versionamento

## 9. Notas Importantes

1. **Sempre aplique revisões em ordem cronológica** - Mudanças podem depender de alterações anteriores

2. **Uma revisão por vez** - Não misture múltiplas revisões em um único PR

3. **Teste extensivamente** - Mudanças no schema podem ter efeitos em cascata

4. **Documente decisões** - Especialmente quando opta por NÃO adicionar um campo disponível

5. **Consulte a equipe** - Em caso de dúvida sobre impacto ou abordagem, discuta antes de implementar

6. **Mantenha compatibilidade quando possível** - Use campos deprecated por algum tempo antes de removê-los

7. **Priorize estabilidade** - Em caso de dúvida, seja conservador nas mudanças
