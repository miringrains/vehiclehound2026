export type InventoryType = "sale" | "lease";
export type VehicleCondition = "new" | "used";

export type VehicleStatus = 0 | 1 | 2 | 3;

export type Vehicle = {
  id: string;
  dealership_id: string;
  inventory_type: InventoryType;
  condition: VehicleCondition | null;
  stock_number: string | null;
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  trim_level: string | null;
  series: string | null;
  vehicle_type: string | null;
  body_class: string | null;
  doors: number | null;
  mileage: number | null;

  online_price: number | null;
  sale_price: number | null;
  purchase_price: number | null;
  msrp: number | null;

  lease_payment: number | null;
  lease_term: number | null;
  lease_down_payment: number | null;
  lease_annual_mileage: number | null;
  lease_spec: string | null;
  broker_fee: number | null;
  taxes_and_fees: number | null;

  engine_hp: string | null;
  engine_cylinders: string | null;
  engine_displacement: string | null;
  fuel_type: string | null;
  transmission_style: string | null;
  drive_type: string | null;
  exterior_color: string | null;
  interior_color: string | null;

  features: string[];
  description: string | null;
  title_status: string | null;

  status: VehicleStatus;
  sold_at: string | null;

  market_value_data: Record<string, unknown> | null;
  market_value_updated_at: string | null;
  insights: Record<string, unknown> | null;
  insights_generated_at: string | null;

  webflow_item_id: string | null;
  last_webflow_sync: string | null;
  location_detail: string | null;
  preview_image: string | null;

  created_at: string;
  updated_at: string;
};

export type VehicleImage = {
  id: string;
  vehicle_id: string;
  file_path: string;
  display_order: number;
  created_at: string;
};

export type VehicleDraft = {
  id: string;
  dealership_id: string;
  current_step: number;
  form_data: Record<string, unknown>;
  step_completion: Record<string, boolean>;
  created_at: string;
  updated_at: string;
};
