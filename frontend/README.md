# Nest Q&A — Frontend

Frontend em React (Vite) para consumir a API [nest-qa-api-and-jest](../).

## Rodando

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

## Pré-requisitos

- O backend precisa estar rodando em `http://localhost:3000` (ver README do backend).
- O backend precisa ter CORS liberado para `http://localhost:5173`:

```ts
// main.ts, no backend
app.enableCors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true,
});
```

## O que tem

- Login / cadastro (JWT salvo no localStorage)
- Listagem de perguntas, paginada
- Criar pergunta
- Ver pergunta com respostas
- Responder pergunta
- Editar/excluir pergunta ou resposta — só aparece para quem é dono (o backend também valida isso)

## Estrutura

```
src/
  api.js                 -> todas as chamadas HTTP para o backend
  context/AuthContext.jsx -> guarda o token e decodifica o usuário logado
  pages/                  -> uma página por rota
  App.jsx                 -> rotas + header
```

Se mudar a URL do backend, ajusta a constante `API_URL` no topo de `src/api.js`.
