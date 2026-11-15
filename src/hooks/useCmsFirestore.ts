import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import { defaultSiteSettings } from "@/lib/defaultSiteSettings";
import { isLocalChannelPreview } from "@/hooks/useChannelContent";
import { defaultCmsStats } from "@/data/defaultStats";
import type {
  FirestoreBlogPost,
  FirestoreGalleryItem,
  FirestoreInquiry,
  FirestoreProduct,
  SiteSettings,
  FirestoreCareer,
  FirestoreTeamMember,
  FirestoreVideo,
  FirestoreCaseStudy,
  FirestoreKnowledgeBaseArticle,
  FirestoreStat,
  StatRow,
  FirestoreBrandPartner,
  FirestoreFeaturedIn,
} from "@/types/cms";

const SETTINGS_COL = "settings";
const SITE_DOC_ID = "site";
const LOCAL_EDITORIAL_PREFIX = "shiva-editorial-v1:";

function localEditorialMode() {
  return !getDb() && isLocalChannelPreview();
}

function readLocalRows<T>(collectionName: string): T[] {
  if (!localEditorialMode() || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(`${LOCAL_EDITORIAL_PREFIX}${collectionName}`);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch { return []; }
}

function writeLocalRows<T extends { id: string }>(collectionName: string, rows: T[]) {
  if (!localEditorialMode() || typeof window === "undefined") throw new Error("Local editing is available only on localhost.");
  window.localStorage.setItem(`${LOCAL_EDITORIAL_PREFIX}${collectionName}`, JSON.stringify(rows));
}

function useEditorialStorageSync(collectionName: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === `${LOCAL_EDITORIAL_PREFIX}${collectionName}`) {
        void qc.invalidateQueries({ queryKey: ["cms", collectionName] });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [collectionName, qc]);
}

function safeDocumentId(id: string) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(id)) throw new Error("Invalid document ID.");
  return id;
}

function safeImageSource(value: string, optional = false) {
  if (!value.trim()) {
    if (optional) return "";
    throw new Error("Add an image.");
  }
  if (/^\/images\/[A-Za-z0-9/_ .-]+$/.test(value) && !value.includes("..")) return value;
  if (/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length <= 800_000) return value;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch { /* rejected below */ }
  throw new Error("Use an HTTPS image URL or upload an image.");
}

function safeOptionalHttpsUrl(value: string | undefined) {
  if (!value?.trim()) return "";
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch { /* rejected below */ }
  throw new Error("Use an HTTPS link URL.");
}

function requireDb() {
  const db = getDb();
  if (!db) {
    throw new Error(
      "Firebase is not configured. In Vercel → Settings → Environment Variables, add every VITE_FIREBASE_* key from .env.example, then redeploy.",
    );
  }
  return db;
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["cms", "settings", SITE_DOC_ID],
    queryFn: async (): Promise<SiteSettings> => {
      const db = getDb();
      if (!db) return defaultSiteSettings;
      const snap = await getDoc(doc(db, SETTINGS_COL, SITE_DOC_ID));
      if (!snap.exists()) return defaultSiteSettings;
      return { ...defaultSiteSettings, ...(snap.data() as Partial<SiteSettings>) };
    },
    staleTime: 60_000,
  });
}

export function useSaveSiteSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SiteSettings) => {
      const db = requireDb();
      await setDoc(doc(db, SETTINGS_COL, SITE_DOC_ID), data, { merge: true });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "settings", SITE_DOC_ID] });
    },
  });
}

export function usePublishedFirestoreBlogPosts() {
  useEditorialStorageSync("blogPosts");
  return useQuery({
    queryKey: ["cms", "blogPosts", "published"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return readLocalRows<AdminBlogRow>("blogPosts").filter((row) => row.status === "published");
      const q = query(collection(db, "blogPosts"), where("status", "==", "published"));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as FirestoreBlogPost) }));
    },
    staleTime: 30_000,
  });
}

