'use server';

import { createSubscription } from "@/backend/controllers/payment.controller";

export async function createNewSubscription(
    email: string,
    paymentMethodId: string
) {
    return await createSubscription(email, paymentMethodId);
}

