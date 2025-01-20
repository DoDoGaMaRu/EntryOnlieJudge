import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

const LevelSchema = new Schema(
  {
    level: { type: Number, required: true, unique: true },
    score: { type: Number, required: true },
  },
  { strict: true }
);

const Level = model("Level", LevelSchema);

export default Level;
