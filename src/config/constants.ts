export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 10,
} as const;

export enum Path {
    ADMIN_DASHBOARD = "/",
    LOGIN = "/login",
    ONBOARDING = "/onboarding",
}

export const RESERVED_PATHS = [
    "login",
    "onboarding",
    "api",
    "dashboard",
    "settings",
    "_next",
    "favicon.ico",
    "robots.txt",
    "sitemap.xml",
];