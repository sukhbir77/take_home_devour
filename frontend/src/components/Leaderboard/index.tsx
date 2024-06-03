import React, { useState, useEffect } from "react";
import "./index.css";

interface Community {
    _id: string;
    name: string;
    logo: string;
    totalExperience: number;
    memberCount: number;
}

const Leaderboard: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<Community[]>([]);

    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                const response = await fetch("http://localhost:8080/leaderboard");
                if (!response.ok) {
                    throw new Error("Failed to fetch leaderboard data");
                }
                const data = await response.json();
                setLeaderboardData(data);
                setLoading(false);
            } catch (error) {
                setError(error.message.toString());
                setLoading(false);
            }
        };

        fetchLeaderboardData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <div className="header_leaderboard">
                <h5 className="flex_gap">Rank</h5>
                <h5 className="flex_gap">Community</h5>
                <h5 className="flex_gap">Experience</h5>
                <h5 className="flex_gap">Members</h5>
            </div>
            {leaderboardData.map((item, index) => {
                return <div className="container">
                    <h3 className="flex_gap">{index + 1}</h3>
                    <img className="logo_image" src={item.logo} alt="Logo_Community"></img>
                    <h3>{item.name}</h3>
                    <p className="flex_gap">{item.totalExperience}</p>
                    <p className="flex_gap">{item.memberCount}</p>
                </div>
            })}
        </div>
    );
};

export default Leaderboard;
