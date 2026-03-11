import React, { FC } from "react";
import { ICONS_HE } from "../../../../mockdata/icons";
import { AboutBlock } from "@/components/models/about.models";

export const uid = () =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

export const CTA_SECTION_ID = "__cta_section__";

export type FeatureItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type BulletItem = {
  id: string;
  text: string;
};

export type ImageItem = {
  url: string;
  isPreview?: boolean;
};

export type SectionType = {
  id: string;
  type: "features" | "bullets" | "intro" | "paragraph" | "cta";
  title: string;
  content?: string;
  features?: FeatureItem[];
  bullets?: BulletItem[];
};

export type FieldKind =
  | "sectionTitle"
  | "introContent"
  | "paragraphContent"
  | "featuresTitle"
  | "bulletsTitle"
  | "featureTitle"
  | "featureDescription"
  | "featureIcon"
  | "featureCard"
  | "bulletText";

export type AddableSectionType = "features" | "bullets" | "paragraph";


export const getHeaderOffset = () => {
  const header = document.querySelector("header");
  const h = header?.getBoundingClientRect().height ?? 0;
  return h + 16;
};

export const clampDropIndex = (arr: SectionType[], dropIndex: number) => {
  return Math.max(0, Math.min(dropIndex, arr.length));
};

export const reorderSections = (
  sections: SectionType[],
  from: number,
  toRaw: number,
): SectionType[] => {
  const arr = [...sections];
  const [moved] = arr.splice(from, 1);

  const adjustedTo =
    toRaw === sections.length ? arr.length : from < toRaw ? toRaw - 1 : toRaw;

  const to = clampDropIndex(arr, adjustedTo);
  arr.splice(to, 0, moved);

  return arr;
};

export const mkKey = (
  kind: FieldKind,
  sectionId: string,
  itemId?: string,
) => [kind, sectionId, itemId].filter(Boolean).join("::");

export const isBlank = (v?: string | null) => !v || v.trim().length === 0;

export const isSectionFilledEnough = (s: SectionType) => {
  if (s.type === "cta") return true;
  if (isBlank(s.title)) return false;

  if (s.type === "intro" || s.type === "paragraph") {
    return !isBlank(s.content);
  }

  if (s.type === "features") {
    const features = s.features ?? [];
    if (features.length === 0) return false;
    return features.every(
      (f) => !isBlank(f.title) && !isBlank(f.description),
    );
  }

  if (s.type === "bullets") {
    const bullets = s.bullets ?? [];
    if (bullets.length === 0) return false;
    return bullets.every((b) => !isBlank(b.text));
  }

  return true;
};

export const createNewSection = (
  type: AddableSectionType,
): SectionType => {
  if (type === "features") {
    return {
      id: `features-${Date.now()}`,
      type: "features",
      title: "",
      features: [
        {
          id: uid(),
          icon: "star",
          title: "",
          description: "",
        },
      ],
    };
  }

  if (type === "bullets") {
    return {
      id: `bullets-${Date.now()}`,
      type: "bullets",
      title: "",
      bullets: [{ id: uid(), text: "" }],
    };
  }

  return {
    id: `paragraph-${Date.now()}`,
    type: "paragraph",
    title: "",
    content: "",
  };
};

export const ensureCtaSection = (
  sections: SectionType[],
): SectionType[] => {
  const hasCta = sections.some((s) => s.type === "cta");

  return hasCta
    ? sections
    : [...sections, { id: CTA_SECTION_ID, type: "cta", title: "" }];
};

export const focusFirstFieldInSection = (el: HTMLDivElement) => {
  const field = el.querySelector("input, textarea, select") as
    | HTMLInputElement
    | HTMLTextAreaElement
    | HTMLSelectElement
    | null;

  if (!field) return;

  field.focus();

  if (
    field instanceof HTMLInputElement ||
    field instanceof HTMLTextAreaElement
  ) {
    field.select?.();
  }
};

