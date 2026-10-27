import { auth } from "@/auth";
import prisma from "@/lib/prisma";
export default async function TransactionsLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if(!session?.user){
        return (
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-8">
                <h1 className="text-3xl font-bold">Transactions</h1>
                <p>You are not signed in.</p>
            </main>
        )
    }
    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email,
        },
        select: {
            balance: true,
        }
    });
    if(!user){
        return (
            <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-8">
                <h1 className="text-3xl font-bold">Transactions</h1>
                <p>User not found.</p>
            </main>
        )
    }

    const transactions = await prisma.walletEvents.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-start justify-center gap-4 p-8">
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p>Current Balance: {user.balance}</p>
            {children}
            {transactions.length === 0 && <p>No transactions found.</p>}
            {transactions && transactions.length > 0 && <ul>
                {transactions.map((transaction) => (
                    <li key={transaction.id}>
                        {transaction.type} - {transaction.amount} - {transaction.createdAt.toISOString()}
                    </li>
                ))}
            </ul>}
        </main>
    )
}