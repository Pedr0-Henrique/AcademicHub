# AcademicHub - Sistema de Gestão Acadêmica

![Laravel](https://img.shields.io/badge/Laravel-11-red.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC.svg)
![Docker](https://img.shields.io/badge/Docker-2496ED.svg)

Plataforma de gestão acadêmica completa para gerenciamento de alunos, cursos e matrículas. Sistema Full Stack moderno com arquitetura separada, autenticação, autorização e interface responsiva.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Docker](#docker)
- [API Endpoints](#api-endpoints)
- [Autenticação](#autenticação)
- [Autorização](#autorização)
- [Testes](#testes)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Roadmap](#roadmap)

## 🎯 Visão Geral

AcademicHub é um sistema de gestão acadêmica completo que permite:
- Gerenciar alunos, cursos e matrículas
- Controlar acessos através de autenticação e autorização
- Visualizar dashboard com estatísticas em tempo real
- Interface moderna e responsiva com dark mode
- Arquitetura escalável e segura

## ✨ Funcionalidades

### Backend (Laravel)
- ✅ Autenticação com Laravel Sanctum
- ✅ Autorização por papel (Admin, Manager e aluno)
- ✅ Cadastro público de alunos e área acadêmica individual
- ✅ Provisionamento administrativo de Managers via Artisan
- ✅ API REST versionada (/api/v1)
- ✅ CRUD completo de alunos, cursos, turmas e matrículas
- ✅ Validação de dados (Form Requests)
- ✅ Soft Delete em alunos, cursos e turmas
- ✅ Prevenção de matrículas duplicadas
- ✅ Paginação e filtros
- ✅ Policies e Gates para autorização

### Frontend (React)
- ✅ Login com validação (Zod + React Hook Form)
- ✅ Cadastro de aluno com conclusão de perfil acadêmico
- ✅ Portal do aluno com dados e matrículas próprias
- ✅ Dashboard com estatísticas
- ✅ Gestão de alunos (CRUD completo)
- ✅ Gestão de cursos (CRUD completo)
- ✅ Gestão de turmas por curso, período, turno e capacidade
- ✅ Gestão de matrículas (CRUD completo)
- ✅ Perfil do aluno com histórico acadêmico
- ✅ Dark mode
- ✅ Layout responsivo com sidebar
- ✅ Loading states e tratamento de erros

## 🛠 Stack Tecnológica

### Backend
- **Framework:** Laravel 11.31
- **PHP:** 8.2+
- **Autenticação:** Laravel Sanctum
- **Banco de Dados:** MySQL 8.0
- **ORM:** Eloquent
- **Validação:** Form Requests
- **Transformação:** API Resources
- **Autorização:** Policies e Gates

### Frontend
- **Framework:** React 19
- **Linguagem:** TypeScript 6
- **Bundler:** Vite 8
- **Estilização:** Tailwind CSS 4
- **Rotas:** React Router DOM 7
- **Formulários:** React Hook Form 7
- **Validação:** Zod 3
- **HTTP Client:** Axios 1
- **Ícones:** Lucide React 1

### Infraestrutura
- **Containerização:** Docker & Docker Compose
- **Servidor Web:** Nginx
- **Controle de Versão:** Git

## 🏗 Arquitetura

```
academic-hub/
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/
│   │   │   ├── Requests/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Policies/
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   └── bootstrap/
│       └── app.php
│
├── frontend/                # React SPA
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── layouts/         # Layouts (MainLayout)
│   │   ├── pages/           # Páginas
│   │   ├── services/        # API clients
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utilitários
│   └── public/
│
├── docker/                  # Docker configs
│   ├── backend/
│   │   └── Dockerfile
│   ├── frontend/
│   │   └── Dockerfile
│   └── nginx/
│       └── nginx.conf
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 📦 Pré-requisitos

- PHP 8.2+, Composer 2, Node.js e npm
- MySQL 8.0 ou Docker e Docker Compose
- Git
- Navegador web moderno

## 🚀 Instalação

### Via Docker (Recomendado)

1. Clone o repositório:
```bash
git clone <repository-url>
cd AcademicHub
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie os containers:
```bash
docker compose up -d
```

4. Execute as migrations:
```bash
docker compose exec backend php artisan migrate
```

5. Execute o seeder do admin (somente para desenvolvimento local):
```bash
docker compose exec backend php artisan db:seed --class=AdminUserSeeder
```

6. Crie uma conta Manager pelo terminal:
```bash
docker compose exec backend php artisan manager:create
```
O comando solicita nome, email e senha; a senha é digitada sem aparecer no terminal.

7. Acesse a aplicação:
- Frontend: http://localhost:8080
- API: http://localhost:8080/api/v1

### Desenvolvimento Local

Se preferir desenvolver sem Docker:

1. **Backend:**
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed --class=AdminUserSeeder
php artisan manager:create
php artisan serve --port=8000
```

2. **Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
```
Configure `VITE_API_URL=http://localhost:8000/api/v1` no ambiente do frontend e inicie:
```bash
npm run dev
```

O cadastro público fica em `/register` e cria somente contas de aluno. Após entrar, o aluno acessa `/student` para completar o perfil. Um registro acadêmico legado com o mesmo email só é vinculado se o CPF também corresponder; caso contrário, um novo perfil é criado. A administração precisa matricular esse aluno para que cursos e turmas apareçam.

## ⚙️ Configuração

### Variáveis de Ambiente

**Backend (.env):**
```env
APP_NAME="AcademicHub"
APP_ENV=local
APP_DEBUG=true
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=academichub
DB_USERNAME=academichub
DB_PASSWORD=secret
```
No Docker, use `DB_HOST=mysql`; executando o PHP diretamente no computador, use `DB_HOST=127.0.0.1`.

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

Com Docker e Nginx, use `http://localhost:8080/api/v1` quando a API for acessada pelo proxy.

### Criar conta Manager

Manager não se cadastra pela página pública. Para provisionar uma conta, execute no diretório `backend`:

```bash
php artisan manager:create
```

No Docker, execute `docker compose exec backend php artisan manager:create` na raiz do projeto. O comando valida email único, exige senha com no mínimo 8 caracteres e pede confirmação com entrada oculta. Não informe a senha como argumento nem compartilhe credenciais. O banco deve estar configurado e as migrations executadas.

O `AdminUserSeeder` cria uma conta de demonstração com credenciais conhecidas; use-o apenas em desenvolvimento e troque a senha imediatamente. Não use a conta padrão em produção.

## 🐳 Docker

### Serviços

- **backend:** Laravel/PHP-FPM (porta 9000)
- **frontend:** React/Vite (porta 5173)
- **mysql:** MySQL 8.0 (porta 3306)
- **nginx:** Nginx reverse proxy (porta 8080)

### Comandos Docker

```bash
# Iniciar todos os serviços
docker compose up -d

# Parar todos os serviços
docker compose down

# Visualizar logs
docker compose logs

# Logs de um serviço específico
docker compose logs backend

# Executar comando no backend
docker compose exec backend php artisan migrate

# Executar comando no frontend
docker compose exec frontend npm install

# Reconstruir containers
docker compose up -d --build

# Remover volumes (cuidado: apaga dados do banco)
docker compose down -v
```

## 🔌 API Endpoints

### Autenticação

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register (público; cria aluno)
POST   /api/v1/auth/logout  (requer autenticação)
GET    /api/v1/auth/me     (requer autenticação)
```

### Alunos

```
GET    /api/v1/students              (requer autenticação + manager/admin)
GET    /api/v1/students/{id}         (requer autenticação + manager/admin)
GET    /api/v1/students/me           (aluno; somente o próprio perfil)
PUT    /api/v1/students/me/profile   (aluno; completa/vincula o próprio perfil)
POST   /api/v1/students              (requer autenticação + manager/admin)
PUT    /api/v1/students/{id}         (requer autenticação + manager/admin)
DELETE /api/v1/students/{id}         (requer autenticação + manager/admin)
```

### Cursos

```
GET    /api/v1/courses              (requer autenticação + manager/admin)
GET    /api/v1/courses/{id}         (requer autenticação + manager/admin)
POST   /api/v1/courses              (requer autenticação + manager/admin)
PUT    /api/v1/courses/{id}         (requer autenticação + manager/admin)
DELETE /api/v1/courses/{id}         (requer autenticação + manager/admin)
```

### Turmas

```
GET    /api/v1/turmas               (requer autenticação + manager/admin)
GET    /api/v1/turmas/{id}          (requer autenticação + manager/admin)
POST   /api/v1/turmas               (requer autenticação + manager/admin)
PUT    /api/v1/turmas/{id}          (requer autenticação + manager/admin)
DELETE /api/v1/turmas/{id}          (requer autenticação + manager/admin)
```

### Matrículas

```
GET    /api/v1/enrollments          (requer autenticação + manager/admin)
GET    /api/v1/enrollments/{id}     (requer autenticação + manager/admin)
POST   /api/v1/enrollments          (requer autenticação + manager/admin)
PUT    /api/v1/enrollments/{id}     (requer autenticação + manager/admin)
DELETE /api/v1/enrollments/{id}     (requer autenticação + manager/admin)
```

O cadastro de matrícula recebe `student_id` e `turma_id`; o curso é determinado pela turma.
O aluno consulta suas próprias relações somente por `/api/v1/students/me`; as listas administrativas não ficam disponíveis para esse papel.

### Parâmetros de Busca e Filtros

```
?search=termo           # Busca por nome, email ou CPF
&status=active          # Filtro por status
&page=1                 # Página atual
&per_page=10            # Itens por página
```

## 🔐 Autenticação

### Credenciais Padrão

```
Email: admin@academichub.com
Senha: admin123
```

As credenciais acima são somente para desenvolvimento local; nunca as utilize em produção.

### Fluxo de Autenticação

1. Usuário faz login com email e senha
2. Backend valida credenciais e retorna token Bearer
3. Frontend armazena token no localStorage
4. Token é enviado no header Authorization em requisições subsequentes
5. Token expira ou é revogado no logout

## 👥 Autorização

### Roles

- **Admin:** Acesso total
- **Manager:** Gestão de alunos, cursos e matrículas
- **User (aluno):** Acessa somente o próprio perfil e suas matrículas, turmas e cursos

### Permissões

| Recurso | Admin | Manager | User |
|----------|-------|---------|------|
| Visualizar listas administrativas | ✅ | ✅ | ❌ |
| Visualizar próprio perfil e matrículas | ✅ | ✅ | ✅ |
| Criar alunos/cursos/matrículas | ✅ | ✅ | ❌ |
| Editar alunos/cursos/matrículas | ✅ | ✅ | ❌ |
| Excluir alunos/cursos/matrículas | ✅ | ✅ | ❌ |

Contas Manager não são criadas pela API pública. O comando `manager:create` deve ser executado somente por uma pessoa autorizada com acesso ao terminal do backend.

## 🧪 Testes

### Executar Testes Backend

```bash
docker compose exec backend php artisan test
```

### Executar Testes Específicos

```bash
docker compose exec backend php artisan test --filter StudentTest
```

## 📁 Estrutura do Projeto

### Backend (Laravel)

```
backend/
├── app/
│   ├── Console/Commands/CreateManager.php
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   │   ├── AuthController.php
│   │   │   ├── StudentController.php
│   │   │   ├── CourseController.php
│   │   │   └── EnrollmentController.php
│   │   ├── Requests/
│   │   │   ├── LoginRequest.php
│   │   │   ├── StoreStudentRequest.php
│   │   │   ├── UpdateStudentRequest.php
│   │   │   ├── StoreCourseRequest.php
│   │   │   ├── UpdateCourseRequest.php
│   │   │   ├── StoreEnrollmentRequest.php
│   │   │   └── UpdateEnrollmentRequest.php
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Student.php
│   │   ├── Course.php
│   │   └── Enrollment.php
│   ├── Policies/
│   │   ├── StudentPolicy.php
│   │   ├── CoursePolicy.php
│   │   └── EnrollmentPolicy.php
│   └── Providers/
│       └── AuthServiceProvider.php
├── database/
│   ├── migrations/
│   └── seeders/
│       └── AdminUserSeeder.php
└── routes/
    ├── api.php
    └── web.php
```

### Frontend (React)

```
frontend/
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── layouts/
│   │   └── MainLayout.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── StudentPortalPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── StudentsPage.tsx
│   │   ├── StudentProfilePage.tsx
│   │   ├── CoursesPage.tsx
│   │   └── EnrollmentsPage.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── dashboard.ts
│   │   ├── students.ts
│   │   ├── courses.ts
│   │   └── enrollments.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useDarkMode.ts
│   └── types/
│       └── index.ts
└── public/
```

## 🗺 Roadmap

### Concluído ✅
- [x] Análise da V1
- [x] Estrutura do projeto
- [x] Backend Laravel + Sanctum
- [x] Frontend React + TypeScript
- [x] Docker + Docker Compose
- [x] Banco de dados MySQL
- [x] Autenticação
- [x] Autorização RBAC
- [x] API REST completa
- [x] Frontend com CRUDs
- [x] Área acadêmica isolada por aluno
- [x] Dashboard
- [x] Dark mode
- [x] Testes automatizados de autenticação e autorização


## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido como projeto de portfólio Full Stack Júnior.

---

**AcademicHub V2** - Sistema de Gestão Acadêmica Moderno
