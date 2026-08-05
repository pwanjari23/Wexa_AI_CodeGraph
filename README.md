# CodeGraph

> **Visualize API Dependencies. Analyze Change Impact.**

CodeGraph is a lightweight developer tool that helps engineering teams visualize software architecture, explore API dependencies, and analyze the impact of code changes before deployment.

Built using **React**, **Node.js**, **Express.js**, and **CognoDB Cloud**, the application uses **openCypher** with the official **Neo4j JavaScript Driver** to demonstrate how graph databases simplify dependency traversal and software architecture analysis. :contentReference[oaicite:0]{index=0}

---

## Features

- API Search
- Architecture Dashboard
- Multi-hop Dependency Traversal
- Change Impact Analysis
- Interactive Architecture Explorer
- Shortest Dependency Path
- Circular Dependency Detection
- Architecture Statistics

---

## Technology Stack

### Frontend

- React (Vite)
- Tailwind CSS
- React Flow
- Axios

### Backend

- Node.js
- Express.js
- Neo4j JavaScript Driver

### Database

- CognoDB Cloud
- openCypher
- Bolt Protocol

---

## Why a Graph Database?

Modern software systems consist of interconnected components such as frontend pages, APIs, services, databases, and external integrations.

Representing these relationships in a graph makes dependency traversal, impact analysis, and shortest-path queries far more intuitive than modeling them through multiple relational joins. CodeGraph leverages CognoDB's graph model and Cypher query language to efficiently explore these connections. :contentReference[oaicite:1]{index=1}

---

## Graph Data Model

### Nodes

- FrontendPage
- API
- Service
- Database
- DeveloperTeam
- ExternalService

### Relationships

```text
FrontendPage ── CALLS ──► API
API ── USES ──► Service
Service ── READS ──► Database
Service ── CALLS ──► ExternalService
Service ── OWNED_BY ──► DeveloperTeam
API ── DEPENDS_ON ──► API
```

---

## Project Structure

```text
CodeGraph/
├── client/
├── server/
├── README.md
├── .env.example
└── .gitignore
```

---

## Getting Started

### 1. Create a CognoDB Instance

Create a free **CognoDB Cloud (c0)** instance and copy the Bolt URI and generated password. :contentReference[oaicite:2]{index=2}

### 2. Configure Environment Variables

```env
COGNODB_URI=
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=
PORT=5000
```

### 3. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

### 4. Seed the Database

```bash
cd server
npm run seed
```

### 5. Run the Application

```bash
# Backend
npm run dev

# Frontend
npm run dev
```

---

## Screenshots

- Dashboard
- API Details
- <img width="1912" height="875" alt="image" src="https://github.com/user-attachments/assets/a096e23c-8d5d-432c-aa0c-ca05bce789e9" />
  <img width="1894" height="881" alt="image" src="https://github.com/user-attachments/assets/7217c999-912a-493d-a3f1-2d1222494087" />


---

## Demo

**Live Demo:** *[(Add deployment link)](https://wexa-ai-code-graph.vercel.app/)*



---

## Future Improvements

- Automatic GitHub repository analysis
- AST-based dependency extraction
- Real-time architecture synchronization
