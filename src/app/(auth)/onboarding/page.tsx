import { Path } from "@/config/constants"
import OnboardingForm from "@/features/auth/components/onboarding-form"
import { hasAdminAccount } from "@/features/auth/server/utils"
import { redirect } from "next/navigation"

export default async function Page() {
    const hasAdmin = await hasAdminAccount()

    // If admin exists, redirect to login (or index)
    if (hasAdmin) {
        redirect(Path.ADMIN_DASHBOARD)
    }

    return <OnboardingForm />
}