export function useFirestoreBlogPost(slug: string | undefined) {
  useEditorialStorageSync("blogPosts");
  return useQuery({
    queryKey: ["cms", "blogPosts", "one", slug],
    enabled: !!slug,
    queryFn: async () => {
      if (!slug) return null;
      const db = getDb();
      if (!db) return readLocalRows<AdminBlogRow>("blogPosts").find((row) => row.slug === slug && row.status === "published") ?? null;
      try {
        const snap = await getDoc(doc(db, "blogPosts", slug));
        if (!snap.exists()) return null;
        const data = snap.data() as FirestoreBlogPost;
        if (data.status !== "published") return null;
        return { id: snap.id, ...data };
      } catch {
        return null;
      }
    },
    staleTime: 30_000,
  });
}

export type AdminBlogRow = FirestoreBlogPost & { id: string };

export function useAdminBlogPosts() {
  useEditorialStorageSync("blogPosts");
  return useQuery({
    queryKey: ["cms", "blogPosts", "admin"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return readLocalRows<AdminBlogRow>("blogPosts");
      const snap = await getDocs(collection(db, "blogPosts"));
      const rows: AdminBlogRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreBlogPost),
      }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
  });
}

export function useSaveBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: FirestoreBlogPost) => {
      const id = payload.slug.trim();
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) throw new Error("Use a lowercase URL slug with letters, numbers and hyphens.");
      if (!payload.title.trim() || !payload.content.trim()) throw new Error("Title and content are required.");
      safeImageSource(payload.imageUrl, true);
      if (payload.status !== "draft" && payload.status !== "published") throw new Error("Invalid post status.");
      if (localEditorialMode()) {
        const rows = readLocalRows<AdminBlogRow>("blogPosts");
        writeLocalRows("blogPosts", [{ ...payload, id, slug: id }, ...rows.filter((row) => row.id !== id)]);
        return;
      }
      const db = requireDb();
      const ref = doc(db, "blogPosts", id);
      const existing = await getDoc(ref);
      const data: Record<string, unknown> = {
        slug: id,
        title: payload.title,
        excerpt: payload.excerpt,
        content: payload.content,
        category: payload.category,
        date: payload.date,
        author: payload.author,
        readTime: payload.readTime,
        imageUrl: payload.imageUrl,
        status: payload.status,
      };
      if (!existing.exists()) {
        data.createdAt = serverTimestamp();
      }
      await setDoc(ref, data, { merge: true });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "blogPosts"] });
    },
  });
}

export function useDeleteBlogPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      safeDocumentId(id);
      if (localEditorialMode()) {
        writeLocalRows("blogPosts", readLocalRows<AdminBlogRow>("blogPosts").filter((row) => row.id !== id));
        return;
      }
      const db = requireDb();
      await deleteDoc(doc(db, "blogPosts", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "blogPosts"] });
    },
  });
}

export type GalleryRow = FirestoreGalleryItem & { id: string };

export function useGalleryItems() {
  return useQuery({
    queryKey: ["cms", "galleryItems"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return [];
      const snap = await getDocs(collection(db, "galleryItems"));
      const rows: GalleryRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreGalleryItem),
      }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
  });
}

export function useSaveGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreGalleryItem }) => {
      const db = requireDb();
      if (payload.id) {
        await updateDoc(doc(db, "galleryItems", payload.id), {
          title: payload.data.title,
          category: payload.data.category,
          imageUrl: payload.data.imageUrl,
          type: payload.data.type,
          ...(payload.data.videoUrl !== undefined ? { videoUrl: payload.data.videoUrl } : {}),
        });
        return;
      }
      await addDoc(collection(db, "galleryItems"), {
        ...payload.data,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "galleryItems"] });
    },
  });
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = requireDb();
      await deleteDoc(doc(db, "galleryItems", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "galleryItems"] });
    },
  });
}

