export interface MeterFormData {
  name: string;
  meterNumber: string;
  disco: string;
  meterType: string;
}

export interface DiscoInterface {
  name: string;
  serviceID: string;
  image: string;
  minimum_amount: string;
  maximum_amount: string;
  product_type: string;
}