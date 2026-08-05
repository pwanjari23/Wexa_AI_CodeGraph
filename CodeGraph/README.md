# CodeGraph

CodeGraph is a graph-powered developer tool that visualizes software architecture, API dependencies, and change impact analysis. It helps engineering teams identify circular dependency loops and understand downstream risks before changes are committed or deployed.

## Repository & Links
* **GitHub Repository:** [https://github.com/pwanjari23/Wexa_AI_CodeGraph](https://github.com/pwanjari23/Wexa_AI_CodeGraph)
* **Live Frontend Demo (Vercel):** [https://wexa-ai-codegraph.vercel.app](https://wexa-ai-codegraph.vercel.app)
* **Live Backend API (Render):** [https://wexa-ai-codegraph.onrender.com](https://wexa-ai-codegraph.onrender.com)
* **Loom Walkthrough Video:** [https://loom.com/share/placeholder-link](https://loom.com/share/placeholder-link)

---

## Why a Graph Database (CognoDB) is the Right Choice

Traditional relational (SQL) or document (NoSQL) databases struggle to model complex, deeply nested software dependencies. CognoDB is the ideal choice for CodeGraph due to:

1. **Relationship-First Design:** In software architecture, connections (e.g. *Frontend calls API*, *API uses Service*, *Service reads Database*) are as important as the entities themselves. CognoDB treats relationships as first-class citizens.
2. **Sub-millisecond Traversal:** Querying dependencies up to $N$ hops away requires multiple recursive JOIN operations in SQL, leading to severe performance bottlenecks. openCypher traverses these edges in sub-milliseconds.
3. **Built-in Shortest Path Discovery:** Finding how a change in a backend microservice impacts a frontend screen is computed natively at the database level using `shortestPath()`, without writing complex traversal logic in application code.
4. **Trivial Loop & Circular Dependency Detection:** Detecting circular loops (e.g., `A -> B -> A`) is incredibly simple using Cypher pattern matching (`MATCH path = (a)-[:DEPENDS_ON*1..5]->(a)`) compared to recursive SQL CTEs.

---

## Single Source of Truth: CognoDB & openCypher

Every graph operation is executed strictly in the cloud database via **parameterized Cypher queries** using the official Neo4j JavaScript Driver. No mock traversal, offline fallbacks, or client-side JavaScript BFS/DFS algorithms are utilized.

### Cypher Query Implementation

#### 1. Search APIs
Finds API nodes whose names or descriptions match a query parameter:
```cypher
MATCH (n:API) 
WHERE toLower(n.name) CONTAINS toLower($query) OR toLower(n.description) CONTAINS toLower($query) 
RETURN n.name AS name, n.description AS description, n.riskLevel AS riskLevel LIMIT 10
```

#### 2. Downstream Dependencies (Traversal)
Traverses outbound relationships up to 4 hops to map dependencies:
```cypher
MATCH path = (a:API {name: $name})-[:USES|DEPENDS_ON|CALLS|READS|OWNED_BY*1..4]->(target)
RETURN path
```

#### 3. Upstream Impact Analysis
Traverses inbound relationships up to 4 hops to trace affected frontend pages and APIs:
```cypher
MATCH path = (upstream)-[:CALLS|DEPENDS_ON|USES*1..4]->(a:API {name: $name})
RETURN path
```

#### 4. Shortest Path Finder
Calculates the shortest connection route between any two architectural nodes:
```cypher
MATCH (start {name: $startName}), (end {name: $endName})
MATCH path = shortestPath((start)-[:USES|DEPENDS_ON|CALLS|READS|OWNED_BY*..10]-(end))
RETURN path
```

#### 5. Dashboard Statistics
Calculates all architecture metrics dynamically in one database query:
```cypher
OPTIONAL MATCH (f:FrontendPage) WITH count(f) as pages
OPTIONAL MATCH (a:API) WITH pages, count(a) as apis
OPTIONAL MATCH (s:Service) WITH pages, apis, count(s) as services
OPTIONAL MATCH (d:Database) WITH pages, apis, services, count(d) as databases
OPTIONAL MATCH ()-[r]->() RETURN pages, apis, services, databases, count(r) as relationships
```

---

## Environment Variables

### Root / Backend Server Environment (`server/.env`)
Create a `.env` in the `server` directory matching `.env.example`:

```env
COGNODB_URI=bolt+s://db-fea9763d.databases.cognodb.com
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=0f07b464c8e1838e49d75852ea88ec02
PORT=5000
```

### Frontend Client Environment (`client/.env`)
Create a `.env` in the `client` directory:

```env
VITE_API_URL=https://wexa-ai-codegraph.onrender.com/api
```

---

## Local Setup Instructions

### 1. Backend Server Setup
Install dependencies, run the seeder, and boot the server:
```bash
cd server
npm install
npm run seed   # Seeds the online database with nodes & connections
npm start      # Starts server on http://localhost:5000
```

### 2. Frontend Client Setup
Install dependencies and run the client:
```bash
cd client
npm install
npm run dev    # Starts Vite dev server
```

---

## Deployment Configuration

### Backend (Render)
* **Root Directory:** `server`
* **Build Command:** `npm install`
* **Start Command:** `npm start`
* **Environment Variables:** `COGNODB_URI`, `COGNODB_USERNAME`, `COGNODB_PASSWORD`

### Frontend (Vercel)
* **Root Directory:** `client`
* **Framework Preset:** `Vite`
* **Build Command:** `npm run build`
* **Output Directory:** `dist`
* **Environment Variables:** `VITE_API_URL`
