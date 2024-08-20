import { Schema, model, Types } from "mongoose";

const WorkspaceSchema = new Schema(
    {
        ownerId         : {type: String, required: true},
        key             : {type: Number, required: true},
        projectType     : {type: String, required: true, enum: ['practice', 'solution']},
        projectJson     : {type: Map, required: true},
    },
    { timestamps: true },
);
WorkspaceSchema.index({key: 1, ownerId: -1});

const Workspace = model('Workspace', WorkspaceSchema);

export default Workspace;
