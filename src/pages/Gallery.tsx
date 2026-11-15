import { Layout } from "@/components/layout";
import SEO from "@/components/SEO";
import { PhotoGallery } from "@/components/channel/PhotoGallery";
import { editorialText } from "@/components/channel/editorialCopy";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Gallery() {
  const { language } = useLanguage();
  const t = editorialText(language);

  return <Layout>
    <SEO title={t.gallery} description="Photos of Shiva Agri Clinic field visits, farmers and agriculture stories across Telangana and India." keywords="Shiva Agri Clinic gallery, farming photos, farmers Telangana, agriculture field visits" />
    <PhotoGallery />
  </Layout>;
}
