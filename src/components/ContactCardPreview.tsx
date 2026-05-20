import { Mail, Phone, MapPin, Globe, Building, Linkedin, Twitter, Github, Instagram } from "lucide-react";
import type { Contact } from "../types";

interface PreviewProps {
  contact: Partial<Contact>;
  showSocials?: boolean;
}

export default function ContactCardPreview({ contact, showSocials = true }: PreviewProps) {
  const {
    firstName = "",
    lastName = "",
    title = "",
    organization = "",
    email = "",
    phone = "",
    website = "",
    address = "",
    avatar = "",
    socials = { linkedin: "", twitter: "", github: "", instagram: "" }
  } = contact;

  const getInitials = () => {
    return `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`.toUpperCase() || "?";
  };

  const getCleanUrl = (url?: string) => {
    if (!url) return "";
    return url.replace(/^https?:\/\/(www\.)?/, "");
  };

  return (
    <div className="relative w-full max-w-sm mx-auto overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-xl transition-all duration-300">
      {/* Decorative Elite Brand Stripe Accent */}
      <div className="h-2.5 bg-gradient-to-r from-zinc-900 via-indigo-600 to-zinc-400" />

      {/* Hero Visual Area & Avatar container */}
      <div className="p-6 pb-2 select-none">
        <div className="flex items-start gap-4">
          {/* Avatar or Initials circular wrapper */}
          <div className="relative flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={`${firstName} ${lastName}`}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-zinc-100 dark:ring-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center font-display font-semibold text-zinc-700 dark:text-zinc-300 text-2xl shadow-inner">
                {getInitials()}
              </div>
            )}
            <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-zinc-950"></span>
            </span>
          </div>

          {/* Primary Name, Title, Org info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate tracking-tight">
              {firstName || lastName ? `${firstName} ${lastName}` : "Unnamed Professional"}
            </h3>
            {title && (
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                {title}
              </p>
            )}
            {organization && (
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1.5">
                <Building className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{organization}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Divider */}
      <div className="mx-6 border-b border-zinc-100 dark:border-zinc-800/80 my-2" />

      {/* Communications & Coordinates Detail List */}
      <div className="px-6 py-2 space-y-3">
        {email && (
          <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <a href={`mailto:${email}`} className="truncate hover:underline hover:text-indigo-600">
              {email}
            </a>
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              <Phone className="w-3.5 h-3.5" />
            </div>
            <a href={`tel:${phone}`} className="truncate hover:underline hover:text-indigo-600">
              {phone}
            </a>
          </div>
        )}

        {website && (
          <div className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <a href={website} target="_blank" rel="noopener noreferrer" className="truncate hover:underline hover:text-indigo-600 font-mono">
              {getCleanUrl(website)}
            </a>
          </div>
        )}

        {address && (
          <div className="flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-300">
            <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 flex items-center justify-center text-zinc-400 dark:text-zinc-500 mt-0.5 shrink-0">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="leading-relaxed text-zinc-500 dark:text-zinc-400 line-clamp-2">
              {address}
            </span>
          </div>
        )}
      </div>

      {/* Social Media Link Icons Strip */}
      {showSocials && (
        <>
          <div className="mx-6 border-b border-zinc-100 dark:border-zinc-800/80 my-2" />
          <div className="px-6 pb-6 pt-1 flex items-center gap-2">
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn Profile"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center justify-center transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter Profile"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 flex items-center justify-center transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Portfolio"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center justify-center transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram Handle"
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-400 flex items-center justify-center transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {!socials.linkedin && !socials.twitter && !socials.github && !socials.instagram && (
              <span className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-600 uppercase select-none">
                No Social Channels Connected
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
