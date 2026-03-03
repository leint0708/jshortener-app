import { Path } from "@/config/constants"
import LoginForm from "@/features/auth/components/login-form"
import { hasAdminAccount } from "@/features/auth/server/utils"
import { requireUnauth } from "@/lib/auth/utils"
import { redirect } from "next/navigation"

export default async function Page() {
    await requireUnauth()

    const hasAdmin = await hasAdminAccount()
    if (!hasAdmin) {
        redirect(Path.ONBOARDING)
    }

    return <LoginForm />
}
