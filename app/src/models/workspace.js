import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;


const WorkspaceSchema = new Schema(
    {
			ownerId         : {type: String, required: true, index: true},
			title						: {type: String, required: true, index: true},
			projectJson			: {type: Map, required: true},
			thumbnail				: {type: String, required: true},
			isPublic				: {type: Boolean, required:true, default: false},
			introduction		: {type: String, default: ''},
			description 		: {type: String, default: ''},
    },
	{ 
		timestamps: true,
		strict: true
	},
);

const Workspace = model('Workspace', WorkspaceSchema);

export default Workspace;
