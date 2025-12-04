export type OrderItemInput = {
  product_id?: number | null
  meal_plan_id?: number | null
  variant_id?: number | null
  quantity?: number
  unit_price?: number
  total_price?: number
  special_instructions?: string
}

export type CreateOrderBody = {
  customer_email?: string
  customer_phone?: string
  delivery_instructions?: string
  delivery_date?: string
  delivery_time_slot?: string
  payment_intent_id?: string
  tip?: number
  tax?: number
  delivery_fee?: number
  items?: OrderItemInput[]
  shipping_address?: OrderAddressSnapshot
  billing_address?: OrderAddressSnapshot
  request_approval?: boolean
  payment_method_id?: string
  stripe_customer_id?: string
}

export type OrderAddressSnapshot = {
  title?: string | null
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  address_line1?: string | null
  address_line2?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
  phone?: string | null
  lat?: number | null
  lng?: number | null
}
