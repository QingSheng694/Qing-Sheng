import type { Contact } from "./types";

/**
 * Packs contact fields into a standard vCard v3.0 text blob and initiates the browser download.
 * Handles embedded photos/avatars natively by packing base64 content.
 */
export function downloadVCard(contact: Contact) {
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

  // Inject Base64 avatar if compliant
  if (contact.avatar && contact.avatar.startsWith("data:image/")) {
    const parts = contact.avatar.split(",");
    if (parts.length > 1) {
      const header = parts[0];
      const base64Data = parts[1];
      
      let type = "JPEG";
      if (header.includes("png")) type = "PNG";
      else if (header.includes("webp")) type = "WEBP";
      
      vcardLines.push(`PHOTO;TYPE=${type};ENCODING=b:${base64Data.replace(/\s/g, "")}`);
    }
  }

  // Inject socials
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
}

/**
 * Strips prefix from URL strings to output elegant labels
 */
export function cleanDisplayUrl(url?: string): string {
  if (!url) return "";
  return url.replace(/^https?:\/\/(www\.)?/, "");
}
