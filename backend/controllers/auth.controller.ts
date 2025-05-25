import dbConnect from "../config/dbConnect";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors";
import User from "../models/user.model";
import { delete_file, upload_file } from "../utils/cloudinary";

export const register = catchAsyncErrors(async (name: string, email: string, password: string) => {
    await dbConnect();

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate delay for demonstration
    const newUser = await User.create({
        name,
        email,
        password,
        authProviders: [
            {
                provider: "credentials",
                providerId: email,
            },
        ],
        roles: ["user"],
    });

    return newUser?._id ? {created: true} : (() => {
        throw new Error("User not created");
    })();
});


export const updateUserProfile = catchAsyncErrors(
    async ({
        name,
        userEmail,
        avatar,
        oldAvatar
    }: {name: string, userEmail: string, avatar?: string, oldAvatar?: string}) => {
        await dbConnect();

        const data: {
            name: string,
            profilePicture?: {id: string, url: string }
        } = {name}

        if(avatar) {
            data.profilePicture = await upload_file(avatar, "prepai/avatars")
        }
        if(oldAvatar) {
            await delete_file(oldAvatar);
        }

        await User.findOneAndUpdate({email: userEmail}, {...data});
        return {updated: true}
    }
);
