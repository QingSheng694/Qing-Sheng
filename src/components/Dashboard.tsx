import { useEffect, useState } from "react";
import { 
  Building, Mail, Phone, MapPin, Search, Plus, Trash2, Edit2, Share2, 
  ExternalLink, Download, Check, AlertCircle, RefreshCw, Database, 
  Wifi, WifiOff, FileText, QrCode, X, BookOpen, Contact as ContactIcon
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Contact, SystemConfig } from "../types";
import { downloadVCard, cleanDisplayUrl } from "../utils";
import ContactModal from "./ContactModal";

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [isConfigLoading, setIsConfigLoading] = useState(false);

  // Modal configuration states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // In-line clipboard states indexed by ID
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Custom in-card safety confirm delete state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Share QR overlay state
  const [qrModalContact, setQrModalContact] = useState<Contact | null>(null);

  const fetchContacts = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/contacts");
      if (!res.ok) {
        throw new Error("Unable to retrieve records. Server returned " + res.status);
      }
      const data = await res.json();
      setContacts(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reach backend endpoint.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConfig = async () => {
    setIsConfigLoading(true);
    try {
      const res = await fetch("/api/config");
      if (res.ok) {
        const data = await res.json();
        setSystemConfig(data);
      }
    } catch (err) {
      console.error("Failed to fetch system stats:", err);
    } finally {
      setIsConfigLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    fetchConfig();
  }, []);

  const handleCreateNew = () => {
    setSelectedContact(null);
    setIsModalOpen(true);
  };

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const handleSaveContact = async (formData: Partial<Contact>) => {
    const isEditing = !!formData._id;
    const url = isEditing ? `/api/contacts/${formData._id}` : "/api/contacts";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errRes = await res.json().catch(() => ({}));
      throw new Error(errRes.error || `Server returned error status ${res.status}`);
    }

    // Refetch the data catalog upon success
    fetchContacts();
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete selected contact document.");
      }
      setDeleteConfirmId(null);
      fetchContacts();
    } catch (err: any) {
      alert(err.message || "An error occurred while deleting.");
    }
  };

  const handleCopyLink = (contact: Contact) => {
    const externalUrl = `${window.location.origin}/card/${contact._id}`;
    navigator.clipboard.writeText(externalUrl);
    setCopiedId(contact._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getInitials = (first = "", last = "") => {
    return `${first.charAt(0) || ""}${last.charAt(0) || ""}`.toUpperCase() || "?";
  };

  // Live client-side filters
  const filteredContacts = contacts.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.firstName.toLowerCase().includes(query) ||
      c.lastName.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      c.organization.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row font-sans selection:bg-indigo-600/25">
      
      {/* SIDEBAR NAVIGATION FRAME */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0 select-none">
        {/* Logo area */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-100 dark:shadow-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 block leading-tight">CARDNET</span>
            <span className="text-[9px] font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase mt-0.5 block font-bold">PRO EDITION</span>
          </div>
        </div>

        {/* Top items list hierarchy option */}
        <nav className="flex-1 px-4 py-3 space-y-1.5">
          <span className="text-[10px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase font-mono block px-4 mb-2">
            REGISTRY INDEX
          </span>

          <button className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold text-sm transition-all cursor-pointer text-left">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span className="flex-1">Contacts</span>
            <span className="text-xs px-2 py-0.5 bg-zinc-200/60 dark:bg-zinc-900 rounded-md font-mono text-zinc-600 dark:text-zinc-400 font-bold">
              {contacts.length}
            </span>
          </button>

          <button 
            onClick={() => alert("Enterprise Visual-Analytics module is coming soon!")}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-sm transition-all text-left cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            <span>Analytics</span>
          </button>

          <button 
            onClick={() => alert("Pre-made design templates directory integration is coming soon!")}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-sm transition-all text-left cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
            <span>Templates</span>
          </button>

          <button 
            onClick={() => alert("Admin control-panel and environment variables settings are managed via the standard settings menu.")}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl text-sm transition-all text-left cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Settings</span>
          </button>
        </nav>

        {/* Bottom database status dynamic indicator matching Professional Polish styling */}
        <div className="p-6 mt-auto border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="relative flex">
              {systemConfig?.connected ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-60"></span>
                </>
              ) : systemConfig?.mode === "memory" ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-amber-400 opacity-60"></span>
                </>
              ) : (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-60"></span>
                </>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest leading-none">
                {systemConfig?.connected ? "Database Online" : "In-Memory Session"}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium truncate mt-1">
                {systemConfig?.connected ? (systemConfig.dbName || "cluster-primary") : "fallback-cache-01"}
              </span>
            </div>
            <button
              onClick={() => { fetchConfig(); fetchContacts(); }}
              disabled={isConfigLoading}
              className="ml-auto p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer disabled:opacity-50 transition"
              title="Refresh Connection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isConfigLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {!systemConfig?.connected && (
            <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 mt-2 block leading-normal italic">
              💡 Tip: Configure MONGODB_URI in settings variables to preserve data permanently.
            </p>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 h-screen">
        
        {/* Professional Top Header Bar */}
        <header className="h-20 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800/80 px-6 md:px-8 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-950 px-4 py-2 rounded-full w-full max-w-sm border border-zinc-200 dark:border-zinc-800">
            <Search className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..." 
              className="bg-transparent outline-none text-sm w-full font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 font-mono font-bold"
              >
                CLEAR
              </button>
            )}
          </div>
          
          <button 
            onClick={handleCreateNew}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-150 dark:shadow-none hover:bg-indigo-700 transition-all text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Contact</span>
          </button>
        </header>

        {/* Scrollable Main Content Pane */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          
          {/* Dashboard Intro Section */}
          <div className="mb-8 select-none">
            <h2 className="font-display text-2xl font-bold text-zinc-950 dark:text-white leading-tight">
              Enterprise Contact Registry
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Draft, share, download, and catalog enterprise-level digital business cards (vCards).
            </p>
          </div>

        {/* Global Error message container if contacts loading failure */}
        {errorMsg && (
          <div className="mb-8 p-5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 dark:text-red-300 text-sm">Registry Synchronisation Failure</h4>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                {errorMsg}. This usually occurs when security policies or connection parameters fail. You can click retry to query the cache endpoints.
              </p>
              <button
                onClick={fetchContacts}
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-800 dark:text-red-300 font-semibold uppercase tracking-wider font-mono hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* Catalog grid views list */}
        {isLoading ? (
          /* Skeletons Loader grids */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-56 animate-pulse flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-zinc-200 dark:bg-zinc-800 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2 mt-1">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                    <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
                  </div>
                </div>
                <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          /* Empty states triggers */
          <div className="text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 select-none">
            <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mx-auto mb-4 border border-zinc-200 dark:border-zinc-800">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-white">
              {contacts.length === 0 ? "No business cards drafted yet" : "No matches found"}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 max-w-sm mx-auto">
              {contacts.length === 0 
                ? "Prepare and save dynamic business records to enable instant sharing, .vcf downloading, and NFC layout presentations." 
                : "Try reviewing your query parameters or clearing search criteria to inspect existing files."}
            </p>
            {contacts.length === 0 ? (
              <button
                onClick={handleCreateNew}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold tracking-wider uppercase font-mono rounded-xl cursor-pointer shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Write Initial Card</span>
              </button>
            ) : (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-xs font-mono font-bold text-indigo-500 hover:text-indigo-600 uppercase"
              >
                Clear Query Filters
              </button>
            )}
          </div>
        ) : (
          /* Real Dynamic Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContacts.map((contact) => {
              const isDeleteConfirm = deleteConfirmId === contact._id;

              return (
                <div
                  key={contact._id}
                  id={`contact-card-${contact._id}`}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full relative group"
                >
                  
                  {/* Card head layout */}
                  <div className="flex items-start gap-3.5">
                    {/* Visual Photo or Initials placeholder */}
                    {contact.avatar ? (
                      <img
                        src={contact.avatar}
                        alt={`${contact.firstName} ${contact.lastName}`}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-zinc-100 dark:ring-zinc-800"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center font-display font-bold text-zinc-600 dark:text-zinc-400 text-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
                        {getInitials(contact.firstName, contact.lastName)}
                      </div>
                    )}

                    {/* Meta info tags */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-zinc-950 dark:text-white leading-tight truncate">
                        {contact.firstName} {contact.lastName}
                      </h3>
                      {contact.title && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium truncate mt-0.5">
                          {contact.title}
                        </p>
                      )}
                      {contact.organization ? (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                          <Building className="w-3 h-3 shrink-0" />
                          <span className="truncate">{contact.organization}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600 block mt-1">
                          Freelance / Independent
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Horizontal visual breaks */}
                  <div className="border-b border-zinc-100 dark:border-zinc-800 my-4" />

                  {/* Body coordinates */}
                  <div className="space-y-2 flex-1">
                    {contact.email && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 min-w-0">
                        <Mail className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                        <span className="truncate">{contact.email}</span>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 min-w-0">
                        <Phone className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                        <span className="truncate">{contact.phone}</span>
                      </div>
                    )}
                    {contact.address && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 min-w-0">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                        <span className="truncate">{contact.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Visual indication social badges */}
                  <div className="flex gap-1.5 mt-4 min-h-4">
                    {contact.socials?.linkedin && <span className="text-[9px] font-semibold tracking-wider font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/10 px-1.5 py-0.5 rounded-md uppercase">LinkedIn</span>}
                    {contact.socials?.twitter && <span className="text-[9px] font-semibold tracking-wider font-mono text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/10 px-1.5 py-0.5 rounded-md uppercase">Twitter</span>}
                    {contact.socials?.github && <span className="text-[9px] font-semibold tracking-wider font-mono text-zinc-600 dark:text-zinc-400 bg-zinc-150 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/50 px-1.5 py-0.5 rounded-md uppercase">GitHub</span>}
                    {contact.socials?.instagram && <span className="text-[9px] font-semibold tracking-wider font-mono text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/10 px-1.5 py-0.5 rounded-md uppercase">Instagram</span>}
                  </div>

                  {/* Actions layout card bottom footer trigger */}
                  <div className="mt-5 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-mono select-none">
                    
                    {/* Share / Copy buttons */}
                    <div className="flex items-center gap-1.55">
                      <button
                        id={`copy-btn-${contact._id}`}
                        onClick={() => handleCopyLink(contact)}
                        className={`p-2 rounded-lg cursor-pointer transition-all ${
                          copiedId === contact._id 
                            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/10" 
                            : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50"
                        }`}
                        title="Copy Public Card Link"
                      >
                        {copiedId === contact._id ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        id={`qr-btn-${contact._id}`}
                        onClick={() => setQrModalContact(contact)}
                        className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg cursor-pointer transition-all"
                        title="View Sharing QR"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`vcard-btn-${contact._id}`}
                        onClick={() => downloadVCard(contact)}
                        className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg cursor-pointer transition-all"
                        title="Download vCard .vcf file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <a
                        id={`view-btn-${contact._id}`}
                        href={`/card/${contact._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50 rounded-lg cursor-pointer transition-all inline-flex items-center justify-center"
                        title="Open Shared Card View"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {/* Edit & double click Delete safeguards */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        id={`edit-btn-${contact._id}`}
                        onClick={() => handleEdit(contact)}
                        disabled={isDeleteConfirm}
                        className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/10 rounded-lg cursor-pointer transition-all disabled:opacity-40"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isDeleteConfirm ? (
                        <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg p-0.5">
                          <button
                            id={`delete-confirm-yes-${contact._id}`}
                            onClick={() => handleDeleteItem(contact._id)}
                            className="bg-red-600 text-white font-bold text-[9px] uppercase px-2 py-1.5 rounded hover:bg-red-700 transition"
                          >
                            Yes, delete
                          </button>
                          <button
                            id={`delete-confirm-no-${contact._id}`}
                            onClick={() => setDeleteConfirmId(null)}
                            className="text-zinc-500 dark:text-zinc-400 font-bold text-[9px] uppercase px-2 py-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-805 transition"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          id={`delete-btn-${contact._id}`}
                          onClick={() => setDeleteConfirmId(contact._id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-red-100 dark:hover:border-red-900/10 rounded-lg cursor-pointer transition-all"
                          title="Delete Contact Card"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
        </div>
      </main>

      {/* CORE CONTACT EDIT/CREATE DIALOG */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveContact}
        contact={selectedContact}
      />

      {/* FLOATING SHARING QR CODE DIALOG WINDOW */}
      {qrModalContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 select-none">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl relative text-center">
            
            <button
              onClick={() => setQrModalContact(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="mx-auto w-12 h-12 bg-indigo-50 dark:bg-zinc-950 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center rounded-2xl text-indigo-500 mb-4">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-base text-zinc-900 dark:text-zinc-50 truncate px-4">
              {qrModalContact.firstName} {qrModalContact.lastName}
            </h3>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 mb-5">
              Let other professionals scan this code to sync contacts immediately.
            </p>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-inner mb-4">
              <div className="bg-white p-3 rounded-xl border border-zinc-200 flex items-center justify-center">
                <QRCodeSVG
                  value={`${window.location.origin}/card/${qrModalContact._id}`}
                  size={144}
                  bgColor="#FFFFFF"
                  fgColor="#09090b"
                  level="M"
                />
              </div>
            </div>

            <button
              onClick={() => {
                const targetUrl = `${window.location.origin}/card/${qrModalContact._id}`;
                navigator.clipboard.writeText(targetUrl);
                alert("Copied public business card link to clipboard!");
              }}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-semibold font-mono tracking-wider uppercase rounded-xl transition"
            >
              Copy Public Card Link
            </button>

          </div>
        </div>
      )}

    </div>
  );
}
