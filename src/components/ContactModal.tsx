import React, { useState, useEffect } from "react";
import { X, Upload, Info, CheckCircle, AlertCircle } from "lucide-react";
import type { Contact } from "../types";
import ContactCardPreview from "./ContactCardPreview";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Contact>) => Promise<void>;
  contact?: Contact | null;
}

export default function ContactModal({ isOpen, onClose, onSave, contact }: ContactModalProps) {
  const [formData, setFormData] = useState<Partial<Contact>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    organization: "",
    website: "",
    address: "",
    avatar: "",
    socials: {
      linkedin: "",
      twitter: "",
      github: "",
      instagram: "",
    },
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state with supplied contact when editing
  useEffect(() => {
    if (contact) {
      setFormData({
        _id: contact._id,
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: contact.email || "",
        phone: contact.phone || "",
        title: contact.title || "",
        organization: contact.organization || "",
        website: contact.website || "",
        address: contact.address || "",
        avatar: contact.avatar || "",
        socials: {
          linkedin: contact.socials?.linkedin || "",
          twitter: contact.socials?.twitter || "",
          github: contact.socials?.github || "",
          instagram: contact.socials?.instagram || "",
        },
      });
    } else {
      // Clear out form for clean slate insertion
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        title: "",
        organization: "",
        website: "",
        address: "",
        avatar: "",
        socials: {
          linkedin: "",
          twitter: "",
          github: "",
          instagram: "",
        },
      });
    }
    setErrorMsg(null);
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("social_")) {
      const socialKey = name.replace("social_", "");
      setFormData((prev) => ({
        ...prev,
        socials: {
          ...((prev.socials as any) || {}),
          [socialKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Guard on binary file size bounds (< 1.5MB)
    const MAX_SIZE = 1.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMsg("Image size exceeds the 1.5MB upload limit. Please select a smaller photo file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        avatar: reader.result as string,
      }));
    };
    reader.onerror = () => {
      setErrorMsg("Failed to parse avatar uploaded file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Hard constraint validation matches
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      setErrorMsg("First Name and Last Name are required fields.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "An unresolved error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      {/* Outer Floating Window */}
      <div 
        id="contact-editor-modal"
        className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h2 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {contact ? "Edit Business Card" : "Write Digital Card"}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Draft clean business details and customize external layouts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            id="close-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scroll Frame */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm text-red-700 dark:text-red-300 font-medium">
                {errorMsg}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Left Core Frame */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
              
              {/* Identity fields */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 font-mono">
                  Personal Identity
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Sarah"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Jenkins"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Avatar upload block */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                  Business Photo / Avatar
                </label>
                <div className="flex items-center gap-4">
                  {formData.avatar ? (
                    <div className="relative group shrink-0">
                      <img
                        src={formData.avatar}
                        alt="Preview upload"
                        className="w-16 h-16 rounded-xl object-cover ring-2 ring-zinc-100 dark:ring-zinc-800"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 dark:bg-red-700 text-white rounded-full shadow hover:bg-red-700 transition"
                        title="Remove Avatar"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-700 shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-file-upload"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="avatar-file-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium rounded-lg cursor-pointer transition-all border border-zinc-200 dark:border-zinc-700"
                    >
                      Choose Visual File
                    </label>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">
                      JPEG, PNG or WebP representation base64 file under 1.5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Info area */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 font-mono">
                  Corporate Parameters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. Lead Solutions Architect"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization || ""}
                      onChange={handleInputChange}
                      placeholder="e.g. Nexus Tech Solutions"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 font-mono">
                  Coordinates & Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      placeholder="sarah.jenkins@nexustech.io"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website || ""}
                      onChange={handleInputChange}
                      placeholder="https://nexustech.io"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Office/Mailing Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleInputChange}
                      placeholder="100 Pine Street, San Francisco, CA"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Socials Media Grid block */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 font-mono">
                  Online Social Anchors
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="social_linkedin"
                      value={formData.socials?.linkedin || ""}
                      onChange={handleInputChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Twitter (X) URL
                    </label>
                    <input
                      type="url"
                      name="social_twitter"
                      value={formData.socials?.twitter || ""}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/username"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      name="social_github"
                      value={formData.socials?.github || ""}
                      onChange={handleInputChange}
                      placeholder="https://github.com/username"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Instagram URL
                    </label>
                    <input
                      type="url"
                      name="social_instagram"
                      value={formData.socials?.instagram || ""}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/username"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-50 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-zinc-400"
                    />
                  </div>
                </div>
              </div>

              {/* Form Footer Action triggers */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-sm font-semibold rounded-xl transition-all shadow-md disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isSaving ? "Saving..." : "Save Card"}
                </button>
              </div>
            </form>

            {/* Desktop-only right hand Preview Column */}
            <div className="hidden lg:col-span-5 lg:block sticky top-0 space-y-4">
              <div className="text-center">
                <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono">
                  Live Dynamic Card Preview
                </span>
                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Check out visual presentation updates instantly
                </p>
              </div>
              <div className="pt-2 ring-1 ring-zinc-100 dark:ring-zinc-800 rounded-[2rem] p-4 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-center">
                <ContactCardPreview contact={formData} />
              </div>
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-start gap-1.5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  The public external card will utilize a premium focused dark layout optimised for mobile browsers, with standard native .vcf downloading.
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
