import { industries, industryTopics, interviewDifficulties, interviewTypes } from "@/constants/data";
import mongoose, { Document } from "mongoose";

export interface IQuestion extends Document {
    _id: string;
    question: string;
    answer: string;
    completed: boolean;
    result: {
        overallScore: number;
        clarity: number;
        completeness: number;
        relevance: number;
        suggestion: string;
    }
}

export interface IInterview extends Document {
    _id: string;
    user: mongoose.Types.ObjectId; // Reference to the user who created the interview
    industry: string; // e.g., "Software", "Finance", etc.
    type: string;
    topic: string; // e.g., "Technical Interview", "HR Interview", etc.
    role: string;
    numOfQuestions: number;
    answered: number;
    difficulty: string; // e.g., "Easy", "Medium", "Hard"
    duration: number; // in minutes
    durationLeft: number;
    status: string; // e.g., "active", "completed", "cancelled"
    questions: IQuestion[];
}

const questionSchema = new mongoose.Schema<IQuestion>({
    question: { type: String, required: true },
    answer: String,
    completed: { type: Boolean, default: false },
    result: {
        overallScore: { type: Number, default: 0 },
        clarity: { type: Number, default: 0 },
        completeness: { type: Number, default: 0 },
        relevance: { type: Number, default: 0 },
        suggestion: String,
    }
});

const interviewSchema = new mongoose.Schema<IInterview>({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    industry: { type: String, required: [true, "Industry is required"], enum: industries },
    type: { type: String, required: [true, "Type is required"], enum: interviewTypes },
    topic: { type: String, required: [true, "Topic is required"], validate: {
        validator: function(this: IInterview, value: string) {
            return (industryTopics as Record<string, string[]>)[this.industry]?.includes(value);
        },
        message: (props) => `${props.value} is not a valid topic for the selected industry`,
    } },
    role: { type: String, required: [true, "Role is required"] },
    numOfQuestions: { type: Number, required: [true, "Number of Questions is required"] },
    answered: { type: Number, default: 0 },
    difficulty: { type: String, required: [true, "Difficulty is required"], enum: interviewDifficulties },
    duration: { 
        type: Number, 
        required: [true, "Duration is required"], 
        minlength: [2*60, `Duration must be at least 2 minute`] 
    }, // in minutes
    durationLeft: { type: Number, default: 0 }, // in minutes
    status: { type: String, default: 'pending', enum: ['pending', 'completed', 'cancelled'] }, 
    questions: {type: [questionSchema], default: [] }
}, {
    timestamps: true,
});

const Interview = mongoose.models.Interview || mongoose.model<IInterview>('Interview', interviewSchema);
export default Interview;