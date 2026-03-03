import { AppFooter, AppHeader, AppLayout } from "@/components/app-layout";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <AppLayout header={<AppHeader />} footer={<AppFooter />}>
            {children}
        </AppLayout>
    )
}