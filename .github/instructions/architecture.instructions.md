# GitTrends Core - Arquitetura do Sistema

## 1. Visão Geral

GitTrends core é um pacote TypeScript para coletar dados da API GraphQL do GitHub. Embora a API GraphQL permita consultas dinâmicas, o GitTrends core usa um esquema fortemente tipado para garantir validade das consultas e formato dos dados retornados.

## 2. Componentes Principais

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────┐
│   Entity    │ ←── │   Fragment   │ ←── │   Lookup    │ ←── │ Resource │
│  (Zod Schema)│     │  (GraphQL)   │     │  (Query)    │     │ (Service)│
└─────────────┘     └──────────────┘     └─────────────┘     └──────────┘
```

### 2.1. Entities (`src/entities/`)

Schemas Zod que definem tipos e validações dos dados retornados pela API do GitHub.

- **Localização**: `src/entities/`
- **Tecnologia**: Zod (validação e type inference)
- **Responsabilidade**: Definir estrutura, tipos e validações dos dados
- **Exemplo**: `Issue.ts`, `PullRequest.ts`, `Repository.ts`

### 2.2. Fragments (`src/services/github/graphql/fragments/`)

Fragmentos GraphQL reutilizáveis que definem quais campos buscar da API.

- **Localização**: `src/services/github/graphql/fragments/`
- **Tecnologia**: GraphQL Fragment Syntax
- **Responsabilidade**: Especificar campos a serem retornados pela API
- **Exemplo**: `IssueFragment.ts`, `PullRequestFragment.ts`

### 2.3. Lookups (`src/services/github/graphql/lookups/`)

Queries GraphQL completas que utilizam os fragments.

- **Localização**: `src/services/github/graphql/lookups/`
- **Tecnologia**: GraphQL Query Syntax
- **Responsabilidade**: Construir queries completas com paginação e filtros
- **Exemplo**: `IssuesLookup.ts`, `PullRequestsLookup.ts`

### 2.4. Resources (`src/services/github/resources/`)

Funções de alto nível que encapsulam a lógica de negócio.

- **Localização**: `src/services/github/resources/`
- **Responsabilidade**: Abstrair complexidade, fornecer API amigável
- **Exemplo**: `getIssues()`, `getPullRequests()`

### 2.5. Services (`src/services/`)

Abstrações com padrão decorator para logging, retry, cache, etc.

- **Localização**: `src/services/`
- **Responsabilidade**: Adicionar comportamentos transversais (logging, retry, cache)
- **Padrões**: Decorator pattern

## 3. Fluxo de Dados

### 3.1. Fluxo Completo

```typescript
// 1. ENTITY - Define o schema (src/entities/Issue.ts)
const baseIssue = NodeSchema.extend({
  number: z.number(),
  title: z.string(),
  body: z.string().optional(),
  state: z.string(),
  // ...
});

// 2. FRAGMENT - Define campos GraphQL (src/services/github/graphql/fragments/IssueFragment.ts)
toString(): string {
  return `
    fragment ${this.alias} on Issue {
      number
      title
      body
      state
    }
  `;
}

// 3. LOOKUP - Constrói query (src/services/github/graphql/lookups/IssuesLookup.ts)
toString(): string {
  return `
    query GetIssues($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) {
        issues(first: 100) {
          nodes { ...IssueFrag }
        }
      }
    }
  `;
}

parse(data: any) {
  return baseIssue.parse(data); // Valida com Zod
}
```

### 3.2. Diagrama de Sequência

```
Cliente → Resource → Lookup → GitHub API
                        ↓
                   Fragment (define campos)
                        ↓
                   Response (JSON)
                        ↓
                   Entity (valida)
                        ↓
                   Cliente (dados tipados)
```

### 3.3. Relacionamento entre Componentes

```typescript
// Entity (Issue.ts) - Define o contrato de dados
export const IssueSchema = z.object({
  number: z.number(),
  title: z.string(),
  // ...
});

export type Issue = z.infer<typeof IssueSchema>;

// Fragment (IssueFragment.ts) - Implementa a query GraphQL
export class IssueFragment {
  toString(): string {
    return `fragment IssueData on Issue { number title }`;
  }
}

// Lookup (IssuesLookup.ts) - Usa o fragment e valida com entity
export class IssuesLookup {
  private fragment = new IssueFragment();
  
  toString(): string {
    return `query { issues { ...IssueData } } ${this.fragment}`;
  }
  
