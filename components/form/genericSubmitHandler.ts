import React, { useState } from "react";

type SubmitCallback = (data: Record<string, any>) => Promise<any>;

export const useGenericSubmitHandler = (callback: SubmitCallback) => {
    const  [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            // const data = Object.fromEntries(formData.entries());
            const data: Record<string, any> = {};
            formData.forEach((value, key) => {
                data[key] = value?.toString() || "";
            });
            await callback(data);
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    }

    return { handleSubmit, loading };
}

