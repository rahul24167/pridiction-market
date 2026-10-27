import { auth } from "@/auth";
import prisma from "@/lib/prisma";
export default async function MarketsLayout({ children }: { children: React.ReactNode }) {
    const session = await auth(); 
    if(!session?.user){
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
    if(!user){
        return (
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-8">
                <h1 className="text-3xl font-bold">Markets</h1>
                <p>User not found.</p>
            </main>
        )
    }
    
    return (
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-8">
            <h1 className="text-3xl font-bold">Markets</h1>
            <p>Current Balance: {user.balance}</p>
            {children}

        </main>
    )
}

