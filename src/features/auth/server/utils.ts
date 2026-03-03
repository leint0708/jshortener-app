import { getDb } from "@/lib/db";
import { user } from "@/lib/schema";
import { count } from "drizzle-orm";

export const hasAdminAccount = async () => {
    const db = await getDb();
    const [userCount] = await db.select({ count: count() }).from(user);

    return (userCount?.count ?? 0) > 0;
};