import express from 'express';
import { CommunityModel } from '../models/Community';

const leaderboardRouter = express.Router();

leaderboardRouter.get('/', async (_, res) => {
    try {
        // Fetch all communities with their details
        const communities = await CommunityModel.find();

        // Calculate total experience points and number of users for each community
        const leaderboardData = communities.map(community => ({
            _id: community._id,
            name: community.name,
            logo: community.logo,
            totalExperience: community.totalExperience,
            memberCount: community.members.length
        }));

        // Sort communities based on total experience points in descending order
        leaderboardData.sort((a, b) => b.totalExperience - a.totalExperience);

        // // Add rank to each community entry
        // leaderboardData.forEach((community, index) => {
        //     community.rank = index + 1;
        // });

        // Send the leaderboard data as JSON response
        res.json(leaderboardData);
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

export { leaderboardRouter };
