'use server';

import { register, updateUserProfile } from "@/backend/controllers/auth.controller";

export async function registerUser(name: string, email: string, password: string) {
    return await register(name, email, password);
}

export async function updateProfile({
    name,
    email,
    avatar,
    oldAvatar
}: {
    name: string;
    email: string;
    avatar?: string;
    oldAvatar?: string;
}) {
    return await updateUserProfile({name, userEmail: email, avatar, oldAvatar});
}