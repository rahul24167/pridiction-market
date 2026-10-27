import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Switched from .uuid() to regular string check because CUID values aren't UUID compatible
const betSchema = z.object({
  marketId: z.string().min(1, "Market ID required"),
  amount: z.number().positive("Amount must be greater than zero"),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = betSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation Failed", 
        details: validation.error.flatten() 
      }, { status: 400 });
    }

    const { marketId, amount } = validation.data;

    // Use a transaction scope directly to avoid out-of-sync checks
    const result = await prisma.$transaction(async (tx) => {
      // 1. Isolation check user state directly inside the transaction pool
      const user = await tx.user.findUnique({
        where: { email: session.user.email! },
      });

      if (!user) throw new Error("User not found");
      if (amount > user.balance) throw new Error("Insufficient balance");

      // 2. Fetch target market
      const market = await tx.markets.findUnique({
        where: { id: marketId, resolution: null }, // Ensure market is still open
      });

      if (!market) throw new Error("Market not found");

      // 3. Complete structural state execution queries
      const newBet = await tx.bets.create({
        data: {
          userId: user.id,
          marketId,
          amount,
          outcome: !market.bet, 
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: amount, // Safe atomic database calculation
          },
        },
      });

      return { newBet, updatedUser };
    });

    return NextResponse.json({
        message: "Success",
        bet: result.newBet,
        balance: result.updatedUser.balance
    }, { status: 201 });

  } catch (error) {
    console.error("Bet placement crash:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
