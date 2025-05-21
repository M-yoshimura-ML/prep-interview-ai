import { userRoles } from "@/constants/constants";
import bcrypt from "bcryptjs";
import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    _id: string;
    name: string;
    email: string;
    roles: string[];
    profilePicture: {
        id: string;
        url: string | null;
    };
    password?: string | null;
    authProviders: {
        provider: string;
        providerId: string;
    }[];
    subscription: {
        id: string;
        customer: string;
        created: Date;
        status: string;
        startDate: Date;
        currentPeriodEnd: Date;
        nextPaymentAtetmp: Date;
    };
}

const authProvidersSchema = new mongoose.Schema({
    provider: {
        type: String,
        required: true,
        enum: ["google", "github", "credentials"],
    },
    providerId: {
        type: String,
        required: true,
    },
});

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, "Please enter your name"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: [true, "Email already exists"],
        trim: true,
        lowercase: true,
    },
    roles: {
        type: [String],
        default: ["user"],
        enum: userRoles,
    },
    profilePicture: {
        id: String,
        url: {
            type: String,
            default: null,
        },
    },
    password: {
        type: String,
        select: false, // false means it won't be returned in queries
        minlength: [8, "Password must be at least 8 characters"],
        default: null,
    },
    authProviders: {
        type: [authProvidersSchema],
        default: [],
    },
    subscription: {
        id: {
            type: String,
            default: null,
        },
        customer: {
            type: String,
            default: null,
        },
        created: {
            type: Date,
            default: null,
        },
        status: {
            type: String,
            default: null,
        },
        startDate: {
            type: Date,
            default: null,
        },
        currentPeriodEnd: {
            type: Date,
            default: null,
        },
        nextPaymentAtetmp: {
            type: Date,
            default: null,
        },
    },
}, {
    timestamps: true,
});

//Encrypt password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    // Hash the password here
    if (this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password || "");
}

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;

