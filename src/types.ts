export interface Filmes {
    show: {
        id: number;
        name: string;
        language: string|null;
        genres: string[];
        status: string;
        rating: {average: number|null};
        image: {medium: string, original: string} | null
        summary: string | null;
    }
}