import { IQuestion } from "@/backend/models/interview.model";
import { pageIcons } from "@/constants/pages";

export function getPageIconAndPath(pathname: string): {
    icon: string;
    color: string;
} {
    return pageIcons[pathname];
}

export const getForstIncompleteQuestionIndex = (questions: IQuestion[]) => {
    const firstIncompleteIndex = questions.findIndex(
        (question) => !question?.completed
    );

    return firstIncompleteIndex !== -1 ? firstIncompleteIndex : 0;
}