import whatsappLogo from "@/assets/whatsapp-logo.png";
import { useLocalizedChannelContent } from "@/i18n/channelI18n";
import { safeWhatsAppHref } from "@/data/channelContent";

export default function WhatsAppButton() {
  const content = useLocalizedChannelContent();
  const href = safeWhatsAppHref(content.brand.whatsappPhone);
  if (!href) return null;

  return (
    <a
      className="channel-whatsapp-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={content.contact.whatsappLabel}
      title={content.contact.whatsappLabel}
    >
      <img src={whatsappLogo} alt="" aria-hidden="true" />
    </a>
  );
}
