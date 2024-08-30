import { Schema, model, Types } from 'mongoose';

const SolutionSchema = new Schema(
	{
		ownerId: { type: String, required: true },
		key: { type: Number, required: true },
		projectJson: { type: Map, required: true },
		clear: { type: Boolean, required: true },
	},
	{ timestamps: true },
);
SolutionSchema.index({ key: 1, ownerId: -1 });

const Solution = model('Solution', SolutionSchema);

export default Solution;
