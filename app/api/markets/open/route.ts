import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth();
    
    // 1. Strictly verify the session and structural Admin rights first
    if (!session?.user?.email || session.user.email !== "rchoudhary@entnt.in") {
        return NextResponse.json({ error: "Unauthorized Admin Access" }, { status: 401 });
    }

    try {
        // 2. Fetch all markets that haven't been completed or processed yet
        // Dropping the 'creatorId' block ensures the admin can see and close every market globally
        const markets = await prisma.markets.findMany({
            where: {
                OR: [
                    { resolution: null },
                    { resolution: "Processing" } // Allows view fallback if loop needs re-processing
                ]
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json({ markets }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch closable admin markets:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
