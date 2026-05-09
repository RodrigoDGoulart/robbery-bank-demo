# Robbery Bank Slot

Demo de um jogo demonstrativo de caca-niquel desenvolvido em React. O projeto simula uma experiencia basica de slot machine, com interface animada, sorteio de resultados, exibicao de premios e modos de cheat para forcar determinados cenarios durante testes e demonstracoes.

A proposta e apresentar uma base visual e funcional para um jogo de caca-niquel, combinando animacoes em tempo real com regras simples de sorteio e componentes reutilizaveis para rolos, grade, popups de vitoria e controles de jackpot.

## Tecnologias

- **React**: construcao da interface e organizacao dos componentes.
- **TypeScript**: tipagem do codigo da aplicacao.
- **Vite**: ambiente de desenvolvimento e build.
- **PixiJS**: renderizacao grafica de alta performance para elementos animados.
- **@pixi/react**: integracao do PixiJS com React.
- **Spine Pixi**: suporte a animacoes Spine dentro do PixiJS.
- **Sass**: estilizacao dos componentes.
- **ESLint**: padronizacao e verificacao estatica do codigo.

## Como Rodar

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Depois disso, acesse a URL exibida no terminal pelo Vite, normalmente:

```bash
http://localhost:5173
```

## Scripts Disponiveis

- `npm run dev`: inicia o projeto em modo de desenvolvimento.
- `npm run build`: gera a versao de producao.
- `npm run preview`: abre uma previa local da build.
- `npm run lint`: executa a verificacao de lint.
