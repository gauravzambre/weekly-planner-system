# 📦 Weekly Planner System – Backend API

Backend service for the **Weekly Planner System**, a capacity-based planning application used by engineering teams to plan and track weekly work allocation.

This backend is built using **.NET 8 Web API** and **Azure SQL Database** and provides APIs for backlog management, weekly planning, hour allocation, and progress tracking.

---

# 🚀 Tech Stack

| Layer          | Technology            |
| -------------- | --------------------- |
| Framework      | .NET 8 Web API        |
| Language       | C#                    |
| Database       | Azure SQL Database    |
| ORM            | Entity Framework Core |
| API Style      | RESTful APIs          |
| Authentication | JWT (optional)        |
| Testing        | xUnit / NUnit         |
| CI/CD          | GitHub Actions        |
| Deployment     | Azure App Service     |

---

# 🏗 System Architecture

```
Angular Frontend
        │
        │ REST API Calls
        ▼
.NET 8 Web API (Backend)
        │
        │ Entity Framework Core
        ▼
Azure SQL Database
```

### Architecture Pattern

The backend follows **Clean Architecture principles**.

```
Controllers
    │
    ▼
Services (Business Logic)
    │
    ▼
Repositories (Data Access)
    │
    ▼
Entity Framework Core
    │
    ▼
Azure SQL Database
```

This separation ensures:

* Maintainable code
* Testability
* Clear responsibility separation

---

# ⚙️ Business Workflow

The system models the **weekly planning process used by software teams**.

### 1️⃣ Backlog Creation

Tasks are stored in the backlog and categorized into:

| Category       | Description                  |
| -------------- | ---------------------------- |
| Client Focused | Customer related work        |
| Tech Debt      | Internal improvements        |
| R&D            | Research and experimentation |

---

### 2️⃣ Weekly Planning (Tuesday)

Team members plan work for:

```
Wednesday → Monday
Total Working Days = 4
```

Working hours calculation:

```
8 hours/day × 4 days = 32 hours
2 hours reserved for meeting
--------------------------------
Total Available Planning Hours = 30 hours
```

Each team member distributes their **30 hours** across backlog tasks.

---

### 3️⃣ Category Allocation

The **Team Lead** defines percentage distribution.

Example:

| Category       | Percentage |
| -------------- | ---------- |
| Client Focused | 50%        |
| Tech Debt      | 30%        |
| R&D            | 20%        |

This determines how many hours can be spent on each category.

---

### 4️⃣ Task Assignment

Developers select backlog items and allocate hours until their **30-hour capacity is filled**.

---

### 5️⃣ Plan Freeze

Once planning is complete:

```
Plan Status → Frozen
```

After freezing:

❌ Tasks cannot be changed
✅ Only **progress updates** are allowed.

---

### 6️⃣ Progress Tracking

Team members update progress on tasks.

Example:

| Status      | Description      |
| ----------- | ---------------- |
| Not Started | Work not started |
| In Progress | Work ongoing     |
| Completed   | Work finished    |

---

### 7️⃣ Team Lead Dashboard

Team leads can see:

* Team capacity usage
* Category distribution
* Task completion status
* Individual member progress

---

# 🗄 Database Design (Azure SQL)

### 1️⃣ Users Table

Stores team member information.

| Column | Type     |
| ------ | -------- |
| Id     | INT      |
| Name   | NVARCHAR |
| Email  | NVARCHAR |
| Role   | NVARCHAR |

---

### 2️⃣ Categories Table

Defines backlog categories.

| Column | Type     |
| ------ | -------- |
| Id     | INT      |
| Name   | NVARCHAR |

Values:

```
Client Focused
Tech Debt
R&D
```

---

### 3️⃣ Backlog Table

Stores backlog tasks.

| Column         | Type     |
| -------------- | -------- |
| Id             | INT      |
| Title          | NVARCHAR |
| Description    | NVARCHAR |
| CategoryId     | INT      |
| EstimatedHours | INT      |

