import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";


const marketCreationSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    expiry: z.string().transform((val) => new Date(val)), 
    side: z.string().toLowerCase().pipe(z.enum(["yes", "no"])), 
    intialWager: z.union([z.number(), z.string()])
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, {
            message: "Initial wager must be a positive number",
        }),
});

export async function POST(request: Request) {
    const session = await auth();
    
    // Safety check for session and the required email parameter
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        
        // 2. Run payload validation
        const validation = marketCreationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation Failed", details: validation.error.flatten() }, 
                { status: 400 }
            );
        }

        // Extract the sanitized and transformed data
        const { title, expiry, side, intialWager } = validation.data;

        // 3. Run isolation-safe database transaction
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({
                where: {
                    email: session.user.email!,
                },
            });

            if (!user) {
                throw new Error("User not found");
            }

            // Safe validation check against parsed numbers
            if (user.balance < intialWager) {
                throw new Error("Insufficient balance");
            }

            const updatedUser = await tx.user.update({
                where: {
                    email: session.user.email!,
                },
                data: {
                    balance: {
                        decrement: intialWager, // Safe execution passing standard Number primitive
                    },
                },
            });

            const newMarket = await tx.markets.create({
                data: {
                    title,
                    expiry,
                    bet: side === "yes", // cleaner short-hand evaluation structure
                    intialWager,
                    creatorId: updatedUser.id,
                }
            });

            return { updatedUser, newMarket };
        });

        return NextResponse.json({
            message: "Market created successfully",
            balance: result.updatedUser.balance,
            marketId: result.newMarket.id
        }, { status: 200 });

    } catch (error) {
        console.error("market creation failed:", error);

        // Send a specific 400 response for an intentional structural rollback
        console.error("market creation failed:", error);
  

        return NextResponse.json({ message: "Market Creation Failed" }, { status: 500 });
    }
}
