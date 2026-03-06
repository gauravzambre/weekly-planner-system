---

# 🎯 Weekly Planner System – Frontend

Frontend application for the **Weekly Planner System**, a capacity-based planning tool that helps engineering teams organize weekly workloads, allocate hours, and track progress across backlog tasks.

The UI is built using **Angular (TypeScript)** with a modern **dark-first enterprise design**, inspired by tools like **Azure DevOps, Jira, and Linear**.

This application communicates with the **.NET 8 Backend API** to manage backlog items, weekly planning cycles, and task progress.

---

# 🚀 Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Framework      | Angular                                  |
| Language       | TypeScript                               |
| UI Styling     | SCSS                                     |
| Layout         | Angular Components                       |
| HTTP Client    | Angular HttpClient                       |
| State Handling | Component State                          |
| UI Framework   | Custom UI + Angular Material (optional)  |
| Build Tool     | Angular CLI                              |
| Deployment     | Azure Static Web App / Azure App Service |

---

# 🏗 Frontend Architecture

The frontend follows a **component-based architecture** to ensure scalability and maintainability.

```
Angular Application
│
├── Core
│     Services
│     API configuration
│
├── Modules
│     Backlog Module
│     Planning Module
│     Progress Module
│
├── Shared
│     Reusable Components
│     Utilities
│
└── UI Components
      Dashboard
      Backlog
      Weekly Planner
      Progress Tracker
```

This architecture ensures:

* Clean separation of concerns
* Reusable components
* Scalable project structure

---

# 🖥 User Interface Design

The UI is designed using a **dark-first theme** for better usability and visual comfort.

Design inspiration:

* Linear
* Jira
* Azure DevOps
* Notion

### Key UI Characteristics

✔ Minimalist layout
✔ High readability
✔ Responsive design
✔ Fast interaction
✔ Component-based UI

---

# ⚙️ Application Workflow

The frontend mirrors the **team planning workflow used by engineering teams**.

---

# 1️⃣ Backlog Management

The **Backlog Page** displays all tasks categorized into:

| Category       | Description       |
| -------------- | ----------------- |
| Client Focused | Customer work     |
| Tech Debt      | Code improvements |
| R&D            | Research tasks    |

Features:

✔ View backlog items
✔ Create new backlog tasks
✔ Edit tasks
✔ Delete tasks

---

# 2️⃣ Weekly Planning

The **Weekly Planner module** allows team members to allocate their working hours.

Planning rules:

```
Working Hours Per Week = 30
```

Calculation:

```
8 hours × 4 days = 32 hours
2 hours meeting
---------------------
Total planning capacity = 30 hours
```

Users can select tasks from the backlog and assign hours.

---

# 3️⃣ Category Distribution

The **Team Lead** defines percentage allocation across categories.

Example:

| Category  | Percentage |
| --------- | ---------- |
| Client    | 50%        |
| Tech Debt | 30%        |
| R&D       | 20%        |

The UI visually shows whether the allocations follow these limits.

---

# 4️⃣ Plan Freeze

Once planning is completed:

```
Plan Status → Frozen
```

After freezing:

❌ Tasks cannot be modified
✅ Progress updates allowed

---

# 5️⃣ Progress Tracking

Team members update task progress.

Status options:

| Status      | Meaning          |
| ----------- | ---------------- |
| Not Started | Task not started |
| In Progress | Work ongoing     |
| Completed   | Work finished    |

Progress updates are sent to the backend via API.

---

# 🔗 API Integration

The frontend communicates with the **.NET Backend API** using Angular's HttpClient.

Example API endpoints used:

```
GET     /api/backlog
POST    /api/backlog
PUT     /api/backlog/{id}
DELETE  /api/backlog/{id}

POST    /api/weeklyplan/create
POST    /api/weeklyplan/freeze

GET     /api/allocation/user/{id}

PUT     /api/progress/update
```

All API calls are handled inside **Angular services**.

---

# 📂 Project Structure

```
frontend
│
├── src
│   ├── app
│   │
│   ├── components
│   │     backlog
│   │     planner
│   │     dashboard
│   │     progress
│   │
│   ├── services
│   │     backlog.service.ts
│   │     planning.service.ts
│   │     progress.service.ts
│   │
│   ├── models
│   │     backlog.model.ts
│   │     plan.model.ts
│   │
│   └── styles
│
└── angular.json
```

---

# 🎨 UI Components

Major components implemented:

| Component        | Purpose                     |
| ---------------- | --------------------------- |
| Dashboard        | Overview of weekly progress |
| Backlog          | Manage backlog tasks        |
| Weekly Planner   | Allocate weekly hours       |
| Progress Tracker | Update task progress        |
| Team View        | Lead monitoring dashboard   |

---

# 🧪 Testing

The frontend includes automated tests to ensure code quality.

Testing tools:

```
Jasmine
Karma
Angular TestBed
```

Coverage goals:

```
100% coverage for tested modules
```

---

# ⚡ Performance Optimization

Several practices are implemented to improve performance:

✔ Lazy loading modules
✔ Component-based rendering
✔ Efficient API calls
✔ Optimized Angular change detection

---

# 🚀 Deployment

The frontend is deployed using **Azure Cloud Services**.

Deployment workflow:

```
Developer Push
      ↓
GitHub Repository
      ↓
GitHub Actions
      ↓
Angular Build
      ↓
Deploy to Azure Static Web App
```

---

# 📊 Key Features

✔ Backlog management UI
✔ Weekly capacity planning
✔ Category percentage visualization
✔ Task hour allocation
✔ Plan freeze mechanism
✔ Task progress tracking
✔ Team lead progress dashboard
✔ Fully responsive Angular UI

---

# 📌 Future Enhancements

Potential improvements:

* Real-time updates using WebSockets
* Drag-and-drop task allocation
* Advanced analytics dashboard
* Notifications for weekly planning
* Role-based authentication

---

# 👨‍💻 Author

**Gaurav Zambre**



Technologies:

```
Angular
TypeScript
.NET
Azure
SQL
```

---


