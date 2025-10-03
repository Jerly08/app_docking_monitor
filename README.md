# 🚢 Aplikasi Monitoring Proyek Docking

> Sistem Manajemen & Monitoring Pekerjaan Docking Kapal dengan React, Next.js, dan Prisma

## 📋 Deskripsi Proyek

**Aplikasi Monitoring Proyek Docking** adalah sistem manajemen proyek berbasis web yang dirancang khusus untuk monitoring dan pengelolaan pekerjaan docking kapal. Aplikasi ini menyediakan interface yang komprehensif untuk mengelola berbagai aspek operasional galangan kapal, mulai dari perencanaan kerja hingga pelaporan progres.

## 🏗️ Arsitektur Aplikasi

### Frontend Architecture
```
📁 Frontend (Next.js 15)
├── 🎨 UI Framework: Chakra UI + TailwindCSS
├── 🔧 State Management: React Context API
├── 🔑 Authentication: JWT + bcrypt
├── 📊 Data Fetching: Custom Hooks
└── 📱 Responsive Design: Mobile-first approach
```

### Backend Architecture
```
📁 Backend (Express.js + Socket.IO)
├── 🗄️ Database: MySQL + Prisma ORM
├── 🔌 Real-time: Socket.IO WebSocket
├── 🔐 Security: JWT Authentication, Password Hashing
├── 🛠️ API: RESTful endpoints
└── 📋 Migration: Prisma Schema Management
```

### Database Schema
```
🗄️ MySQL Database
├── 👥 Users: Authentication & Role Management
├── 📋 WorkItems: Hierarchical Task Management
├── 📊 Tasks: Project Planning & Scheduling
└── 🔄 Relations: Parent-child hierarchy support
```

## ⚡ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: Chakra UI v2.10.9
- **Styling**: TailwindCSS v4, Emotion
- **Icons**: Heroicons, Lucide React, React Icons
- **Animation**: Framer Motion v12
- **PDF Generation**: jsPDF + html2canvas
- **TypeScript**: v5

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js v4.19.2
- **Database**: MySQL
- **ORM**: Prisma v5.20.0
- **WebSocket**: Socket.IO v4.7.5
- **Authentication**: JWT (jose v6.1.0, jsonwebtoken v9.0.2)
- **Password Hashing**: bcryptjs v3.0.2

### Development Tools
- **Language**: TypeScript
- **Linting**: ESLint v9
- **Package Manager**: npm
- **Process Manager**: ts-node-dev
- **Database Tools**: Prisma CLI

## 🚀 Fitur Utama

### 1. 🔐 Sistem Autentikasi
- **Multi-role Authentication**: ADMIN, MANAGER, USER
- **JWT Token Security**: Secure session management
- **Password Protection**: bcrypt hashing
- **Protected Routes**: Middleware-based route protection

### 2. 📊 Dashboard & Monitoring
- **Real-time Updates**: Socket.IO integration
- **Progress Tracking**: Visual completion indicators
- **Statistics Overview**: Project metrics and KPIs
- **Role-based Access**: Customized views per user role

### 3. 📋 Manajemen Work Items
- **Hierarchical Structure**: Parent-child task relationships
- **Kategori Kerja**: PELAYANAN UMUM, SURVEY & ESTIMASI, dll.
- **Progress Tracking**: Completion percentage per task
- **Resource Management**: Volume, unit, status tracking
- **Image Attachments**: Document and photo uploads

### 4. 🗂️ Modul Aplikasi
- **Dashboard**: Overview dan statistik proyek
- **Master Data**: Pengelolaan data bank dan vendor
- **Survey & Estimasi**: Planning dan kalkulasi biaya
- **Project Management**: Task scheduling dan resource allocation
- **Procurement & Vendor**: Vendor management system
- **Technician Work**: Work order management
- **Warehouse & Material**: Inventory management
- **Finance & Payment**: Financial tracking
- **Quotation & Negotiation**: Quote management
- **Work Plan & Report**: Hierarchical work planning
- **Reporting**: Comprehensive reporting system

### 5. 📈 Pelaporan & Export
- **PDF Generation**: Automated report generation
- **CSV Export**: Data export capabilities
- **Visual Reports**: Chart and graph integration
- **Print-ready**: Optimized for printing

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js**: v18+ 
- **MySQL**: v8.0+
- **npm**: v8+

### 1. Clone Repository
```bash
git clone <repository-url>
cd app_monitoring_proyek
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Buat file `.env` di root directory:
```env
# Database Configuration
DATABASE_URL="mysql://username:password@localhost:3306/app_monitoring_proyek"

# JWT Secret (Change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-in-production-use-at-least-32-characters"

# Server Configuration
PORT=4001
FRONTEND_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