export const scrollToSectionAndFocus = (
  sectionId: string | null,
  sections: SectionType[],
  sectionRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
  clearPending: () => void,
) => {
  if (!sectionId) return;

  requestAnimationFrame(() => {
    const idx = sections.findIndex((s) => s.id === sectionId);
    const el = idx === -1 ? null : sectionRefs.current[idx];

    if (el) {
      const y =
        el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
      window.scrollTo({ top: y, behavior: "smooth" });
      setTimeout(() => focusFirstFieldInSection(el), 250);
    }

    clearPending();
  });
};

export const revokePreviewUrls = (images: ImageItem[]) => {
  images
    .filter((image) => image.isPreview)
    .forEach((image) => URL.revokeObjectURL(image.url));
};

export const normalizeImageIndex = (
  currentIndex: number,
  imagesLength: number,
): number => {
  if (imagesLength === 0) return 0;

  if (
    Number.isNaN(currentIndex) ||
    currentIndex < 0 ||
    currentIndex >= imagesLength
  ) {
    return 0;
  }

  return currentIndex;
};

export const blocksToSections = (blocks: AboutBlock[]): SectionType[] => {
  return blocks.map((b) => {
    if (b.type === "intro") {
      return {
        id: b.id,
        type: "intro",
        title: b.data?.title ?? "",
        content: b.data?.content ?? "",
      };
    }

    if (b.type === "features") {
      return {
        id: b.id,
        type: "features",
        title: b.data?.title ?? "",
        features: (b.data?.features ?? []).map((f: any) => ({
          id: f.id ?? uid(),
          icon: f.icon ?? "star",
          title: f.title ?? "",
          description: f.description ?? "",
        })),
      };
    }

    if (b.type === "paragraph") {
      return {
        id: b.id,
        type: "paragraph",
        title: b.data?.title ?? "",
        content: b.data?.content ?? "",
      };
    }

    if (b.type === "cta") {
      return {
        id: b.id,
        type: "cta",
        title: "",
      };
    }

    return {
      id: b.id,
      type: "bullets",
      title: b.data?.title ?? "",
      bullets: (b.data?.bullets ?? []).map((x: any) => ({
        id: x.id ?? uid(),
        text: x.text ?? "",
      })),
    };
  });
};

export const sectionsToBlocks = (sections: SectionType[]): AboutBlock[] => {
  return sections.map((s) => {
    if (s.type === "intro") {
      return {
        id: s.id,
        type: "intro",
        data: { title: s.title, content: s.content ?? "" },
      };
    }

    if (s.type === "features") {
      return {
        id: s.id,
        type: "features",
        data: { title: s.title, features: s.features ?? [] },
      };
    }

    if (s.type === "paragraph") {
      return {
        id: s.id,
        type: "paragraph",
        data: { title: s.title, content: s.content ?? "" },
      };
    }

    if (s.type === "cta") {
      return {
        id: s.id,
        type: "cta",
        data: {},
      };
    }

    return {
      id: s.id,
      type: "bullets",
      data: { title: s.title, bullets: s.bullets ?? [] },
    };
  });
};

export const buildSnapshotFromSections = (secs: SectionType[]) => {
  const snap: Record<string, string> = {};

  secs.forEach((s) => {
    snap[mkKey("sectionTitle", s.id)] = s.title ?? "";

    if (s.type === "intro") {
      snap[mkKey("introContent", s.id)] = s.content ?? "";
    }

    if (s.type === "paragraph") {
      snap[mkKey("paragraphContent", s.id)] = s.content ?? "";
    }

    if (s.type === "features") {
      snap[mkKey("featuresTitle", s.id)] = s.title ?? "";
      (s.features ?? []).forEach((f) => {
        snap[mkKey("featureCard", s.id, f.id)] = JSON.stringify({
          title: f.title ?? "",
          description: f.description ?? "",
          icon: f.icon ?? "",
        });
      });
    }

    if (s.type === "bullets") {
      snap[mkKey("bulletsTitle", s.id)] = s.title ?? "";
      (s.bullets ?? []).forEach((b) => {
        snap[mkKey("bulletText", s.id, b.id)] = b.text ?? "";
      });
    }
  });

  return snap;
};

export const IconMap: { [key: string]: FC<any> } = Object.fromEntries(
  ICONS_HE.map((i) => [i.value, i.component]),
);

export const iconOptions = ICONS_HE.map((i) => ({
  value: i.value,
  label: i.label,
}));