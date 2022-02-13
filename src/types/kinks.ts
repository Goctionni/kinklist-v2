export interface ExKink {
    name: string;
    ratings: Record<string, string>;
    comment?: string;
}

export interface ExKinkCategory {
    name: string;
    subcategories: string[];
    kinks: ExKink[];
}

export interface InKink extends ExKink {
    id: string;
}

export interface InKinkCategory extends ExKinkCategory {
    id: string;
    kinks: InKink[];
}
