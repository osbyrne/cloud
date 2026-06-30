import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

const app = new Hono();
const PORT = Number(process.env.PORT) || 3000;

// In-memory database of contacts
let contacts: Contact[] = [
  {
    id: "1",
    name: "Alice Martin",
    email: "alice.martin@example.com",
    phone: "+33 6 12 34 56 78",
    company: "TechCorp",
    notes: "Développeuse Senior",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Bob Dupont",
    email: "bob.dupont@example.com",
    phone: "+33 6 98 76 54 32",
    company: "Innovate SA",
    notes: "Chef de projet",
    createdAt: new Date().toISOString(),
  },
];

// Helper to generate a unique ID
const generateId = (): string => Math.random().toString(36).substring(2, 9);

// API Endpoints
app.get("/api/contacts", (c) => {
  return c.json(contacts);
});

app.post("/api/contacts", async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { name, email, phone, company, notes } = body;

  if (!name || !email || !phone) {
    return c.json({ error: "Name, email, and phone are required" }, 400);
  }

  const newContact: Contact = {
    id: generateId(),
    name,
    email,
    phone,
    company: company || "",
    notes: notes || "",
    createdAt: new Date().toISOString(),
  };

  contacts.push(newContact);
  return c.json(newContact, 201);
});

app.put("/api/contacts/:id", async (c) => {
  const id = c.req.param("id");
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { name, email, phone, company, notes } = body;

  const contactIndex = contacts.findIndex((c) => c.id === id);

  if (contactIndex === -1) {
    return c.json({ error: "Contact not found" }, 404);
  }

  if (!name || !email || !phone) {
    return c.json({ error: "Name, email, and phone are required" }, 400);
  }

  contacts[contactIndex] = {
    ...contacts[contactIndex],
    name,
    email,
    phone,
    company: company || "",
    notes: notes || "",
  };

  return c.json(contacts[contactIndex]);
});

app.delete("/api/contacts/:id", (c) => {
  const id = c.req.param("id");
  const contactIndex = contacts.findIndex((c) => c.id === id);

  if (contactIndex === -1) {
    return c.json({ error: "Contact not found" }, 404);
  }

  contacts = contacts.filter((c) => c.id !== id);
  return new Response(null, { status: 204 });
});

// Health check endpoint for Kubernetes probes
app.get("/healthz", (c) => {
  return c.json({ status: "UP", timestamp: new Date().toISOString() });
});

// Serve frontend static files
app.use("/*", serveStatic({
  root: "./frontend/dist",
}));

// Fallback to index.html for SPA client-side routing
app.get("*", serveStatic({
  path: "./frontend/dist/index.html",
}));

serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`Server running on port ${info.port}`);
});
