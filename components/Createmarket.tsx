"use client"

import React from 'react'

const Createmarket = () => {
    const [showForm, setShowForm] = React.useState(false);
    const [market, setMarket] = React.useState({
        title: "",
        expiry: "",
        side: "yes",
        intialWager: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setMarket((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch("/api/market", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(market),
            });
            const data = await response.json();
            if (response.ok) {
                alert(`Market created successfully! New balance: ${data.balance}`);
            } else {
                alert(`Error creating market: ${data.message}`);
            }
        window.location.reload();
        } catch (error) {
            console.error("Error creating market:", error);
            alert("An unexpected error occurred.");
        }
    };
    return (
        <div>
            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Hide Form" : "Show Form"}
            </button>
            {showForm && (
                <form action={handleSubmit}>
                    <input

                        type="text"
                        name="title"
                        placeholder="Market Title"
                        value={market.title}
                        onChange={handleChange}
                    />
                    <input
                        type="date"
                        name="expiry"
                        value={market.expiry}
                        onChange={handleChange}
                    />
                    <select name="side" value={market.side} onChange={handleChange}>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                    <input
                        type="number"
                        name="intialWager"
                        placeholder="Initial Wager"
                        value={market.intialWager}
                        onChange={handleChange}
                    />
                    <button type="submit">Create Market</button>
                </form>
            )}
        </div>
    )
}

export default Createmarket