import mongoose from "mongoose";
import {ROLE as R} from '#middlewares/session.middleware.js';

const { Schema, model, Types } = mongoose;


const TriedProblemSchema = new Schema(
	{
		problemKey  : { type: Number, required: true },
    clear       : { type: Boolean, required: true }
	},
	{ timestamps: true },
);

const UserSchema = new Schema(
	{
		userId            : { type: String, required: true, unique: true },
		userName					: { type: String, default: '-', index: true },
		role							: { type: Number, required: true, default: R.USER, enum: Object.values(R), index: true },
		groups						: [{ type: Schema.Types.ObjectId, ref: 'Group' }],
    profileImage      : { type: String, default: '' },
    profileThumbnail  : { type: String, default: '' },
    profileBackground : { type: String, default: '' },
    triedProblems     : [ TriedProblemSchema ],
    score             : { type: Number, default: 0 },
	},
	{ 
		timestamps: true,
		strict: true
	},
);


const User = model('User', UserSchema);

export default User;
