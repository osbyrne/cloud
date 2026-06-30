import { useState, useEffect } from "react";
import {
  Users,
  User,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Search,
  X,
  Trash2,
  Edit3,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  createdAt: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

const AVATAR_GRADIENTS = [
  "from-indigo-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-red-500",
  "from-pink-500 to-rose-500",
  "from-lime-500 to-emerald-600",
];

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  // Fetch contacts on load
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/contacts");
      if (!res.ok) throw new Error("Impossible de charger les contacts");
      const data = await res.json();
      setContacts(data);
    } catch (err: any) {
      showToast(err.message || "Erreur de chargement", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const key = id.replace("contact-", "");
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast("Les champs obligatoires (*) doivent être remplis", "error");
      return;
    }

    try {
      if (editingId) {
        // Edit Mode
        const res = await fetch(`/api/contacts/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Erreur lors de la modification");
        const updated = await res.json();
        setContacts((prev) => prev.map((c) => (c.id === editingId ? updated : c)));
        showToast("Contact mis à jour avec succès !");
      } else {
        // Create Mode
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!res.ok) throw new Error("Erreur lors de la création");
        const created = await res.json();
        setContacts((prev) => [...prev, created]);
        showToast("Contact ajouté avec succès !");
      }

      resetForm();
    } catch (err: any) {
      showToast(err.message || "Une erreur est survenue", "error");
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      company: contact.company || "",
      notes: contact.notes || "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) return;

    try {
      const res = await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setContacts((prev) => prev.filter((c) => c.id !== id));
      showToast("Contact supprimé avec succès");

      if (editingId === id) {
        resetForm();
      }
    } catch (err: any) {
      showToast(err.message || "Une erreur est survenue", "error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      notes: "",
    });
  };

  // Helper values
  const getAvatarGradient = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  };

  const getInitials = (name: string) => {
    if (!name) return "C";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.phone.includes(searchQuery),
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 flex flex-col gap-8">
      {/* Header Area */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6  border  rounded-2xl  gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-xl">
              ContactSphere
            </h1>
            <p className="text-xs">Propulsé par React + Tailwind v4</p>
          </div>
        </div>

        <div className="flex items-center gap-6 self-stretch sm:self-auto justify-between">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider">
              Total Contacts
            </span>
            <span className="text-2xl font-bold ">{contacts.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-400">
            <span className="w-2 height-2 rounded-full bg-emerald-400"></span>
            K8s Service Active
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Form Card */}
        <section className="backdrop-blur-lg border  rounded-2xl p-6">
          <h2 className="text-lg font-bold  mb-1">
            {editingId ? "Modifier le Contact" : "Créer un Contact"}
          </h2>
          <p className="text-xs  mb-6">
            Renseignez les détails du contact ci-dessous.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-name" className="text-xs font-semibold ">
                Nom complet *
              </label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3.5  pointer-events-none" />
                <input
                  type="text"
                  id="contact-name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ex. Jean Dupont"
                  required
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-email" className="text-xs font-semibold ">
                Adresse e-mail *
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5  pointer-events-none" />
                <input
                  type="email"
                  id="contact-email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ex. jean.dupont@company.com"
                  required
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-phone" className="text-xs font-semibold ">
                Téléphone *
              </label>
              <div className="relative flex items-center">
                <Phone size={16} className="absolute left-3.5  pointer-events-none" />
                <input
                  type="tel"
                  id="contact-phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="ex. +33 6 12 34 56 78"
                  required
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-company" className="text-xs font-semibold ">
                Entreprise
              </label>
              <div className="relative flex items-center">
                <Briefcase
                  size={16}
                  className="absolute left-3.5  pointer-events-none"
                />
                <input
                  type="text"
                  id="contact-company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="ex. Acme Corp"
                  className="input"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="contact-notes" className="text-xs font-semibold ">
                Notes / Observations
              </label>
              <div className="relative flex items-start">
                <textarea
                  id="contact-notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Notes supplémentaires sur ce contact..."
                  className="textarea"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                className="btn"
              >
                {editingId ? "Mettre à jour" : "Enregistrer"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </form>
        </section>

        {/* List Section */}
        <section className="flex flex-col gap-6">
          {/* Search Bar */}
          <div className="  border  rounded-2xl p-4">
            <div className="relative flex items-center">
              <Search size={18} className="absolute left-4 " />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un contact par son nom, e-mail ou entreprise..."
                className="input"
              />
            </div>
          </div>

          {/* Grid display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20  border  rounded-2xl ">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p>Chargement des contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 border  rounded-2xl  text-center">
              <Users size={64} className="opacity-30 mb-4 stroke-1" />
              <h3 className=" text-base font-semibold mb-1">Aucun contact trouvé</h3>
              <p className="text-sm  max-w-sm">
                Commencez à ajouter des contacts à l'aide du formulaire ou ajustez votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredContacts.map((contact) => {
                const gradient = getAvatarGradient(contact.name);
                const initials = getInitials(contact.name);

                return (
                  <div
                    key={contact.id}
                    className="group border  rounded-2xl p-5 flex flex-col gap-4 hover:-translate-y-1    relative overflow-hidden before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:opacity-0 hover:before:opacity-100 before: before:"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${gradient}`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold  truncate text-sm"
                          title={contact.name}
                        >
                          {contact.name}
                        </h3>
                        {contact.company && (
                          <span className="text-xs text-indigo-400 font-medium truncate block">
                            {contact.company}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-3 border-t  text-xs">
                      <div className="flex items-center gap-2  min-w-0">
                        <Mail size={12} className=" shrink-0" />
                        <span className="truncate" title={contact.email}>
                          {contact.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2  min-w-0">
                        <Phone size={12} className=" shrink-0" />
                        <span>{contact.phone}</span>
                      </div>
                      {contact.notes && (
                        <div className="mt-1 py-2 px-3 rounded-lg border-l  text-[11px]  italic">
                          {contact.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 mt-auto border-t ">
                      <button
                        onClick={() => handleEdit(contact)}
                        className="btn"
                        title="Modifier"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="btn"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Toast System */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm animate-slide-in ${toast.type === "success"
              ? "border-l-4 border-l-emerald-500"
              : "border-l-4 border-l-red-500"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="text-emerald-400" />
            ) : (
              <AlertCircle size={18} className="text-red-400" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
