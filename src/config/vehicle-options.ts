export const fuelTypes = [
  "Gasoline",
  "Diesel",
  "Electric",
  "Hybrid",
  "Plug-in Hybrid",
  "Flex Fuel",
  "Hydrogen",
] as const;

export const transmissionStyles = [
  "Automatic",
  "Manual",
  "CVT",
  "Dual-Clutch",
  "Automated Manual",
] as const;

export const driveTypes = ["FWD", "RWD", "AWD", "4WD"] as const;

export const titleStatuses = [
  "Clean",
  "Salvage",
  "Rebuilt",
  "Flood",
  "Lemon",
  "Bonded",
] as const;

export const vehicleTypes = [
  "Sedan",
  "SUV",
  "Truck",
  "Coupe",
  "Convertible",
  "Wagon",
  "Van",
  "Minivan",
  "Hatchback",
  "Crossover",
] as const;

export const defaultColors = [
  { label: "Black", hex: "#000000" },
  { label: "White", hex: "#FFFFFF" },
  { label: "Silver", hex: "#C0C0C0" },
  { label: "Gray", hex: "#808080" },
  { label: "Red", hex: "#CC0000" },
  { label: "Blue", hex: "#0000CC" },
  { label: "Navy", hex: "#000080" },
  { label: "Green", hex: "#006400" },
  { label: "Brown", hex: "#8B4513" },
  { label: "Beige", hex: "#F5F5DC" },
  { label: "Gold", hex: "#DAA520" },
  { label: "Orange", hex: "#FF8C00" },
  { label: "Yellow", hex: "#FFD700" },
  { label: "Purple", hex: "#800080" },
  { label: "Burgundy", hex: "#800020" },
  { label: "Midnight Blue", hex: "#191970" },
  { label: "Champagne", hex: "#F7E7CE" },
  { label: "Pearl White", hex: "#F0EAD6" },
  { label: "Gunmetal", hex: "#2C3539" },
] as const;
