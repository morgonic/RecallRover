// typescript types for watched product data

export type WatchedProductInput = {
    product_name: string
    product_brand: string
    product_model: string
    product_upc: string
}

export type WatchedProductRead = {
    id: number
    status_label: string
    product_name: string | null
    product_brand: string | null
    product_model: string | null
    product_upc: string | null
}