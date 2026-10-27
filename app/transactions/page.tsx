"use client";
import { useState } from "react";
interface ITransaction {
    type: "deposit" | "withdrawal";
    amount: number;
}
export default function Transactions(){
    const [transaction, setTransaction] = useState<ITransaction[]>([]);
    const [openTransactionForm, setOpenTransactionForm] = useState(false);

    const handleAddTransaction = async (transaction: ITransaction) => {
        try {
            const response = await fetch("/api/onramp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(transaction),
            });
            if (!response.ok) {
                throw new Error("Failed to add transaction");
            }
            const data = await response.json();
            setTransaction((prev) => [...prev, data]);
            //Reload the page to reflect the new transaction and updated balance
            window.location.reload();
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    };

    if(openTransactionForm){
        return (
            <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const type = formData.get("type") as "deposit" | "withdrawal";
                const amount = Number(formData.get("amount"));
                const transaction =  { type, amount };
                handleAddTransaction(transaction);
            }}>
                <label>
                    Type:
                    <select name="type" required>
                        <option value="deposit">Deposit</option>
                        <option value="withdrawal">Withdrawal</option>
                    </select>
                </label>
                <label>
                    Amount:
                    <input type="number" name="amount" required />
                </label>
                <button type="submit">Submit</button>
                <button type="button" onClick={() => setOpenTransactionForm(false)}>Cancel</button>
            </form>
        )
    }

    

    

    return (
        <button onClick={() => { setOpenTransactionForm(true); }}>Add Transaction</button>
    )
}