// typescript types for recall data

export type RecallSummary = {
    RecallID: number
    Title: string | null
    RecallDate: string | null
    Image: string | null
    ProductName: string | null
    Hazard: string | null
}

export type RecallProductDetails = {
    Name: string | null
    Description: string | null
    Model: string | null
    Type: string | null
    CategoryID: string | null
    NumberOfUnits: string | null
}

export type RecallDetails = {
    RecallID: number
    RecallNumber: string | null
    RecallDate: string | null
    LastPublishDate: string | null
    Title: string | null
    Description: string | null
    URL: string | null
    ConsumerContact: string | null
    Products: RecallProductDetails[] | null
    ProductUPCs: Record<string, any>[] | null
    Images: Record<string, any>[] | null
    Hazards: Record<string, any>[] | null
    Injuries: Record<string, any>[] | null
    Remedies: Record<string, any>[] | null
    RemedyOptions: Record<string, any>[] | null
    Manufacturers: Record<string, any>[] | null
    Retailers: Record<string, any>[] | null
    Importers: Record<string, any>[] | null
    Distributors: Record<string, any>[] | null
}