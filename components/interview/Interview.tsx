"use client";

import React, { useEffect, useState } from "react";
import { Progress, Button, Alert, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { IInterview, IQuestion } from "@/backend/models/interview.model";
import { formatTime, getForstIncompleteQuestionIndex } from "@/helpers/helpers";

import PromptInputWithBottomActions from "./PromptInputWithBottomActions";
import toast from "react-hot-toast";
import { updateInterview } from "@/actions/interview.action";


export default function Interview({ interview }: { interview: IInterview }) {

    const initialQuestionIndex = getForstIncompleteQuestionIndex(interview?.questions);

    const [currentQuestionIndex, setCurrentQuestionIntex] = useState(initialQuestionIndex);

    const currentQuestion = interview?.questions[currentQuestionIndex];

    const [answer, setAnswer] = useState("");
    const [timeLeft, setTimeLeft] = useState(interview?.durationLeft);
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime: number) => {
                if(prevTime <= 1) {
                    clearInterval(timer);
                    return 0;
                }

                if(prevTime === 10) {
                    setShowAlert(true);
                }

                return prevTime - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [])

    const handleAnswerChange = (value: string) => {
        setAnswer(value);
    }

    const saveAnswerToDB = async (questionId: string, answer: string) => {
        setLoading(true);
        try {
            const res = await updateInterview(
                interview?._id,
                timeLeft?.toString(),
                questionId,
                answer
            )

            if (res?.error) {
                return toast.error(res?.error?.message);
            }
        } catch (error) {
            setLoading(false);
            console.log(error);
            
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-full w-full max-w-full flex-col gap-8">
            {showAlert && 
                <Alert
                    color="danger"
                    description={"Interview is about to exit"}
                    title={"Time up!"}
                />
            }

            <Progress
                aria-label="Interview Progress"
                className="w-full"
                color="default"
                label={`Question 1 of 10`}
                size="md"
                value={((1 + 1) / 10) * 100}
            />
            <div className="flex flex-wrap gap-1.5">
                <Chip
                    color={"default"}
                    size="sm"
                    variant="flat"
                    className="font-bold cursor-pointer text-sm radius-full"
                >
                    {currentQuestionIndex + 1}
                </Chip>
            
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-5">
                <span className="text-lg font-semibold text-right mb-2 sm:mb-0">
                    Duration Left: {formatTime(timeLeft)}
                </span>
                <Button
                    color="danger"
                    startContent={<Icon icon="solar:exit-outline" fontSize={18} />}
                    variant="solid"
                    onPress={() => saveAnswerToDB(currentQuestion?._id, answer)}
                >
                    Save & Exit Interview
                </Button>
            </div>

            <span className="text-center h-40">
                <span
                    className={`tracking-tight inline font-semibold bg-clip-text text-transparent bg-gradient-to-b from-[#FF1CF7] to-[#b249f8] text-[1.4rem] lg:text-2.5xl flex items-center justify-center h-full`}
                >
                    {currentQuestion?.question}
                </span>
            </span>

            <PromptInputWithBottomActions 
              key={currentQuestionIndex} 
              value={answer} 
              onChange={handleAnswerChange}
            />

            <div className="flex justify-between items-center mt-5">
                <Button
                    className="bg-foreground px-[18px] py-2 font-medium text-background"
                    radius="full"
                    color="secondary"
                    variant="flat"
                    startContent={
                    <Icon
                        className="flex-none outline-none [&>path]:stroke-[2]"
                        icon="solar:arrow-left-linear"
                        width={20}
                    />
                    }
                >
                    Previous
                </Button>

                <Button
                    className="px-[28px] py-2"
                    radius="full"
                    variant="flat"
                    color="success"
                    startContent={
                    <Icon
                        className="flex-none outline-none [&>path]:stroke-[2]"
                        icon="solar:compass-big-bold"
                        width={18}
                    />
                    }
                >
                    Pass
                </Button>

                <Button
                    className="bg-foreground px-[18px] py-2 font-medium text-background"
                    radius="full"
                    color="secondary"
                    variant="flat"
                    endContent={
                    <Icon
                        className="flex-none outline-none [&>path]:stroke-[2]"
                        icon="solar:arrow-right-linear"
                        width={20}
                    />
                    }
                >
                    Next
                </Button>
            </div>
        </div>
    );
}