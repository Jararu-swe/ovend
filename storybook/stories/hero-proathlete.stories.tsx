import React from "react";
import { ProAthleteHero } from "../../app/ui/store/hero-renderers";
import type { StoreTheme } from "../../app/lib/definitions";

export default {
  title: "Store/Hero/ProAthlete",
  component: ProAthleteHero,
};

const sampleContent = {
  title: "Train like a Pro",
  subtitle: "Top-tier athletic gear for peak performance.",
  cta_text: "Shop Now",
  cta_link: "#products",
  text_align: "left",
};

const sampleTheme = {
  background_color: "#0b1020",
  primary_color: "#ff4d4f",
  secondary_color: "#1f2a44",
  accent_color: "#ffd166",
  heading_color: "#ffffff",
  text_color: "#e6e6e6",
  heading_font: "Inter",
} as StoreTheme;

export const Default = () => (
  <ProAthleteHero content={sampleContent} theme={sampleTheme} />
);
