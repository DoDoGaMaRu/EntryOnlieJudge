import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const { Schema, model, Types } = mongoose;
const autoIncrement = AutoIncrementFactory(mongoose);

const PracticeSchema = new Schema(
    {
        ownerId         : {type: String, required: true},
        title           : {type: String, required: true},
        description     : {type: String, required: true},
        tags            : {type: Array, required: true},
        projectJson     : {type: Map, required: true},
    },
    { timestamps: true },
);
PracticeSchema.index({key: 1, ownerId: -1});
PracticeSchema.plugin(autoIncrement, {
    id: 'practice', 
    inc_field: "key",
    start_seq: 1000
});

const Practice = model('Practice', PracticeSchema);
export default Practice;
