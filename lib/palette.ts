// Mirror of the color tokens in app/globals.css, for the scene and for generated images.
export const stocks = {
  fern: { page: "#4fbe8a", ink: "#072315" },
  mustard: { page: "#e3b23c", ink: "#3a2a05" },
  rosa: { page: "#ee9fb6", ink: "#4a1026" },
  pulp: { page: "#b9b2a4", ink: "#27221b" },
  lilac: { page: "#b99ae6", ink: "#25103f" },
} as const;

export type StockName = keyof typeof stocks;

export const sheetFace = "#f6f1e4";
