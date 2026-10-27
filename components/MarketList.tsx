"use client"
export interface IMarket {
  id: string;
  title: string;
  expiry: Date | string; // Dates often serialize to strings when sent to client components
  bet: boolean;
  intialWager: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  resolution: string | null;
  creatorId: string;
}
export function MarketList({ markets }: { markets: IMarket[] }) {

    return (
        <ul>
            {markets.map((market) => (
                <li key={market.id}>
                    {market.title} - {market.expiry.toString()} - {market.bet ? "Yes" : "No"} - {market.intialWager}
                    <button>TBD</button>
                </li>
            ))}
        </ul>
    )
}