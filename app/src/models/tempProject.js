import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

export const TEMP_PROIJECT_TYPE = {
  PROBLEM   : "problem",
  PRACTICE  : "practice",
};

const TempProjectSchema = new Schema(
  {
    ownerId         : { type: String, required: true },
    key             : { type: Number, required: true },
    projectType     : { type: String, required: true, enum: Object.values(TEMP_PROIJECT_TYPE)},
    projectJson     : { type: Map, required: true },
  },
	{ 
		timestamps: true,
		strict: true
	},
);
TempProjectSchema.index({ key: 1, ownerId: -1 }, { unique: true });

const TempProject = model("TempProject", TempProjectSchema);

export default TempProject;
