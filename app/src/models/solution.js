import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const { Schema, model, Types } = mongoose;
const autoIncrement = AutoIncrementFactory(mongoose);

const SolutionSchema = new Schema(
	{
		ownerId				: { type: String, required: true, index: true },
		problemKey		: { type: Number, required: true, index: true },
		projectJson		: { type: Map, required: true },
		clear					: { type: Boolean, required: true },
	},
	{ 
		timestamps: true,
		strict: true
	},
);
SolutionSchema.plugin(autoIncrement, {
    id: 'solution', 
    inc_field: "key", 
    start_seq: 1
});
SolutionSchema.index({ key: 1 });

const Solution = model('Solution', SolutionSchema);

export default Solution;
