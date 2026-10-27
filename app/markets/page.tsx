import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { MarketList } from "@/components/MarketList";
import Createmarket from "@/components/Createmarket";
export default async function Markets() {

    const session = await auth();
    if (!session?.user) {
        return (
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-8">
                <h1 className="text-3xl font-bold">Markets</h1>
                <p>You are not signed in.</p>
            </main>
        )
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email!,
        },
    });
    if (!user) {
        return (
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-8">
                <h1 className="text-3xl font-bold">Markets</h1>
                <p>User not found.</p>
            </main>
        )
    }

    const markets = await prisma.markets.findMany({
        where: {
            creatorId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });


    return (
        <div>
            {markets && markets.length > 0 && <MarketList markets={markets} />}
            <Createmarket />
        </div>
    )

}
