export interface MeterFormData {
  name: string;
  meterNumber: string;
  disco: string;
  meterType: string;
  customerName?: string;
}

export interface DiscoInterface {
  name: string;
  serviceID: string;
  image: string;
  minimum_amount: string;
  maximum_amount: string;
  product_type: string;
}

export interface MeterInterface {
  id: string;
  user_id: string;
  name: string;
  meter_number: string;
  disco: string;
  type: string;
  customer_name?: string;
  created_at: number;
}