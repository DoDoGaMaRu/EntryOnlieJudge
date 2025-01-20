import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

export const MISSION_TYPE = {
	GROUP: 'group',
	PERSONAL: 'personal'
}

const MissionSchema = new Schema(
	{
    title				: { type: String, require: true },
		missionType	: { type: String, require: true, enum: Object.values(MISSION_TYPE)},
		tag					: { type: String, default: '', require: true },
		description	: { type: String, default: '', require: true },
		subtasks		: [{ type: Schema.Types.ObjectId, ref: 'Subtask' }],
	},
	{ 
		timestamps: true,
		strict: true
	},
);

const Mission = model('Mission', MissionSchema);
export default Mission;
