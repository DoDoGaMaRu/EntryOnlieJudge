import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";


const { Schema, model, Types } = mongoose;

const GroupSchema = new Schema(
	{
    name						: { type: String, required: true, index: true },
		description			: { type: String, default: '' },
		backgroundImage : { type: String, required: true },
		users						: [{ type: Schema.Types.ObjectId, ref: "User" }],
    missions				: [{ type: Schema.Types.ObjectId, ref: "Mission" }],
	},
	{ 
		timestamps: true,
		strict: true
	},
);

const Group = model('Group', GroupSchema);
export default Group;
