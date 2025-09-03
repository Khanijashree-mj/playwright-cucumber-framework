import { Page } from "@playwright/test";

// Simple page fixture - no PageManager complexity
export const pageFixture = {
  page: undefined as unknown as Page,
};