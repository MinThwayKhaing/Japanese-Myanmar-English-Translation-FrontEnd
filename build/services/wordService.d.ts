export interface Word {
    _id?: string;
    english: string;
    japanese?: string;
    myanmar?: string;
    subTerm?: string;
    createdAt?: string;
    updatedAt?: string;
    totalCount?: number;
}
export type RNFile = {
    uri: string;
    name: string;
    type: string;
};
export interface PaginatedWords {
    totalCount: number;
    words: Word[];
    hasMore: boolean;
    currentPage: number;
}
export declare const WordService: {
    searchWords: (query: string, token?: string) => Promise<Word[]>;
    getWordByID: (id: string, token?: string) => Promise<Word>;
    selectOneWord: (id: string, token?: string) => Promise<Word>;
    getAllWords: (page?: number, limit?: number, query?: string, token?: string) => Promise<PaginatedWords>;
    createWord: (word: Word, token: string) => Promise<Word>;
    updateWord: (id: string, word: Word, token: string) => Promise<Word>;
    deleteWord: (id: string, token: string) => Promise<void>;
    uploadExcelWords: (file: {
        uri: string;
        name: string;
        type: string;
        content?: string;
    }, token: string) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=wordService.d.ts.map