import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// 1. Zod Schema to validate incoming body
const transactionSchema = z.object({
    type: z.enum(["deposit", "withdrawal"]), // Adjust according to your explicit frontend values
    amount: z.union([z.number(), z.string()]).transform((val) => Number(val)),
});

export async function POST(request: Request) {
    const session = await auth();
    
    // Guard session and ensure email exists
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
        const body = await request.json();
        
        // 2. Validate request parameters using Zod
        const validation = transactionSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Invalid request payload", details: validation.error.format() }, 
                { status: 400 }
            );
        }

        const { type, amount } = validation.data;

        const result = await prisma.$transaction(async (tx) => {
            // Determine balance modifier safely
            const changeAmount = type === "deposit" ? amount : -amount;

            const updatedUser = await tx.user.update({
                where: {
                    email: session.user.email!, // Force strict string since we guarded it above
                },
                data: {
                    balance: {
                        increment: changeAmount,
                    },
                },
            });

            const newWalletEvent = await tx.walletEvents.create({
                data: {
                    type,
                    amount, 
                    userId: updatedUser.id,
                },
            });

            return { updatedUser, newWalletEvent };
        });

       
        return NextResponse.json({
            message: "Success",
            balance: result.updatedUser.balance,
            id: result.newWalletEvent.id // Frontend uses data.id for updates
        }, { status: 200 });

    } catch (error) {
        console.error("Transaction failed:", error);
        return NextResponse.json({ message: "Transaction Failed" }, { status: 500 });
    }
}