### 4. Database Setup
```bash
# Setup database schema dan seed data
npm run db:setup

# Atau step by step:
npm run prisma:generate
npm run prisma:migrate  
npm run prisma:seed
```

### 5. Development Server
```bash
# Start full development environment (Frontend + Backend)
npm run dev:full

# Atau start individual servers:
npm run dev          # Frontend (http://localhost:3000)
npm run server:dev   # Backend (http://localhost:4001)
```

## 👥 Default Users

| Username | Password | Role | Description |
|----------|----------|------|--------------|
| `admin` | `admin123` | ADMIN | Full system access |
| `manager` | `manager123` | MANAGER | Project management |
| `user` | `user123` | USER | Read-only access |

## 📁 Struktur Direktori

```
app_monitoring_proyek/
├── 📁 src/                    # Source code
│   ├── 📁 app/               # Next.js App Router
│   │   ├── 📁 api/           # API Routes
│   │   ├── 📁 dashboard/     # Dashboard module
│   │   ├── 📁 login/         # Authentication
│   │   └── 📁 [modules]/     # Feature modules
│   ├── 📁 components/        # React components
│   │   └── 📁 Modules/       # Feature components
│   ├── 📁 contexts/          # React contexts
│   ├── 📁 hooks/             # Custom hooks
│   ├── 📁 types/             # TypeScript types
│   └── 📁 utils/             # Utility functions
├── 📁 server/                # Backend server
│   └── 📄 index.ts          # Express server
├── 📁 prisma/                # Database schema & migrations
│   ├── 📄 schema.prisma     # Database schema
│   ├── 📄 seed.ts           # Seed data
│   └── 📁 migrations/       # Database migrations
├── 📁 public/                # Static assets
├── 📄 package.json          # Dependencies
├── 📄 tsconfig.json         # TypeScript config
├── 📄 next.config.ts        # Next.js config
└── 📄 README.md             # This file
```

## 🔧 Available Scripts

```bash
# Development
npm run dev                   # Start Next.js development server
npm run server:dev           # Start Express backend server
npm run dev:full             # Start both frontend & backend (Windows)

# Build & Production
npm run build                # Build production bundle
npm run start                # Start production server

# Database
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate       # Run database migrations
npm run prisma:seed          # Seed database with sample data
npm run prisma:reset         # Reset database (careful!)
npm run db:setup            # Complete database setup

# Code Quality
npm run lint                 # Run ESLint
```

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/login         # User login
POST /api/auth/logout        # User logout
GET  /api/auth/me            # Get current user
```

### Work Items
```
GET  /api/work-items         # Fetch hierarchical work items
POST /api/work-items         # Create new work item
```

### Tasks (Backend Server:4001)
```
GET  /api/tasks              # List tasks with filtering
POST /api/tasks              # Create task
PUT  /api/tasks/:id          # Update task
DEL  /api/tasks/:id          # Delete task
GET  /api/tasks/conflicts    # Detect resource conflicts
```

## 📊 Database Models

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String   @unique
  password  String   // hashed
  role      String   @default("USER")
  fullName  String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### WorkItem Model (Hierarchical)
```prisma
model WorkItem {
  id              String     @id
  number          Int?
  category        String?
  title           String     @db.Text
  description     String?    @db.Text
  volume          Int?
  unit            String?
  status          String?
  completion      Int        @default(0)
  imageUrl        String?
  
  // Hierarchical structure
  parentId        String?
  parent          WorkItem?  @relation("WorkItemHierarchy", fields: [parentId], references: [id])
  children        WorkItem[] @relation("WorkItemHierarchy")
  
  // Project fields
  package         String?
  durationDays    Int?
  startDate       String?
  finishDate      String?
  resourceNames   String     @default("")
  isMilestone     Boolean    @default(false)
  dependsOnIds    Json?
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Route Protection**: Middleware-based access control
- **Role-based Access**: ADMIN, MANAGER, USER permissions
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Server-side data validation

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop**: Full-featured desktop experience
- **Dark/Light Mode**: Chakra UI color mode support

## 🚀 Deployment

### Development
```bash
npm run dev:full
```

### Production
```bash
# Build aplikasi
npm run build

# Setup production database
npm run db:setup

# Start production server
npm start
```

### Environment Variables (Production)
```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret-at-least-32-characters"
PORT=4001
FRONTEND_ORIGIN="https://your-production-domain.com"
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

Jika mengalami issues, periksa:
- Database connection di `.env`
- MySQL service status
- Node.js version compatibility
- Prisma migration status

## 📄 License

This project is licensed under the MIT License.

---

**© 2024 Aplikasi Monitoring Proyek Docking - Sistem Manajemen Galangan Kapal** 🚢

*Developed with ❤️ using Next.js, Chakra UI, dan Prisma*
