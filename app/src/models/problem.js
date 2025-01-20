import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const { Schema, model, Types } = mongoose;
const autoIncrement = AutoIncrementFactory(mongoose);

const ProblemSchema = new Schema(
  {
    ownerId            : { type: String, required: true, index: true },
    title              : { type: String, required: true, index: true },
    level              : { type: Number, required: true },
    description        : { type: String, default: '-' },
    tags               : [{ type: String }],
    queProjectJson     : { type: Map, required: true },
    ansProjectJson     : { type: Map, required: true },
    solutionCount      : { type: Number, default: 0, required: true },
    correctCount       : { type: Number, default: 0, required: true },
    correctorCount     : { type: Number, default: 0, required: true },
    isPublic				   : { type: Boolean, default: false, required:true },
  },
	{ 
		timestamps: true,
		strict: true
	},
);
ProblemSchema.plugin(autoIncrement, {
  id: "problem",
  inc_field: "key",
  start_seq: 1000,
});
ProblemSchema.index({ key: 1 });

const Problem = model("Problem", ProblemSchema);
export default Problem;
