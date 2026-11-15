import { Instagram, Linkedin, Youtube } from "lucide-react";
import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { editorialText, safeEditorialLink } from "@/components/channel/editorialCopy";
import { useTeamMembers } from "@/hooks/useCmsFirestore";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Team() {
  const { language } = useLanguage();
  const t = editorialText(language);
  const { data: members = [], isPending, isError } = useTeamMembers();

  return (
    <Layout>
      <SEO title={t.team} description="Meet the people behind Shiva Agri Clinic and its farming stories from the field." keywords="Shiva Agri Clinic team, agriculture YouTube team, farming stories India" />
      <section className="channel-editorial-hero">
        <div className="channel-shell"><span className="channel-eyebrow">{t.teamEyebrow}</span><h1>{t.team}</h1><p>{t.teamIntro}</p></div>
      </section>
      <section className="channel-editorial-content">
        <div className="channel-shell">
          {isPending ? <p className="channel-editorial-empty" role="status">{t.loading}</p> : isError ? <p className="channel-editorial-empty" role="alert">{t.unable}</p> : members.length ? (
            <div className="channel-team-grid">
              {members.map((member) => (
                <article className="channel-team-card" key={member.id}>
                  <div className="channel-team-image">{member.image ? <img src={member.image} alt={member.name} loading="lazy" /> : <span aria-hidden="true">{member.name.charAt(0)}</span>}</div>
                  <div className="channel-team-info"><span className="channel-team-role">{member.role}</span><h2>{member.name}</h2>{member.bio && <p>{member.bio}</p>}
                    {member.social && <div className="channel-team-socials">
                      {safeEditorialLink(member.social.youtube) && <a href={safeEditorialLink(member.social.youtube)!} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on YouTube`}><Youtube size={18} /></a>}
                      {safeEditorialLink(member.social.instagram) && <a href={safeEditorialLink(member.social.instagram)!} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on Instagram`}><Instagram size={18} /></a>}
                      {safeEditorialLink(member.social.linkedin) && <a href={safeEditorialLink(member.social.linkedin)!} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} on LinkedIn`}><Linkedin size={18} /></a>}
                    </div>}
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="channel-editorial-empty">{t.teamEmpty}</p>}
        </div>
      </section>
    </Layout>
  );
}