export type ProductRow = FirestoreProduct & { id: string };

export function useProducts() {
  return useQuery({
    queryKey: ["cms", "products"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return [];
      const snap = await getDocs(collection(db, "products"));
      const rows: ProductRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreProduct),
      }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
  });
}

export function useSaveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreProduct }) => {
      const db = requireDb();
      if (payload.id) {
        await updateDoc(doc(db, "products", payload.id), {
          name: payload.data.name,
          category: payload.data.category,
          price: payload.data.price,
          stock: payload.data.stock,
          description: payload.data.description,
          ...(payload.data.href !== undefined ? { href: payload.data.href } : {}),
          imageUrl: payload.data.imageUrl ?? "",
        });
        return;
      }
      await addDoc(collection(db, "products"), {
        ...payload.data,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "products"] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = requireDb();
      await deleteDoc(doc(db, "products", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "products"] });
    },
  });
}

export type InquiryRow = Omit<FirestoreInquiry, "createdAt"> & {
  id: string;
  createdAt: Timestamp;
};

export function useInquiries() {
  return useQuery({
    queryKey: ["cms", "inquiries"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return [];
      const snap = await getDocs(collection(db, "inquiries"));
      const rows: InquiryRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreInquiry),
      }));
      rows.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      return rows;
    },
  });
}

export function useUpdateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<FirestoreInquiry> }) => {
      const db = requireDb();
      await updateDoc(doc(db, "inquiries", id), patch);
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "inquiries"] });
    },
  });
}

export function useDeleteInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = requireDb();
      await deleteDoc(doc(db, "inquiries", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "inquiries"] });
    },
  });
}

export type CareerRow = FirestoreCareer & { id: string };

export function useCareers() {
  return useQuery({
    queryKey: ["cms", "careers"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return [];
      const snap = await getDocs(collection(db, "careers"));
      const rows: CareerRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreCareer),
      }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
  });
}

export function useSaveCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreCareer }) => {
      const db = requireDb();
      if (payload.id) {
        await updateDoc(doc(db, "careers", payload.id), {
          title: payload.data.title,
          location: payload.data.location,
          type: payload.data.type,
          experience: payload.data.experience,
          description: payload.data.description,
        });
        return;
      }
      await addDoc(collection(db, "careers"), {
        ...payload.data,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "careers"] });
    },
  });
}

export function useDeleteCareer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = requireDb();
      await deleteDoc(doc(db, "careers", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "careers"] });
    },
  });
}

export type TeamMemberRow = FirestoreTeamMember & { id: string };

export function useTeamMembers() {
  useEditorialStorageSync("teamMembers");
  return useQuery({
    queryKey: ["cms", "teamMembers"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return readLocalRows<TeamMemberRow>("teamMembers");
      const snap = await getDocs(collection(db, "teamMembers"));
      const rows: TeamMemberRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreTeamMember),
      }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
  });
}

export function useSaveTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreTeamMember }) => {
      if (!payload.data.name.trim() || !payload.data.role.trim()) throw new Error("Name and role are required.");
      if (payload.data.image) safeImageSource(payload.data.image, true);
      for (const value of Object.values(payload.data.social ?? {})) if (value) safeOptionalHttpsUrl(value);
      if (payload.id) safeDocumentId(payload.id);
      if (localEditorialMode()) {
        const id = payload.id ?? crypto.randomUUID();
        writeLocalRows("teamMembers", [{ ...payload.data, id }, ...readLocalRows<TeamMemberRow>("teamMembers").filter((row) => row.id !== id)]);
        return;
      }
      const db = requireDb();
      const docData: Record<string, unknown> = {
        name: payload.data.name,
        role: payload.data.role,
        image: payload.data.image,
        bio: payload.data.bio,
      };
      if (payload.data.social) {
        docData.social = payload.data.social;
      }
      if (payload.id) {
        await updateDoc(doc(db, "teamMembers", payload.id), docData);
        return;
      }
      await addDoc(collection(db, "teamMembers"), {
        ...docData,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "teamMembers"] });
    },
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      safeDocumentId(id);
      if (localEditorialMode()) {
        writeLocalRows("teamMembers", readLocalRows<TeamMemberRow>("teamMembers").filter((row) => row.id !== id));
        return;
      }
      const db = requireDb();
      await deleteDoc(doc(db, "teamMembers", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "teamMembers"] });
    },
  });
}

