import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const { Schema, model, Types } = mongoose;
const autoIncrement = AutoIncrementFactory(mongoose);

const ProblemSchema = new Schema(
    {
        ownerId         : {type: String, required: true},
        title           : {type: String, required: true},
        level           : {type: Number, required: true},
        description     : {type: String, required: true},
        tags            : {type: Array, required: true},
        queProjectJson  : {type: Map, required: true},
        ansProjectJson  : {type: Map, required: true},
    },
    { timestamps: true },
);
ProblemSchema.index({key: 1, ownerId: -1});
ProblemSchema.plugin(autoIncrement, {
    id: 'problem', 
    inc_field: "key", 
    start_seq: 1000
});

const Problem = model('Problem', ProblemSchema);
export default Problem;
