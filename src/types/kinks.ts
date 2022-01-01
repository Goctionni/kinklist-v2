export interface Kink {
    name: string;
    ratings: Record<string, string>;
    comment?: string;
}

export interface KinkCategory {
    name: string;
    subcategories: string[];
    kinks: Kink[];
}
