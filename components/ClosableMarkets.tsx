"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface OpenMarket {
    id: string;
    title: string;
}

export default function ClosableMarkets() {
    const { data: session } = useSession();
    const [markets, setMarkets] = useState<OpenMarket[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState<string | null>(null);

    const ADMIN_EMAIL = "rchoudhary@entnt.in";

    // 1. Fetch un-resolving market data via a separate endpoint or server prop action
    useEffect(() => {
        if (session?.user?.email === ADMIN_EMAIL) {
            fetch("/api/markets/open") // Create a generic GET route or query here
                .then((res) => res.json())
                .then((data) => {
                    setMarkets(data.markets || []);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [session]);

    if (!session || session.user?.email !== ADMIN_EMAIL) {
        return <div className="p-8 font-semibold text-red-600">Unauthorized View Access</div>;
    }

    if (loading) return <div className="p-8">Loading Closable Markets...</div>;

    // 2. Call our secure dynamic nested API route to handle calculations cleanly
    const handleCloseMarket = async (marketId: string, outcome: boolean) => {
        setActionId(marketId);
        try {
            const response = await fetch(`/api/market/${marketId}/close`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ outcome }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Error: ${data.error || "Failed to close market"}`);
                return;
            }

            alert("Market settled successfully!");
            // Filter out the resolved item from local state views immediately
            setMarkets((prev) => prev.filter((m) => m.id !== marketId));
        } catch (err) {
            alert("Network connection failure trying to settle transaction pool.");
        } finally {
            setActionId(null);
        }
    };

    return (
        <div className="p-8 max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Markets You Can Close</h1>
            {markets.length === 0 ? (
                <p className="text-gray-500">No open markets awaiting resolution.</p>
            ) : (
                <ul className="space-y-4">
                    {markets.map((market) => (
                        <li key={market.id} className="border p-4 rounded shadow flex flex-col gap-2">
                            <span className="font-medium text-lg">{market.title}</span>
                            <span className="text-xs text-gray-400">ID: {market.id}</span>
                            <div className="flex gap-2 mt-2">
                                <button
                                    disabled={actionId === market.id}
                                    onClick={() => handleCloseMarket(market.id, true)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                                >
                                    {actionId === market.id ? "Settling..." : "Resolve YES"}
                                </button>
                                <button
                                    disabled={actionId === market.id}
                                    onClick={() => handleCloseMarket(market.id, false)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                                >
                                    {actionId === market.id ? "Settling..." : "Resolve NO"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
