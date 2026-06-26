import express, { Request, Response } from 'express';
import path from 'path';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// In-memory database of contacts
let contacts: Contact[] = [
  {
    id: '1',
    name: 'Alice Martin',
    email: 'alice.martin@example.com',
    phone: '+33 6 12 34 56 78',
    company: 'TechCorp',
    notes: 'Développeuse Senior',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Bob Dupont',
    email: 'bob.dupont@example.com',
    phone: '+33 6 98 76 54 32',
    company: 'Innovate SA',
    notes: 'Chef de projet',
    createdAt: new Date().toISOString()
  }
];

// Helper to generate a unique ID
const generateId = (): string => Math.random().toString(36).substring(2, 9);

// API Endpoints
app.get('/api/contacts', (req: Request, res: Response) => {
  res.json(contacts);
});

app.post('/api/contacts', (req: Request, res: Response) => {
  const { name, email, phone, company, notes } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  const newContact: Contact = {
    id: generateId(),
    name,
    email,
    phone,
    company: company || '',
    notes: notes || '',
    createdAt: new Date().toISOString()
  };

  contacts.push(newContact);
  res.status(201).json(newContact);
});

app.put('/api/contacts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, phone, company, notes } = req.body;

  const contactIndex = contacts.findIndex(c => c.id === id);

  if (contactIndex === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Name, email, and phone are required' });
  }

  contacts[contactIndex] = {
    ...contacts[contactIndex],
    name,
    email,
    phone,
    company: company || '',
    notes: notes || ''
  };

  res.json(contacts[contactIndex]);
});

app.delete('/api/contacts/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const contactIndex = contacts.findIndex(c => c.id === id);

  if (contactIndex === -1) {
    return res.status(404).json({ error: 'Contact not found' });
  }

  contacts = contacts.filter(c => c.id !== id);
  res.status(204).send();
});

// Health check endpoint for Kubernetes probes
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Fallback to serving the index.html for spa
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
