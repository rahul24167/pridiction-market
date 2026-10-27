"use client"
import React from "react";
import { IMarket } from "@/components/MarketList";

export function AvailableMarkets({ markets }: { markets: IMarket[] }) {
    const [bet, setBet] = React.useState({
        marketId: '',
        amount: '', // Using string internally to handle input typing smoothly
    });

    const handleBetSubmit = async (e: React.FormEvent) => {
        // Prevent default submission native behavior
        e.preventDefault(); 
        
        if (!bet.marketId || !bet.amount || Number(bet.amount) <= 0) {
            alert("Please select a market and enter a positive amount.");
            return;
        }

        try {
            const currentMarket = markets.find((m) => m.id === bet.marketId);
            const response = await fetch("/api/bet", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    marketId: bet.marketId,
                    amount: Number(bet.amount), // Ensure true number type conversion
                    side: currentMarket ? !currentMarket.bet : false,
                }),
            });

            if (!response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    alert(`Betting Failed: ${errorData.error || errorData.message}`);
                } else {
                    const textError = await response.text();
                    alert(`Server Error: ${textError}`);
                }
                return;
            }

            const data = await response.json();
            alert("Bet successfully placed!");
            setBet({ marketId: '', amount: '' }); // Clear form state

        } catch (err) {
            console.error("Execution block error:", err);
        }
    };

    return (
        <div className="space-y-4">
            <h2>Available Markets for Betting</h2>

            {bet.marketId && (
                // Changed from action attribute to native onSubmit tracking
                <form onSubmit={handleBetSubmit} className="flex flex-col gap-2 max-w-sm border p-4 rounded">
                    <label className="flex flex-col">
                        Market ID:
                        <input type="text" value={bet.marketId} readOnly className="bg-gray-100 p-1 border" />
                    </label>
                    <label className="flex flex-col">
                        Amount:
                        <input 
                            type="number" 
                            value={bet.amount} 
                            onChange={(e) => setBet(prev => ({ ...prev, amount: e.target.value }))}
                            className="p-1 border" 
                            placeholder="Enter bet amount"
                        />
                    </label>
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded">Place Bet</button>
                </form>
            )}

            <h3>Markets:</h3>
            <ul className="space-y-2">
                {markets.map((market) => (
                    <li key={market.id} className="border-b pb-2 flex justify-between items-center max-w-xl">
                        <span>{market.title} - {new Date(market.expiry).toLocaleDateString()}</span>
                        <button 
                            onClick={() => setBet({ amount: '', marketId: bet.marketId === market.id ? '' : market.id })}
                            className="bg-gray-200 px-3 py-1 rounded text-sm"
                        >
                            {bet.marketId === market.id ? "Hide Bet Form" : "Show Bet Form"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
