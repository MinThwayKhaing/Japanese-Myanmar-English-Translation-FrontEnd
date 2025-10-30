export declare const AuthService: {
    login: (email: string, password: string) => Promise<{
        token: any;
        role: any;
        subscription: any;
    }>;
    register: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
};
//# sourceMappingURL=authService.d.ts.map