export type BrandPartnerRow = FirestoreBrandPartner & { id: string };

export function useBrandPartners() {
  return useQuery({
    queryKey: ["cms", "brandPartners"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return [];
      const snap = await getDocs(collection(db, "brandPartners"));
      const rows: BrandPartnerRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreBrandPartner),
      }));
      rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return rows;
    },
  });
}

export function useSaveBrandPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreBrandPartner }) => {
      const db = requireDb();
      const data = {
        name: payload.data.name,
        logo: payload.data.logo,
        website: payload.data.website ?? "",
        order: Number(payload.data.order),
      };
      if (payload.id) {
        await updateDoc(doc(db, "brandPartners", payload.id), data);
        return;
      }
      await addDoc(collection(db, "brandPartners"), { ...data, createdAt: serverTimestamp() });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "brandPartners"] });
    },
  });
}

export function useDeleteBrandPartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = requireDb();
      await deleteDoc(doc(db, "brandPartners", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "brandPartners"] });
    },
  });
}

export type VideoRow = FirestoreVideo & { docId?: string };

const LOCAL_VIDEOS_KEY = "shiva-channel-videos-v1";

function localVideos(): VideoRow[] {
  try {
    const stored = localStorage.getItem(LOCAL_VIDEOS_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed as VideoRow[] : [];
    }
  } catch { /* Continue with no local overrides. */ }
  return [];
}

function saveLocalVideos(videos: VideoRow[]) {
  localStorage.setItem(LOCAL_VIDEOS_KEY, JSON.stringify(videos));
  window.dispatchEvent(new Event("channel-videos-changed"));
}

export function useVideos() {
  const qc = useQueryClient();
  useEffect(() => {
    if (!isLocalChannelPreview()) return;
    const refresh = () => { void qc.invalidateQueries({ queryKey: ["cms", "videos"] }); };
    window.addEventListener("storage", refresh);
    window.addEventListener("channel-videos-changed", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("channel-videos-changed", refresh); };
  }, [qc]);
  return useQuery({
    queryKey: ["cms", "videos"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return isLocalChannelPreview() ? localVideos() : [];
      const snap = await getDocs(collection(db, "videos"));
      const rows: VideoRow[] = snap.docs.map((d) => ({
        ...(d.data() as FirestoreVideo),
        id: (d.data() as FirestoreVideo).id || d.id,
        docId: d.id,
      }));
      rows.sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER) || (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useSaveVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreVideo }) => {
      const db = getDb();
      if (!db && isLocalChannelPreview()) {
        const next = localVideos().filter((video) => video.id !== payload.id && video.id !== payload.data.id);
        next.push({ ...payload.data });
        saveLocalVideos(next);
        return;
      }
      if (!db) requireDb();
      const activeDb = db!;
      const key = payload.data.id.trim();
      const data = {
        id: key,
        title: payload.data.title,
        category: payload.data.category,
        hidden: Boolean(payload.data.hidden),
        order: typeof payload.data.order === "number" && Number.isFinite(payload.data.order) ? payload.data.order : deleteField(),
        ...(!payload.id || payload.id !== key ? { createdAt: serverTimestamp() } : {}),
      };
      if (payload.id && payload.id !== key) {
        const batch = writeBatch(activeDb);
        batch.set(doc(activeDb, "videos", key), data, { merge: true });
        batch.delete(doc(activeDb, "videos", payload.id));
        await batch.commit();
      } else {
        await setDoc(doc(activeDb, "videos", key), data, { merge: true });
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "videos"] });
    },
  });
}

