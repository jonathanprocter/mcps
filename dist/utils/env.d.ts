export declare function getRequiredEnv(key: string): string;
export declare function getOptionalEnv(key: string): string | undefined;
export interface Secrets {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_REFRESH_TOKEN?: string;
    DROPBOX_ACCESS_TOKEN?: string;
    NOTION_INTEGRATION_SECRET?: string;
    OPENAI_API_KEY?: string;
    PERPLEXITY_API_KEY?: string;
}
export declare function checkSecrets(): Secrets;
//# sourceMappingURL=env.d.ts.map