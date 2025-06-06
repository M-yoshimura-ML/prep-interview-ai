"use client";

import React, { useEffect, useState } from "react";
import { Progress, Button, Alert, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { IInterview, IQuestion } from "@/backend/models/interview.model";
import { formatTime, getFirstIncompleteQuestionIndex } from "@/helpers/helpers";

import PromptInputWithBottomActions from "./PromptInputWithBottomActions";
import toast from "react-hot-toast";
import { updateInterview } from "@/actions/interview.action";
import { getAnswerFromLocalStorage, getAnswersFromLocalStorage, saveAnswerToLocalStorage } from "@/helpers/interview";
import { useRouter } from "next/navigation";


export default function Interview({ interview }: { interview: IInterview }) {

    const initialQuestionIndex = getFirstIncompleteQuestionIndex(interview?.questions);

    const [currentQuestionIndex, setCurrentQuestionIntex] = useState(initialQuestionIndex);

    const currentQuestion = interview?.questions[currentQuestionIndex];

    const [answer, setAnswer] = useState("");
    const [answers, setAnswers] = useState<{ [key: string]: string }>({});
    const [timeLeft, setTimeLeft] = useState(interview?.durationLeft);
    const [showAlert, setShowAlert] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if(timeLeft === 0) {
            handleExitInterview();
        }
    }, [timeLeft]);

    useEffect(() => {
        // Load answers from Local storage
        const storedAnswers = getAnswersFromLocalStorage(interview?._id);
        if(storedAnswers) {
            setAnswers(storedAnswers);
        } else {
            interview?.questions?.forEach((question: IQuestion) => {
                if(question?.completed) {
                    saveAnswerToLocalStorage(
                        interview?._id,
                        question?._id,
                        question?.answer
                    )
                }
            })
        }
    }, [interview?._id]);

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

    const handleNextQuestion = async (answer: string) => {
        const previousAnswer = answers[currentQuestion?._id];

        if(previousAnswer !== answer && answer !== "") {
            await saveAnswerToDB(currentQuestion?._id, answer);
            saveAnswerToLocalStorage(interview?._id, currentQuestion?._id, answer);
        }

        setAnswers((prev) => {
            const newAnswers = {...prev};
            newAnswers[currentQuestion?._id] = answer;
            return newAnswers;
        });

        if(currentQuestionIndex < interview?.numOfQuestions - 1) {
            setCurrentQuestionIntex((prevIndex) => {
                const newIndex = prevIndex + 1;
                const nextQuestion = interview?.questions[newIndex];
                setAnswer(getAnswerFromLocalStorage(interview?._id, nextQuestion?._id) || answers[nextQuestion?._id] || "");
                return newIndex;
            });
        } else if (currentQuestionIndex === interview?.numOfQuestions - 1) {
            // user is on last question then move user to 1st question
            setCurrentQuestionIntex(0);
            setAnswer(getAnswerFromLocalStorage(interview?._id, interview.questions[0]?._id));
        } else {
            setAnswer("");
        }
    };

    const handlePassQuestion = async () => {
        await handleNextQuestion("pass");
    }

    const handlePreviousQuestion = async () => {
        if(currentQuestionIndex > 0) {
            setCurrentQuestionIntex((prevIndex) => {
                const newIndex = prevIndex - 1;
                const prevQuestion = interview?.questions[newIndex];
                setAnswer(getAnswerFromLocalStorage(interview?._id, prevQuestion?._id) || answers[prevQuestion?._id] || "");
                return newIndex;
            });
        }
    }

    const handleExitInterview = async () => {
        setLoading(true);
        try {
            const res = await updateInterview(
                interview?._id,
                timeLeft?.toString(),
                currentQuestion?._id,
                answer,
                true
            )

            if (res?.error) {
                return toast.error(res?.error?.message);
            }

            if (res?.updated) {
                setLoading(false);
                router.push("/app/interviews");
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
                label={`Question ${currentQuestionIndex + 1} of ${interview?.numOfQuestions}`}
                size="md"
                value={(currentQuestionIndex + 1) / interview?.numOfQuestions * 100}
            />
            <div className="flex flex-wrap gap-1.5">
                {interview?.questions?.map((question: IQuestion, index: number) => {
                    return (
                    <Chip
                        key={index}
                        color={answers[question?._id] ? "success" : "default"}
                        size="sm"
                        variant="flat"
                        className="font-bold cursor-pointer text-sm radius-full"
                        onClick={() => {
                            setCurrentQuestionIntex(index)
                            setAnswer(getAnswerFromLocalStorage(interview?._id, question?._id))
                        }}
                    >
                        {index + 1}
                    </Chip>
                    )
                })}
                
            
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-5">
                <span className="text-lg font-semibold text-right mb-2 sm:mb-0">
                    Duration Left: {formatTime(timeLeft)}
                </span>
                <Button
                    color="danger"
                    startContent={<Icon icon="solar:exit-outline" fontSize={18} />}
                    variant="solid"
                    isDisabled={loading}
                    isLoading={loading}
                    onPress={handleExitInterview}
                >
                    Save & Exit Interview
                </Button>
            </div>

            <span className="text-center h-40">
                <span
                    className={`tracking-tight font-semibold bg-clip-text text-transparent bg-gradient-to-b from-[#FF1CF7] to-[#b249f8] text-[1.4rem] lg:text-2.5xl flex items-center justify-center h-full`}
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
                    onPress={() => handlePreviousQuestion()}
                    isDisabled={loading || currentQuestionIndex === 0}
                    isLoading={loading}
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
                    onPress={() => handlePassQuestion()}
                    isDisabled={loading}
                    isLoading={loading}
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
                    onPress={() => handleNextQuestion(answer)}
                    isDisabled={loading}
                    isLoading={loading}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}