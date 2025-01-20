import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const SUBTASK_TYPE = {
	PROBLEM   : 'ProblemSubtask',
	PRACTICE  : 'PracticeSubtask',
}

const SubtaskSchema = new Schema(
	{
		title						: { type: String, required: true },
		key							: { type: Number, required: true },
	}, 
	{ discriminatorKey: 'subtaskType' }
)
const Subtask = model('Subtask', SubtaskSchema);


const ProblemSubtask = Subtask.discriminator(
	SUBTASK_TYPE.PROBLEM,
	new Schema({
	})
)

const PracticeSubtask = Subtask.discriminator(
	SUBTASK_TYPE.PRACTICE,
	new Schema({
	})
)

Subtask.extends = {};
Subtask.extends[SUBTASK_TYPE.PROBLEM] = ProblemSubtask;
Subtask.extends[SUBTASK_TYPE.PRACTICE] = PracticeSubtask;

export { SUBTASK_TYPE };
export default Subtask;