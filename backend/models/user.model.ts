import { userRoles } from "@/constants/constants";
import bcrypt from "bcryptjs";
import crypto from "crypto";
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
        customerId: string;
        created: Date;
        status: string;
        startDate: Date;
        currentPeriodEnd: Date;
        nextPaymentAttempt: Date;
    };
    resetPasswordToken: string;
    resetPasswordExpire: Date;
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
        customerId: {
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
        nextPaymentAttempt: {
            type: Date,
            default: null,
        },
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
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

userSchema.methods.comparePassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password || "");
};

userSchema.methods.getResetPasswordToken = function (): string {
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    //Has token and set to resetPasswordToken
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    //Set expire time
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000; //30min
    return resetToken;
}


const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;

