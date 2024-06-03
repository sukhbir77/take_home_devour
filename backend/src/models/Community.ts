import { prop, getModelForClass } from '@typegoose/typegoose';
import { Types } from 'mongoose';

class Community {
	@prop({ required: true })
	public name?: string;

	@prop()
	public logo?: string;

	@prop({ type: () => [Types.ObjectId], ref: 'User', default: [] })
	public members!: Types.ObjectId[];

	@prop({ default: 0 })
	public totalExperience!: number;

	@prop({ default: 0 })
	public memberCount!: number;
}

export const CommunityModel = getModelForClass(Community);
