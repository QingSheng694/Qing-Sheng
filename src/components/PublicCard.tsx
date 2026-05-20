import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Phone, Mail, MessageSquare, MapPin, Globe, Linkedin, Twitter, Github, Instagram, 
  ArrowLeft, Download, Share2, AlertTriangle, QrCode, Check, Copy
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { Contact } from "../types";

export default function PublicCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchContact = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("Invalid contact ID format.");
        }
        if (res.status === 404) {
          throw new Error("The requested digital business card was not found.");
        }
        throw new Error("Failed to load business card from server.");
      }
      const data = await res.json();
      setContact(data);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while loading card.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchContact();
    }
  }, [id]);

  const getInitials = (first = "", last = "") => {
    return `${first.charAt(0) || ""}${last.charAt(0) || ""}`.toUpperCase() || "?";
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareTitle = contact ? `${contact.firstName} ${contact.lastName} - Digital Business Card` : "CARDNET Digital Card";
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: `Scan or save my digital business card via CARDNET`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Navigator sharing dismissed or unavailable:", err);
        fallbackCopy(shareUrl);
      }
    } else {
      fallbackCopy(shareUrl);
    }
  };

  const fallbackCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadVCard = () => {
    if (!contact) return;

    const vcardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${contact.lastName || ""};${contact.firstName || ""};;;`,
      `FN:${contact.firstName || ""} ${contact.lastName || ""}`,
    ];

    if (contact.organization) vcardLines.push(`ORG:${contact.organization}`);
    if (contact.title) vcardLines.push(`TITLE:${contact.title}`);
    if (contact.phone) vcardLines.push(`TEL;TYPE=CELL,VOICE:${contact.phone}`);
    if (contact.email) vcardLines.push(`EMAIL;TYPE=PREF,INTERNET:${contact.email}`);
    if (contact.address) vcardLines.push(`ADR;TYPE=WORK:;;${contact.address};;;;`);
    if (contact.website) vcardLines.push(`URL:${contact.website}`);

    if (contact.avatar && contact.avatar.startsWith("data:image/")) {
      const parts = contact.avatar.split(",");
      if (parts.length > 1) {
        const header = parts[0];
        const base64Data = parts[1];
        
        let type = "JPEG";
        if (header.includes("png")) type = "PNG";
        else if (header.includes("webp")) type = "WEBP";
        
        // Strip spaces or linebreaks to keep layout parsed correctly in older standard files
        vcardLines.push(`PHOTO;TYPE=${type};ENCODING=b:${base64Data.replace(/\s/g, "")}`);
      }
    }

    if (contact.socials?.linkedin) vcardLines.push(`X-SOCIALPROFILE;TYPE=linkedin:${contact.socials.linkedin}`);
    if (contact.socials?.twitter) vcardLines.push(`X-SOCIALPROFILE;TYPE=twitter:${contact.socials.twitter}`);
    if (contact.socials?.github) vcardLines.push(`X-SOCIALPROFILE;TYPE=github:${contact.socials.github}`);
    if (contact.socials?.instagram) vcardLines.push(`X-SOCIALPROFILE;TYPE=instagram:${contact.socials.instagram}`);

    vcardLines.push("END:VCARD");

    const blob = new Blob([vcardLines.join("\r\n")], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${contact.firstName || "Contact"}_${contact.lastName || ""}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render Loader Area
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-zinc-800 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-xs font-mono tracking-widest text-zinc-400 uppercase select-none">
          Securing Card Connection...
        </p>
      </div>
    );
  }

  // Render Error Area if cards load fail
  if (errorMsg || !contact) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-red-500/20 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="font-display text-lg font-bold">Secure Card Error</h2>
        <p className="text-sm text-zinc-400 max-w-xs mt-2 leading-relaxed">
          {errorMsg || "We were unable to locate this CARDNET address in database indexes."}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 text-xs font-mono font-bold bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 hover:text-white text-zinc-300 transition-all uppercase"
          >
            Dashboard
          </button>
          <button
            onClick={fetchContact}
            className="px-4 py-2 text-xs font-mono font-bold bg-indigo-600 rounded-lg hover:bg-indigo-500 text-white transition-all uppercase"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { firstName, lastName, title, organization, email, phone, website, address, avatar, socials } = contact;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-0 sm:p-4 font-sans selection:bg-indigo-600/30 overflow-x-hidden relative">
      
      {/* Visual background atmospheric illumination glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-indigo-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-zinc-700/5 blur-[100px] pointer-events-none" />

      {/* Main Container tailored for Mobile First standard width */}
      <div className="w-full max-w-md bg-zinc-900/50 sm:bg-zinc-900 border-0 sm:border border-zinc-900 rounded-none sm:rounded-[2.5rem] shadow-2xl p-6 flex flex-col min-h-screen sm:min-h-[unset] relative overflow-hidden backdrop-blur-3xl">
        
        {/* Floating Header Back Navigation */}
        <div className="flex items-center justify-between mb-8 select-none z-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs font-mono tracking-wider font-semibold text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PORTAL</span>
          </button>
          
          <button
            onClick={() => setShowQr(!showQr)}
            className={`p-2 rounded-full border transition-all ${
              showQr 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                : "bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:text-white"
            }`}
            title="Scan Card QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Scan QR Code Layer */}
        {showQr && (
          <div className="mb-6 p-6 rounded-3xl bg-zinc-950 border border-zinc-800/80 flex flex-col items-center text-center select-none z-10 shadow-inner">
            <h3 className="font-display text-sm font-semibold text-zinc-200">Shared Digital QR Code</h3>
            <p className="text-[10px] text-zinc-500 mt-1 mb-4">Let others scan this image to instantly sync your profile card.</p>
            <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <QRCodeSVG
                value={window.location.href}
                size={160}
                bgColor="#FFFFFF"
                fgColor="#09090b"
                level="M"
                includeMargin={false}
              />
            </div>
            <button
              onClick={() => fallbackCopy(window.location.href)}
              className="mt-4 flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium font-mono"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "COPIED VALUE!" : "COPY SHARING LINK"}</span>
            </button>
          </div>
        )}

        {/* Top Profile Summary block */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          
          {/* Avatar frame */}
          <div className="relative mb-4">
            {avatar ? (
              <img
                src={avatar}
                alt={`${firstName} ${lastName}`}
                className="w-28 h-28 rounded-[2rem] object-cover border-2 border-zinc-800 ring-4 ring-zinc-900/80 shadow-2xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-zinc-800 to-zinc-900 border-2 border-zinc-700/50 ring-4 ring-zinc-900/80 flex items-center justify-center font-display font-semibold text-zinc-200 text-3xl shadow-2xl">
                {getInitials(firstName, lastName)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 border-2 border-zinc-900" />
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold tracking-tight text-white">
            {firstName} {lastName}
          </h1>
          {title && (
            <p className="text-zinc-400 text-sm font-medium mt-1">
              {title}
            </p>
          )}
          {organization && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400 mt-2.5">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              {organization}
            </span>
          )}
        </div>

        {/* Middle Quick Actions Grid (Call, Email, SMS, Map Pin) */}
        <div className="grid grid-cols-4 gap-3 mb-8 relative z-10 select-none">
          {/* Call action */}
          <a
            href={phone ? `tel:${phone}` : "#"}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              phone 
                ? "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 text-zinc-100" 
                : "bg-zinc-900/20 border-zinc-900/40 text-zinc-600 cursor-not-allowed opacity-40"
            }`}
            onClick={(e) => !phone && e.preventDefault()}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${phone ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-950 text-zinc-600'}`}>
              <Phone className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-wider font-mono">CALL</span>
          </a>

          {/* Email action */}
          <a
            href={email ? `mailto:${email}` : "#"}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              email 
                ? "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 text-zinc-100" 
                : "bg-zinc-900/20 border-zinc-900/40 text-zinc-600 cursor-not-allowed opacity-40"
            }`}
            onClick={(e) => !email && e.preventDefault()}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${email ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-950 text-zinc-600'}`}>
              <Mail className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-wider font-mono">EMAIL</span>
          </a>

          {/* SMS text */}
          <a
            href={phone ? `sms:${phone}` : "#"}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              phone 
                ? "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 text-zinc-100" 
                : "bg-zinc-900/20 border-zinc-900/40 text-zinc-600 cursor-not-allowed opacity-40"
            }`}
            onClick={(e) => !phone && e.preventDefault()}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${phone ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-950 text-zinc-600'}`}>
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-wider font-mono">SMS</span>
          </a>

          {/* Map Nav pin */}
          <a
            href={address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
              address 
                ? "bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800 text-zinc-100" 
                : "bg-zinc-900/20 border-zinc-900/40 text-zinc-600 cursor-not-allowed opacity-40"
            }`}
            onClick={(e) => !address && e.preventDefault()}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${address ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-950 text-zinc-600'}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-semibold tracking-wider font-mono">MAP</span>
          </a>
        </div>

        {/* Lower section Social Media Tiles with Frosted Glass styling */}
        <div className="space-y-3 relative z-10 mb-8 flex-1">
          <h2 className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold mb-2">Connect Channels</h2>

          {/* Website Link */}
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-zinc-200 hover:text-white transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-zinc-400 font-medium">Corporate Site</span>
                  <span className="block text-xs font-semibold font-mono truncate">{website}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold font-mono text-zinc-500">VISIT</span>
            </a>
          )}

          {/* LinkedIn Profile */}
          {socials?.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-zinc-200 hover:text-white transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Linkedin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-zinc-400 font-medium font-sans">LinkedIn</span>
                  <span className="block text-xs font-semibold font-mono truncate">{socials.linkedin}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold font-mono text-zinc-500">FOLLOW</span>
            </a>
          )}

          {/* Twitter Profile */}
          {socials?.twitter && (
            <a
              href={socials.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-zinc-200 hover:text-white transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
                  <Twitter className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-zinc-400 font-medium">Twitter (X)</span>
                  <span className="block text-xs font-semibold font-mono truncate">{socials.twitter}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold font-mono text-zinc-500">FOLLOW</span>
            </a>
          )}

          {/* GitHub Portfolio */}
          {socials?.github && (
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-zinc-200 hover:text-white transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-zinc-400/10 border border-zinc-200/20 flex items-center justify-center text-zinc-200">
                  <Github className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-zinc-400 font-medium">GitHub Repository</span>
                  <span className="block text-xs font-semibold font-mono truncate">{socials.github}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold font-mono text-zinc-500">REVIEW</span>
            </a>
          )}

          {/* Instagram Handle */}
          {socials?.instagram && (
            <a
              href={socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/15 hover:bg-white/10 text-zinc-200 hover:text-white transition-all backdrop-blur-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-400/20 flex items-center justify-center text-pink-400">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs text-zinc-400 font-medium">Instagram</span>
                  <span className="block text-xs font-semibold font-mono truncate">{socials.instagram}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold font-mono text-zinc-500">VISUALS</span>
            </a>
          )}

          {/* Empty Placeholders fallback if none exists */}
          {!website && !socials?.linkedin && !socials?.twitter && !socials?.github && !socials?.instagram && (
            <div className="text-center py-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 p-6 flex flex-col items-center select-none">
              <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">No Social Media Connected</span>
              <p className="text-zinc-500 text-[11px] mt-1">This user hasn't added links check indicators to Twitter, Github or LinkedIn.</p>
            </div>
          )}
        </div>

        {/* Address Row on page bottom if exists */}
        {address && (
          <div className="mb-6 p-4 rounded-2xl bg-zinc-950 border border-zinc-900/80 text-center select-none z-10">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-semibold">HQ Physical Office Address</span>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed font-sans">{address}</p>
          </div>
        )}

        {/* Dynamic Primary Actions sticky bottom block */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-zinc-800 z-10 selection:bg-indigo-600 selection:text-white">
          
          <button
            onClick={handleDownloadVCard}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-semibold tracking-wider uppercase font-mono rounded-xl cursor-pointer transition-all shadow-md shrink-0"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Add to Contact</span>
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold tracking-wider font-mono uppercase rounded-xl cursor-pointer transition-all border shrink-0 ${
              copiedLink 
                ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" 
                : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white"
            }`}
          >
            <Share2 className="w-4 h-4 shrink-0" />
            <span>{copiedLink ? "COPIED URL!" : "Share Profile"}</span>
          </button>
        </div>

        {/* Brand System watermark label */}
        <div className="text-center mt-6 text-[9px] font-mono tracking-widest text-zinc-600 select-none">
          SECURED BY CARDNET ENCRYPTED ENVELOPE
        </div>

      </div>
    </div>
  );
}