export function useDeleteVideo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = getDb();
      if (!db && isLocalChannelPreview()) {
        saveLocalVideos(localVideos().filter((video) => video.id !== id));
        return;
      }
      if (!db) requireDb();
      await deleteDoc(doc(db!, "videos", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "videos"] });
    },
  });
}

export type CaseStudyRow = FirestoreCaseStudy & { id: string };

export function useCaseStudies() {
  useEditorialStorageSync("caseStudies");
  return useQuery({
    queryKey: ["cms", "caseStudies"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return readLocalRows<CaseStudyRow>("caseStudies");
      const snap = await getDocs(collection(db, "caseStudies"));
      const rows: CaseStudyRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreCaseStudy),
      }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
  });
}

export function useSaveCaseStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreCaseStudy }) => {
      if (!payload.data.title.trim()) throw new Error("Title is required.");
      safeImageSource(payload.data.imageUrl ?? "", true);
      if (payload.id) safeDocumentId(payload.id);
      if (localEditorialMode()) {
        const id = payload.id ?? crypto.randomUUID();
        writeLocalRows("caseStudies", [{ ...payload.data, id }, ...readLocalRows<CaseStudyRow>("caseStudies").filter((row) => row.id !== id)]);
        return;
      }
      const db = requireDb();
      if (payload.id) {
        await updateDoc(doc(db, "caseStudies", payload.id), {
          title: payload.data.title,
          category: payload.data.category,
          location: payload.data.location,
          farmer: payload.data.farmer,
          challenge: payload.data.challenge,
          solution: payload.data.solution,
          results: payload.data.results,
          imageUrl: payload.data.imageUrl ?? "",
        });
        return;
      }
      await addDoc(collection(db, "caseStudies"), {
        ...payload.data,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "caseStudies"] });
    },
  });
}

export function useDeleteCaseStudy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      safeDocumentId(id);
      if (localEditorialMode()) {
        writeLocalRows("caseStudies", readLocalRows<CaseStudyRow>("caseStudies").filter((row) => row.id !== id));
        return;
      }
      const db = requireDb();
      await deleteDoc(doc(db, "caseStudies", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "caseStudies"] });
    },
  });
}

export type FeaturedInRow = FirestoreFeaturedIn & { id: string };

export function useFeaturedIn() {
  useEditorialStorageSync("featuredIn");
  return useQuery({
    queryKey: ["cms", "featuredIn"],
    queryFn: async (): Promise<FeaturedInRow[]> => {
      const db = getDb();
      if (!db) return readLocalRows<FeaturedInRow>("featuredIn");
      const snap = await getDocs(collection(db, "featuredIn"));
      const rows: FeaturedInRow[] = snap.docs.map((item) => ({ id: item.id, ...(item.data() as FirestoreFeaturedIn) }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useSaveFeaturedIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreFeaturedIn }) => {
      const title = payload.data.title.trim();
      const source = payload.data.source.trim();
      if (!title || !source) throw new Error("Title and source are required.");
      // Uploaded images are stored inline in this document. Clearing or replacing
      // the field removes the previous upload when the document is saved.
      const imageUrl = safeImageSource(payload.data.imageUrl.trim(), true);
      const logoUrl = safeImageSource(payload.data.logoUrl?.trim() ?? "", true);
      const showInSlider = payload.data.showInSlider !== false;
      const linkUrl = safeOptionalHttpsUrl(payload.data.linkUrl);
      const date = payload.data.date?.trim() ?? "";
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Use a valid date.");
      const data: FirestoreFeaturedIn = { title, source, imageUrl, logoUrl, showInSlider, linkUrl, date };
      if (JSON.stringify(data).length > 900_000) throw new Error("These two images are too large together. Use a smaller logo or clipping.");
      if (payload.id) safeDocumentId(payload.id);
      if (localEditorialMode()) {
        const id = payload.id ?? crypto.randomUUID();
        writeLocalRows("featuredIn", [{ ...data, id }, ...readLocalRows<FeaturedInRow>("featuredIn").filter((row) => row.id !== id)]);
        return;
      }
      const db = requireDb();
      if (payload.id) {
        await updateDoc(doc(db, "featuredIn", payload.id), data);
      } else {
        await addDoc(collection(db, "featuredIn"), { ...data, createdAt: serverTimestamp() });
      }
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["cms", "featuredIn"] }); },
  });
}

