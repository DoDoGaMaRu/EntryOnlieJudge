import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const SubtaskStateSchema = new Schema(
  {
    subtask       : { type: Schema.Types.ObjectId, ref: 'Subtask', require: true },
    clear         : { type: Boolean, default: false, require: true },
  }
)

const MissionProgressSchema = new Schema(
  {
    user          : { type: Schema.Types.ObjectId, ref: 'User', require: true, index: true },
    mission       : { type: Schema.Types.ObjectId, ref: 'Mission', required: true },
    subtasks      : [ SubtaskStateSchema ],
    clear         : { type: Boolean, default: false, require: true },
    active        : { type: Boolean, default: false, require: true },
		activedAt		  : { type: Date, default: Date.now },
  },
	{ 
		timestamps: true,
		strict: true
	},
);

const MissionProgress = model('MissionProgress', MissionProgressSchema);

export default MissionProgress;
