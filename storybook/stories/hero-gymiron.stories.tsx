import React from "react";
import { GymIronHero } from "../../app/ui/store/hero-renderers";

export default {
  title: "Store/Hero/GymIron",
  component: GymIronHero,
};

const sampleContent = {
  title: "Built for Strength",
  subtitle: "Durable equipment and apparel for heavy lifters.",
  cta_text: "Browse Strength",
  cta_link: "#products",
};

const sampleTheme = {
  background_color: "#0f172a",
  primary_color: "#f97316",
  accent_color: "#f43f5e",
  heading_color: "#ffffff",
  text_color: "#e5e7eb",
  heading_font: "Inter",
};

export const Default = () => (
  <GymIronHero content={sampleContent} theme={sampleTheme} />
);
