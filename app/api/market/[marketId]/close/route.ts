import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "rchoudhary@entnt.in";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ marketId: string }> } // Awaited for Next.js 15+ compatibility
) {
    const session = await auth();
    if (!session || session.user?.email !== ADMIN_EMAIL) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { marketId } = await params;
        const body = await request.json();
        const { outcome } = body; // Expects a boolean true/false

        if (typeof outcome !== "boolean") {
            return NextResponse.json({ error: "Invalid outcome value" }, { status: 400 });
        }

        // Run the complex logic inside a safe, unified interactive transaction block
        const message = await prisma.$transaction(async (tx) => {
            const marketWithBets = await tx.markets.findUnique({
                where: { id: marketId },
                include: { bets: true },
            });

            if (!marketWithBets) throw new Error("Market not found");
            if (marketWithBets.resolution === "Completed") throw new Error("Market already settled");

            // Set state to processing
            await tx.markets.update({
                where: { id: marketId },
                data: { resolution: "Processing" },
            });

            // Clean array filter out and sort: b - a puts newest at the end, pop() removes oldest!
            let remainingWager = marketWithBets.intialWager;
            const sortedBets = marketWithBets.bets.sort(
                (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
            );

            while (remainingWager > 0 && sortedBets.length > 0) {
                const bet = sortedBets.pop();
                if (!bet) break;

                const deltaAmount = Math.min(bet.amount, remainingWager);
                let finalBalanceChange = 0;

                if (outcome === bet.outcome) {
                    finalBalanceChange = bet.amount + deltaAmount;
                    remainingWager -= deltaAmount;
                } else {
                    finalBalanceChange = bet.amount - deltaAmount;
                    remainingWager += deltaAmount;
                }

                // Update individual user balance securely
                await tx.user.update({
                    where: { id: bet.userId },
                    data: { balance: { increment: finalBalanceChange } },
                });
            }

            // Return residual pool remains back to market creator
            await tx.user.update({
                where: { id: marketWithBets.creatorId },
                data: { balance: { increment: remainingWager } },
            });

            // Commit final resolution completion parameters
            await tx.markets.update({
                where: { id: marketId },
                data: { resolution: "Completed" },
            });

            return "Market settled completely";
        });

        return NextResponse.json({ message }, { status: 200 });

    } catch (error) {
        console.error("Resolution transaction failure:", error);
        return NextResponse.json({ error: "Internal Settlement Failure" }, { status: 500 });
    }
}
