export declare const UserService: {
    /**
     * Change user password
     * @param currentPassword - user's current password
     * @param newPassword - new password to update
     * @param token - user auth token
     */
    changePassword: (currentPassword: string, newPassword: string, token: string) => Promise<any>;
    /**
     * Get all favorite words (no pagination)
     * @param token - user auth token
     */
    getFavorites: (token: string) => Promise<any>;
    /**
     * Add word to favorites
     * @param wordId - ID of the word to add
     * @param token - user auth token
     */
    addFavorite: (wordId: string, token: string) => Promise<any>;
    getProfile: (token: string) => Promise<any>;
    /**
     * Remove word from favorites
     * @param wordId - ID of the word to remove
     * @param token - user auth token
     */
    removeFavorite: (wordId: string, token: string) => Promise<any>;
    /**
     * Get paginated favorites list
     * @param page - page number
     * @param limit - number of items per page
     * @param token - user auth token
     */
    getFavoritesPaginated: (page: number, limit: number, token: string) => Promise<any>;
    /**
     * Get subscribed users (example feature)
     * @param token - user auth token
     */
    getSubscribedUsers: (token: string) => Promise<any>;
};
//# sourceMappingURL=UserService.d.ts.map