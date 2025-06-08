"use client";

import React, { use, useEffect, useState } from "react";

import { Button, Input, Radio, RadioGroup } from "@heroui/react";
import { Logo } from "@/config/Logo";
import { Icon } from "@iconify/react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { create } from "domain";
import { createNewSubscription } from "@/actions/payment.action";
import { set } from "mongoose";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const Subscribe = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

const CheckoutForm = () => {
    const  { data, update } = useSession();
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (data?.user?.email) {
            setEmail(data.user.email);
        }
    }, [data]);

    useEffect(() => {
        if(error) {
            toast.error(error);
            setError(null);
        }
    }, [error]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        setLoading(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);
        try {
            if (!cardElement) {
                throw new Error("Card element not found");
            }

            const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
                billing_details: {
                    email: email,
                },
            });

            if (stripeError) {
                setError(stripeError.message || "An error occurred while processing your payment.");
                setLoading(false);
                return;
            }

            // Call your backend to create a subscription
            const res = await createNewSubscription(email, paymentMethod.id);

            if (!res) {
                setError(res.error?.message);
                setLoading(false);
                return;
            }

            if(res?.subscription) {
                setLoading(false);

                const updateSession = await update({
                    subscription: {
                        id: res.subscription.id,
                        status: res.subscription.status,
                    }
                });

                if(updateSession) {
                    toast.success("Subscription successful!");
                    router.push("/app/dashboard");
                }
                
            }
        } catch (err) {
            console.error("Error creating subscription:", err);
            setError("An error occurred while processing your payment.");
            setLoading(false);
        }
    }


    return (
        <div className="flex h-full w-full items-center justify-center">
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-large">
                <div className="flex flex-col items-center pb-6">
                    <Logo />
                    <p className="text-xl font-medium">Subscribe</p>
                    <p className="text-small text-default-500">
                        Enter your email and card details to subscribe
                    </p>
                </div>

                <form onSubmit={handleSubmit}  className="flex flex-col gap-5">
                    <RadioGroup isDisabled label="Your Plan" defaultValue={"9.99"}>
                    <Radio value="9.99">$9.99 per month</Radio>
                    </RadioGroup>

                    <Input
                        type="email"
                        label="Email Address"
                        placeholder="Email"
                        variant="bordered"
                        value={email}
                        isDisabled
                    />
                    <div className="my-4">
                        <CardElement options={{
                            style: {
                            base: {
                                fontSize: '16px',
                            },
                            },
                            hidePostalCode: true,
                            }} 
                        />
                    </div>
                    <Button
                        className="w-full"
                        color="primary"
                        type="submit"
                        startContent={<Icon icon="solar:card-send-bold" fontSize={19} />}
                        isDisabled={!stripe || !elements || loading}
                    >
                        {loading ? "Processing..." : "Subscribe"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Subscribe;