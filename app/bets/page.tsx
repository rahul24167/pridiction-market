import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { AvailableMarkets } from "@/components/AvailableMarket";
import { SessionProvider } from "next-auth/react"
import ClosableMarkets from "@/components/ClosableMarkets";

export default async function Bets() {
    const session = await auth();
    if (!session?.user) {
        return <div>Unauthorized</div>;
    }
    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email!,
        },
    });
    if (!user) {
        return <div>User not found</div>;
    }

    const bets = await prisma.bets.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    const avilableMarketsForBetting = await prisma.markets.findMany({
        where: {
            creatorId: {
                not: session.user.id,
            },
        },
    });
    
    

    return (
        <div>
            <h1>Available Balance: ${user.balance}</h1>

            <h1>Available Markets for Betting</h1>
            <AvailableMarkets markets={avilableMarketsForBetting} />
            <h1>Your Bets</h1>
            {bets.length > 0 ? (
                <ul>
                    {bets.map((bet) => (
                        <li key={bet.id}>
                            Market ID: {bet.marketId}, Amount: ${bet.amount}, Outcome: {bet.outcome ? "Yes" : "No"}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No bets placed yet.</p>
            )}

            {/* If admin then can list of market he can close */}
            <SessionProvider>
                <ClosableMarkets />
            </SessionProvider>
            
        </div>
    );
}