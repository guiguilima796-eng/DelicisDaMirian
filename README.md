# 🍔 Delícias da Mirian — Sistema Completo

Sistema de lanchonete com cardápio digital, pedidos online e painel administrativo completo.

---

## 📁 Estrutura do Projeto

```
mirian-full/
├── backend/          ← API Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma    ← Modelos do banco
│   │   └── seed.js          ← Dados iniciais
│   ├── src/
│   │   ├── lib/prisma.js    ← Client do banco
│   │   ├── middleware/
│   │   │   ├── auth.js      ← Verificar JWT
│   │   │   └── upload.js    ← Upload de imagens (Multer)
│   │   └── routes/
│   │       ├── auth.js      ← Login, troca de senha
│   │       ├── menu.js      ← CRUD do cardápio
│   │       ├── orders.js    ← Pedidos
│   │       └── store.js     ← Config da loja
│   ├── server.js            ← Servidor Express
│   ├── .env.example
│   └── package.json
├── frontend/         ← React + Vite
│   ├── src/
│   │   ├── api/client.js    ← Chamadas à API
│   │   ├── App.jsx          ← App completo
│   │   └── main.jsx
│   ├── .env.example
│   └── package.json
├── docker-compose.yml        ← PostgreSQL local
└── README.md
```

---

## 🚀 PASSO A PASSO — INSTALAÇÃO COMPLETA

### PRÉ-REQUISITOS

Antes de começar, instale:

1. **Node.js 18+** → https://nodejs.org (baixe a versão LTS)
   ```bash
   node -v   # deve mostrar v18+ ou v20+
   npm -v
   ```

2. **Docker Desktop** → https://docker.com/products/docker-desktop
   (para rodar o PostgreSQL sem instalar manualmente)

---

### PASSO 1 — Baixar e extrair o projeto

Extraia o ZIP baixado em uma pasta de sua escolha. Você terá a pasta `mirian-full/`.

---

### PASSO 2 — Subir o banco de dados PostgreSQL (Docker)

No terminal, dentro da pasta `mirian-full/`:

```bash
docker compose up -d
```

Aguarde o download da imagem (primeira vez demora ~1 minuto). Verifique:
```bash
docker compose ps
# mirian_db deve estar "Up"
```

Acesse o gerenciador visual em: http://localhost:8080
- Sistema: PostgreSQL
- Servidor: postgres
- Usuário: postgres
- Senha: senha123
- Banco: delicias_mirian

---

### PASSO 3 — Configurar o Backend

Entre na pasta do backend:
```bash
cd backend
```

**3a. Instalar dependências:**
```bash
npm install
```

**3b. Criar o arquivo .env:**
```bash
cp .env.example .env
```
Abra o `.env` em um editor e verifique:
```
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/delicias_mirian"
JWT_SECRET="cole-aqui-uma-chave-secreta-muito-longa"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Para gerar um JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copie o resultado e cole no JWT_SECRET.

**3c. Criar as tabelas e dados iniciais:**
```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

Você verá:
```
✅ Banco semeado com sucesso!
👤 Admin: mirian / admin123
```

**3d. Iniciar o servidor:**
```bash
npm run dev
```

Servidor rodando em: http://localhost:3001
Teste: http://localhost:3001/api/health

---

### PASSO 4 — Configurar o Frontend

Abra **outro terminal** e vá para a pasta frontend:
```bash
cd frontend
```

**4a. Instalar dependências:**
```bash
npm install
```

**4b. Criar o arquivo .env:**
```bash
cp .env.example .env
```
Conteúdo do `.env`:
```
VITE_API_URL=http://localhost:3001/api
```

**4c. Iniciar o frontend:**
```bash
npm run dev
```

Site disponível em: http://localhost:5173

---

### PASSO 5 — Acessar o sistema

**Site dos clientes:** http://localhost:5173
**Painel admin:** clique em "Painel Administrativo" no rodapé do site
- Usuário: `mirian`
- Senha: `admin123`

---

### PASSO 6 — Trocar a senha padrão

No painel admin, vá em Configurações e troque a senha imediatamente!

Ou pelo terminal:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"mirian","password":"admin123"}'
```

---

## 🌐 DEPLOY EM PRODUÇÃO

### Backend → Railway (gratuito/pago)

1. Crie conta em https://railway.app
2. Instale o CLI:
   ```bash
   npm install -g @railway/cli
   railway login
   ```
3. Na pasta `backend/`:
   ```bash
   railway init
   railway up
   ```
4. Adicione um banco PostgreSQL no Railway:
   - Dashboard → New → PostgreSQL
   - Copie a `DATABASE_URL` gerada
5. Configure as variáveis de ambiente no Railway:
   - `DATABASE_URL` = (URL gerada pelo Railway)
   - `JWT_SECRET` = (sua chave segura)
   - `NODE_ENV` = production
   - `FRONTEND_URL` = (URL do seu Vercel)
6. Execute o seed:
   ```bash
   railway run node prisma/seed.js
   ```

### Frontend → Vercel (gratuito)

1. Crie conta em https://vercel.com
2. Instale o CLI:
   ```bash
   npm install -g vercel
   ```
3. Na pasta `frontend/`:
   ```bash
   npm run build
   vercel deploy --prod
   ```
4. Configure a variável de ambiente no Vercel:
   - `VITE_API_URL` = https://seu-backend.railway.app/api

---

## 🔐 SEGURANÇA EM PRODUÇÃO

Checklist antes de lançar:

- [ ] Trocar senha padrão `admin123`
- [ ] Usar `JWT_SECRET` com 64+ caracteres aleatórios
- [ ] Configurar `NODE_ENV=production`
- [ ] Configurar `FRONTEND_URL` correto no backend (CORS)
- [ ] Usar HTTPS (Railway e Vercel já incluem automaticamente)
- [ ] Configurar backup automático do PostgreSQL
- [ ] Rate limiting já configurado (200 req/15min geral, 10/15min no login)

---

## 📋 ROTAS DA API

### Público
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/store | Config da loja (aberto/fechado) |
| GET | /api/menu | Cardápio (apenas disponíveis) |
| POST | /api/orders | Criar pedido |
| POST | /api/auth/login | Login admin |

### Admin (requer Bearer Token)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/menu?all=true | Cardápio completo (incluindo inativos) |
| POST | /api/menu | Criar item (multipart/form-data) |
| PATCH | /api/menu/:id | Editar item |
| DELETE | /api/menu/:id | Excluir item |
| GET | /api/orders | Listar pedidos |
| GET | /api/orders/stats | Estatísticas do dia |
| PATCH | /api/orders/:id/status | Atualizar status |
| PATCH | /api/store | Atualizar configuração |
| PATCH | /api/auth/password | Trocar senha |

---

## 🛠 COMANDOS ÚTEIS

```bash
# Ver logs do banco (Docker)
docker compose logs postgres -f

# Parar o banco
docker compose stop

# Abrir Prisma Studio (gerenciador visual)
cd backend && npx prisma studio

# Recriar banco do zero
npx prisma migrate reset

# Gerar tipos do Prisma após alterar schema
npx prisma generate
```

---

## 📞 SUPORTE

Editado com amor para a Mirian. 🍔✨