  parse(data: any): Issue {
    return IssueSchema.parse(data); // Validação em runtime
  }
}

// Resource (getIssues.ts) - API pública
export async function getIssues(params: IssueParams): Promise<Issue[]> {
  const lookup = new IssuesLookup(params);
  const response = await githubClient.query(lookup.toString());
  return lookup.parse(response);
}
```

## 4. Convenções de Nomenclatura

### 4.1. Mapeamento GraphQL → TypeScript

O GitTrends segue convenções específicas para nomear campos:

```typescript
// GraphQL (camelCase) → TypeScript (snake_case)
{
  createdAt → created_at
  updatedAt → updated_at
  closedAt → closed_at
  mergedAt → merged_at
  stateReason → state_reason
  assignedActors → assigned_actors
}
```

### 4.2. Estrutura de Arquivos

```
src/
├── entities/           # Schemas Zod (snake_case nos campos)
│   ├── Issue.ts
│   ├── PullRequest.ts
│   └── Repository.ts
├── services/
│   └── github/
│       ├── graphql/
│       │   ├── fragments/  # Fragments GraphQL (camelCase)
│       │   │   ├── IssueFragment.ts
│       │   │   └── PullRequestFragment.ts
│       │   └── lookups/    # Queries GraphQL completas
│       │       ├── IssuesLookup.ts
│       │       └── PullRequestsLookup.ts
│       └── resources/      # APIs públicas
│           ├── getIssues.ts
│           └── getPullRequests.ts
└── index.ts            # Exports públicos
```

## 5. Boas Práticas

### 5.1. Sincronização Fragment ↔ Entity

**Sempre mantenha sincronizado**:
- Campos no Fragment GraphQL (camelCase)
- Campos no Schema Zod (snake_case)

```typescript
// ❌ ERRADO - Fragment busca campo que não está no schema
// IssueFragment.ts
fragment IssueData on Issue {
  createdAt  // ← busca este campo
}

// Issue.ts
export const IssueSchema = z.object({
  // created_at não definido ← validação falhará
});

// ✅ CORRETO - Campos sincronizados
// IssueFragment.ts
fragment IssueData on Issue {
  createdAt
}

// Issue.ts
export const IssueSchema = z.object({
  created_at: z.string()  // ← campo correspondente
});
```

### 5.2. Validação de Dados

Use Zod para validar dados em runtime:

```typescript
// Sempre prefira schemas estritos
const IssueSchema = z.object({
  number: z.number(),        // Obrigatório
  title: z.string(),         // Obrigatório
  body: z.string().optional(), // Opcional (pode estar ausente)
  closedAt: z.string().nullable(), // Nullable (pode ser null)
});

// Evite .passthrough() - use apenas quando necessário
const LooseSchema = z.object({
  // ...
}).passthrough(); // ⚠️ Permite campos extras (menos seguro)
```

### 5.3. Reutilização de Fragments

```typescript
// Reutilize fragments em lookups diferentes
export class IssueFragment {
  toString(): string {
    return `
      fragment IssueData on Issue {
        number
        title
        author { ...ActorData }  // ← Reutiliza ActorFragment
      }
    `;
  }
}

// Lookup usa o fragment
export class IssuesLookup {
  private issueFragment = new IssueFragment();
  private actorFragment = new ActorFragment();
  
  toString(): string {
    return `
      query GetIssues {
        issues { ...IssueData }
      }
      ${this.issueFragment}
      ${this.actorFragment}
    `;
  }
}
```

## 6. Troubleshooting Arquitetural

### Problema: "Campo não encontrado no schema"

**Causa**: Dessincronia entre Fragment (GraphQL) e Entity (Zod)

**Solução**:
1. Verifique se o campo está presente no Fragment
2. Verifique a nomenclatura (camelCase → snake_case)
3. Confirme tipos compatíveis (string, number, boolean, etc.)

### Problema: "Tipos incompatíveis"

**Causa**: Tipo TypeScript inferido não corresponde ao esperado

**Solução**:
1. Verifique o schema Zod da Entity
2. Use `z.infer<typeof Schema>` para inferir tipos
3. Não defina tipos manualmente - deixe Zod inferir

### Problema: "Validação falha em runtime"

**Causa**: Dados retornados pela API não correspondem ao schema

**Solução**:
1. Adicione logging: `console.log(JSON.stringify(data, null, 2))`
2. Compare estrutura real vs esperada
3. Ajuste schema para aceitar nulls/optionals se necessário
4. Consulte documentação oficial da API GraphQL
