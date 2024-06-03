import { prop, getModelForClass } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { UserModel } from './User';
import { CommunityModel } from './Community';

class Membership {
    @prop({ ref: () => UserModel, required: true, unique: true })
    public userId!: Types.ObjectId;

    @prop({ ref: () => CommunityModel, required: true })
    public communityId!: Types.ObjectId;
}

export const MembershipModel = getModelForClass(Membership);
