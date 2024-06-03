import express from "express";
import { UserModel } from "../models/User";
import { CommunityModel } from "../models/Community";
import { MembershipModel } from "../models/Membership";
import { Types } from "mongoose";

const userRouter = express.Router();

/**
 * @route GET /user/:id
 * @param {string} id - User ID
 * @returns {User} - User object with experiencePoints field
 */
userRouter.get("/:id", async (req, res) => {
	const user = await UserModel.findById(req.params.id).select('+experiencePoints');
	if (!user) {
		return res.status(404).send({ message: "User not found" });
	}
	res.send(user);
});

/**
 * @route GET /user
 * @returns {Array} - Array of User objects
 * @note Adds the virtual field of totalExperience to the user.
 * @hint You might want to use a similar aggregate in your leaderboard code.
 */
userRouter.get("/", async (_, res) => {
	const users = await UserModel.aggregate([
		{
			$unwind: "$experiencePoints"
		},
		{
			$group: {
				_id: "$_id",
				email: { $first: "$email" },
				profilePicture: { $first: "$profilePicture" },
				totalExperience: { $sum: "$experiencePoints.points" },
				communityID: { $first: "$communityID" }
			}
		}
	]);
	res.send(users);
});

/**
 * @route POST /user/:userId/join/:communityId
 * @param {string} userId - User ID
 * @param {string} communityId - Community ID
 * @description Joins a community
 */
userRouter.post("/:userId/join/:communityId", async (req, res) => {
	const { userId, communityId } = req.params;
	const communityObjectId = new Types.ObjectId(communityId);
	const userID = new Types.ObjectId(userId);

	try {
		// Fetch community
		const community = await CommunityModel.findById(communityObjectId);
		if (!community) {
			return res.status(404).send({ message: "Community not found" });
		}

		// Fetch user with populated experiencePoints
		const user = await UserModel.findById(userId).populate('experiencePoints');
		if (!user) {
			return res.status(404).send({ message: "User not found" });
		}

		// If user is already a member of another community, update previous community's data
		if (user.communityID && !user.communityID.equals(communityObjectId)) {
			const oldCommunity = await CommunityModel.findById(user.communityID);
			if (oldCommunity) {
				oldCommunity.members = oldCommunity.members.filter(
					memberId => !memberId.equals(userId)
				);
				oldCommunity.memberCount--;
				oldCommunity.totalExperience -= user.experiencePoints!.reduce(
					(sum, exp) => sum + exp.points,
					0
				);
				await oldCommunity.save();
			}
		}

		// Update user's communityID field
		user.communityID = communityObjectId;
		await user.save();

		// Add user to new community and update community data
		if (!community.members.includes(userID)) {
			community.members.push(userID);
			community.memberCount++;
			community.totalExperience += user.experiencePoints!.reduce(
				(sum, exp) => sum + exp.points,
				0
			);
			await community.save();
		}

		// Send success response
		res.status(200).send({ message: "User joined the community successfully" });
	} catch (error) {
		console.error("Error joining community:", error);
		res.status(500).send({ message: "Internal Server Error", error });
	}
});


/**
 * @route DELETE /user/:userId/leave/:communityId
 * @param {string} userId - User ID
 * @param {string} communityId - Community ID
 * @description leaves a community
 */
userRouter.delete("/:userId/leave/:communityId", async (req, res) => {
	const { userId, communityId } = req.params;
	const communityObjectId = new Types.ObjectId(communityId);
	const userID = new Types.ObjectId(userId);

	try {
		const community = await CommunityModel.findById(communityObjectId);
		if (!community) {
			return res.status(404).send({ message: "Community not found" });
		}

		// Fetch user with populated experiencePoints
		const user = await UserModel.findById(userId).populate('experiencePoints');
		if (!user) {
			return res.status(404).send({ message: "User not found" });
		}

		if (community.members.includes(userID)) {
			// Remove user from the community's members list
			community.members = community.members.filter(
				memberId => !memberId.equals(userId)
			);
			community.memberCount--;

			// Update the total experience of the community
			if (user.experiencePoints) {
				community.totalExperience -= user.experiencePoints.reduce(
					(sum, exp) => sum + exp.points,
					0
				);
			}

			// Save the changes to the community
			await community.save();

			// Clear the user's communityID
			user.communityID = undefined;
			await user.save();

			// Send success response
			res
				.status(200)
				.send({ message: "User left the community successfully" });
		} else {
			res.status(400).send({ message: "User is not a part of this community" });
		}
	} catch (error) {
		console.error("Error leaving community:", error);
		res.status(500).send({ message: "Internal Server Error", error });
	}
});


export {
	userRouter
}
