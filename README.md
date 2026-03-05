# 📅 Weekly Planner System

A **capacity-based team planning platform** built using **.NET 8 Web API** and **Angular**.  
This system helps software teams plan weekly work based on available capacity and track task progress efficiently.

The application allows teams to manage backlog items, allocate hours according to predefined category percentages, and monitor progress in a centralized dashboard.

---

# 🚀 Live Application

Frontend (Angular SPA)  
🔗 https://weekly-planner-ui.azurewebsites.net

Backend API (.NET 8)  
🔗 https://weekly-planner-api.azurewebsites.net

---

# 🎯 High Level Functionality

The system is designed to support **capacity-based planning for software teams**.

## Weekly Planning Workflow

### 1️⃣ Backlog

The system maintains a **Backlog of tasks**.

Backlog items are categorized into:

- Client Work
- Technical Debt
- Research & Development

---

### 2️⃣ Weekly Planning

Every **Tuesday**, the team plans work for the next **four working days**.

Daily capacity:


8 hours per day


Weekly meeting time:


2 hours


Available planning capacity:


30 hours per developer


---

### 3️⃣ Category Allocation

The **Team Lead defines percentage allocation** for each category.

Example:

| Category | Allocation |
|--------|--------|
| Client Work | 50% |
| Tech Debt | 30% |
| R&D | 20% |

The system automatically calculates **hour distribution** based on these percentages.

---

### 4️⃣ Task Selection

Team members select backlog items and allocate hours until their **30 hour capacity is filled**.

---

### 5️⃣ Plan Freeze

Once planning is completed:

- The plan becomes **locked**
- Team members can **only update progress**

---

### 6️⃣ Progress Tracking

Team leads can:

- View team progress
- Track individual performance
- Monitor backlog completion
- Identify blocked tasks

---

# 🏗 Architecture Diagram

System architecture diagram:

https://drive.google.com/file/d/dummy-architecture-diagram-link/view

---

# ☁️ Azure Cloud Architecture

The application is deployed using **Microsoft Azure Cloud Services**.

### Azure Services Used

- Azure App Service (Frontend)
- Azure App Service (Backend API)
- Azure SQL Database
- Azure Storage
- Azure Application Insights
- Azure Monitor
- GitHub Actions CI/CD

---

# 🔐 Security Features

- Azure Active Directory Authentication
- JWT Token Based Authorization
- Role Based Access Control
- Secure API endpoints
- HTTPS enforced

---

# ⚙️ Tech Stack

## Frontend

- Angular
- TypeScript
- HTML5
- CSS / SCSS
- Bootstrap

---

## Backend

- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- LINQ
- RESTful APIs

---

## Database

- Azure SQL Database
- SQL Server

---

## DevOps

- GitHub
- GitHub Actions
- Azure App Services
- CI/CD Pipelines

---

# 📊 Core Modules

## Backlog Management

Features:

- Create backlog items
- Categorize tasks
- Estimate effort
- Track priority

---

## Weekly Planning

Features:

- Capacity calculation
- Category allocation
- Task selection
- Plan freeze

---

## Progress Tracking

Features:

- Update task progress
- Team progress dashboard
- Individual tracking
- Lead visibility

---

# 🧪 Testing

The project includes:

- Unit Tests
- Integration Tests
- API Testing

Coverage Target:


100% Code Coverage


---

# 🧑‍💻 Local Development Setup

## Backend (.NET API)

```bash
git clone https://github.com/gauravzambre/weekly-planner-system.git

cd backend

dotnet restore
dotnet build
dotnet run

API runs on:

https://localhost:5001
Frontend (Angular)
cd frontend

npm install
ng serve

App runs on:

http://localhost:4200

```

---
# 🚀 CI/CD Pipeline

## Automated CI/CD using GitHub Actions.

Pipeline performs:

Code Build
Unit Testing
Code Quality Checks
Application Packaging
Deployment to Azure App Service
📈 Monitoring & Observability

Monitoring tools used:

Azure Application Insights

Azure Monitor

Log Analytics

Capabilities:

Performance tracking

Error monitoring

Request tracing

Real-time telemetry

---

## 👨‍💻 Author

Gaurav Zambre
Software Engineer
Full Stack Developer

Responsibilities:

System Architecture

Backend Development

Frontend Development

Cloud Deployment

CI/CD Implementation

---