export function useDeleteFeaturedIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      safeDocumentId(id);
      if (localEditorialMode()) {
        writeLocalRows("featuredIn", readLocalRows<FeaturedInRow>("featuredIn").filter((row) => row.id !== id));
        return;
      }
      await deleteDoc(doc(requireDb(), "featuredIn", id));
    },
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["cms", "featuredIn"] }); },
  });
}

export type KnowledgeBaseArticleRow = FirestoreKnowledgeBaseArticle & { id: string };

export function useKnowledgeBaseArticles() {
  return useQuery({
    queryKey: ["cms", "knowledgeBaseArticles"],
    queryFn: async () => {
      const db = getDb();
      if (!db) return [];
      const snap = await getDocs(collection(db, "knowledgeBaseArticles"));
      const rows: KnowledgeBaseArticleRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreKnowledgeBaseArticle),
      }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      return rows;
    },
  });
}

export function useSaveKnowledgeBaseArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreKnowledgeBaseArticle }) => {
      const db = requireDb();
      if (payload.id) {
        await updateDoc(doc(db, "knowledgeBaseArticles", payload.id), {
          title: payload.data.title,
          category: payload.data.category,
          readTime: payload.data.readTime,
        });
        return;
      }
      await addDoc(collection(db, "knowledgeBaseArticles"), {
        ...payload.data,
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "knowledgeBaseArticles"] });
    },
  });
}

export function useDeleteKnowledgeBaseArticle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = requireDb();
      await deleteDoc(doc(db, "knowledgeBaseArticles", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "knowledgeBaseArticles"] });
    },
  });
}

export function useFirestoreStats() {
  return useQuery({
    queryKey: ["cms", "stats"],
    queryFn: async (): Promise<StatRow[]> => {
      const db = getDb();
      if (!db) return [];
      const snap = await getDocs(collection(db, "stats"));
      const rows: StatRow[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as FirestoreStat),
      }));
      const savedById = new Map(rows.map((item) => [item.id, item]));
      const merged = defaultCmsStats.map((item) => savedById.get(item.id) ?? item);
      const defaultIds = new Set(defaultCmsStats.map((item) => item.id));
      merged.push(...rows.filter((item) => !defaultIds.has(item.id)));
      merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      return merged;
    },
  });
}

export function useSaveStat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id?: string; data: FirestoreStat }) => {
      const db = requireDb();
      if (payload.id) {
        await setDoc(doc(db, "stats", payload.id), {
          type: payload.data.type,
          label: payload.data.label,
          value: String(payload.data.value),
          suffix: payload.data.suffix || "",
          subtext: payload.data.subtext || "",
          iconName: payload.data.iconName,
          color: payload.data.color || "",
          bgColor: payload.data.bgColor || "",
          order: Number(payload.data.order),
        }, { merge: true });
        return;
      }
      await addDoc(collection(db, "stats"), {
        ...payload.data,
        value: String(payload.data.value),
        order: Number(payload.data.order),
        createdAt: serverTimestamp(),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "stats"] });
    },
  });
}

export function useDeleteStat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const db = requireDb();
      await deleteDoc(doc(db, "stats", id));
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["cms", "stats"] });
    },
  });
}
