﻿# Lead-Management

### 1. Authentication & Authorization
- **Role-Based Access Control**: Super Admin, Sub-Admin, Support Agent
- **Secure Login/Logout**: JWT token-based authentication
- **Password Encryption**: Uses bcryptjs for secure password hashing

### 2. User Management (Super Admin Only)
- **CRUD Operations**: Create, edit, delete Sub-Admins and Support Agents
- **Activity Logs**: View user activity history

### 3. Lead Management
- **CRUD Operations**: Create, read, update, delete leads
- **Excel Import**: Upload leads via Excel files (.xlsx, .xls)
- **Lead Fields**:
  - Name, Email, Phone, Source
  - Status: New, Contacted, Qualified, Lost, Won
  - Tags, Notes, Assigned Agent, Timestamps

### 4. Lead Features
- **Advanced Filtering**:
  - By status, tags, date range, assigned agent
  - Search by name, email, phone
- **Tagging System**:
  - Add/remove tags, filter/export by tags
- **Lead Assignment**:
  - Admins assign leads to agents
  - Agents only access their assigned leads
- **Data Export**:
  - Export leads to Excel with configurable fields and filters

### 5. Dashboard & Analytics
- **Lead Statistics**: Total leads
- **Activity Log**: Recent user actions

#Routes
- /login for login
- /signup for signup
- /dashboard for Dashboard
- /admin/leads admin panel contain filters, Export lead, add Leads (With all fields), and assign to.
- /admin/users can create User, can edit the Role of user, and see the Activity Logs
- /leads Can create leads
- /leadlist Leadlist is a page where you can create Lead with all the Fields 
