import React from "react";
import { UrbanRunnerHero } from "../../app/ui/store/hero-renderers";

export default {
  title: "Store/Hero/UrbanRunner",
  component: UrbanRunnerHero,
};

const sampleContent = {
  title: "Run the City",
  subtitle: "Lightweight gear built for speed and comfort.",
  cta_text: "Explore",
  cta_link: "#products",
  image_url: "/customers/images/sample-runner.jpg",
};

const sampleTheme = {
  background_color: "#f7fafc",
  primary_color: "#16a34a",
  accent_color: "#10b981",
  heading_color: "#0f172a",
  text_color: "#334155",
  heading_font: "Inter",
};

export const Default = () => (
  <UrbanRunnerHero content={sampleContent} theme={sampleTheme} />
);
