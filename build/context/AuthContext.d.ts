import React, { ReactNode } from 'react';
interface AuthContextProps {
    token: string | null;
    role: string | null;
    setAuth: (token: string | null, role: string | null) => void;
    logout: () => Promise<void>;
}
export declare const AuthContext: React.Context<AuthContextProps>;
export declare const AuthProvider: ({ children }: {
    children: ReactNode;
}) => React.JSX.Element;
export {};
//# sourceMappingURL=AuthContext.d.ts.map