---

### 4️⃣ WeeklyPlans Table

Represents a weekly planning cycle.

| Column    | Type     |
| --------- | -------- |
| Id        | INT      |
| StartDate | DATE     |
| EndDate   | DATE     |
| Status    | NVARCHAR |

Status:

```
Draft
Frozen
```

---

### 5️⃣ PlanAllocations Table

Stores task allocations per user.

| Column         | Type     |
| -------------- | -------- |
| Id             | INT      |
| UserId         | INT      |
| BacklogId      | INT      |
| WeeklyPlanId   | INT      |
| AllocatedHours | INT      |
| ProgressStatus | NVARCHAR |

---

# 🔄 API Endpoints

## Backlog APIs

```
GET     /api/backlog
POST    /api/backlog
PUT     /api/backlog/{id}
DELETE  /api/backlog/{id}
```

---

## Category APIs

```
GET /api/categories
```

---

## Weekly Planning APIs

```
POST /api/weeklyplan/create
POST /api/weeklyplan/freeze
GET  /api/weeklyplan/current
```

---

## Allocation APIs

```
POST /api/allocation
PUT  /api/allocation/update-hours
GET  /api/allocation/user/{userId}
```

---

## Progress APIs

```
PUT /api/progress/update
GET /api/progress/team
GET /api/progress/user/{id}
```

---

# 🔐 Business Rules

The backend enforces several important constraints.

### Capacity Rule

Each member can only allocate:

```
Max Hours = 30
```

---

### Category Rule

Allocated hours must follow category percentage defined by the lead.

---

### Freeze Rule

If the plan is frozen:

```
Task Modification → Not Allowed
Only Progress Update → Allowed
```

---

# 🧪 Testing

The backend supports **unit and integration testing**.

Coverage includes:

* Business logic validation
* API endpoint testing
* Database interaction tests

Testing Framework:

```
xUnit
Moq
FluentAssertions
```

Target:

```
100% Code Coverage
```

---

# 🚀 Deployment

The backend is deployed on **Azure App Service**.

Deployment flow:

```
Developer Push
     ↓
GitHub Repository
     ↓
GitHub Actions CI/CD
     ↓
Build & Test
     ↓
Deploy to Azure App Service
     ↓
Connect to Azure SQL
```

---

# 🔄 CI/CD Pipeline

Automated using **GitHub Actions**.

Pipeline stages:

```
1. Code Checkout
2. Restore Dependencies
3. Build Project
4. Run Unit Tests
5. Generate Test Coverage
6. Deploy to Azure
```

---

# 📁 Project Structure

```
backend
│
├── Controllers
│     BacklogController.cs
│     WeeklyPlanController.cs
│     AllocationController.cs
│
├── Services
│     PlanningService.cs
│     AllocationService.cs
│
├── Repositories
│     BacklogRepository.cs
│
├── Models
│     User.cs
│     Backlog.cs
│     WeeklyPlan.cs
│
├── DTOs
│
├── Data
│     ApplicationDbContext.cs
│
└── Tests
```

---

# 📊 Key Features Implemented

✔ Backlog management
✔ Category classification
✔ Weekly planning system
✔ Capacity based allocation (30 hours)
✔ Task progress tracking
✔ Lead visibility dashboard APIs
✔ Plan freeze mechanism
✔ Azure SQL integration
✔ CI/CD automated deployment

---

# 📌 Future Improvements

* Role based authentication (JWT)
* Real-time progress updates
* Notifications for plan freeze
* Advanced analytics for team performance

---

# 👨‍💻 Author

**Gaurav Zambre**

Backend Developer – .NET / Cloud

---

If you want, I can also create a **second file that will impress reviewers even more:**

* `ARCHITECTURE.md` (system design diagrams)
* `DATABASE_SCHEMA.md` (SQL + ER diagram)
* `API_DOCUMENTATION.md` (Swagger-level explanation)

