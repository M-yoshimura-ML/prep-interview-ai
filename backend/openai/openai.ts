import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateQuestions = async (
    industry: string,
    topic: string,
    type: string,
    role: string,
    numOfQuestion: number,
    duration: number,
    difficulty: string
) => {
    const tokensPerQuestion = 500;
    const maxToken = tokensPerQuestion * numOfQuestion;
    const prompt = `
      Generate total "${numOfQuestion}" "${difficulty}" "${type}" interview questions for the topic "${topic}" in the "${industry}" industry.
      The interview is for a candidate applying the role of "${role}" and total duration of interview is "${duration}" minutes. 

      **ENsure the following:**
      - The question are well-balanced, including both open-ended and specific questions.
      - Each question is designed to evaluate a specific skill or knowledge area relevant to the role.
      - The questions are clear, concise and engaging for the candidate.
      - The questions are suitable for a "${difficulty}" interview in the "${industry}" industry.
      - Ensure the questions are directly aligned with "${difficulty}" responsibilities and expertise in "${role}".

      **Instruction:**
      - Always follow same format for questions.
      - Provide all questions without any prefix.
      - No question number or bullet points or hypen - is required.
    `;

    const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
            {
                role: 'system',
                content: "You are expert in generating questions tailored to specific roles and industries, experience levels and topics. You responses should be professional, concise and well-structured."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: maxToken,
        temperature: 0.8
    });
}

export const evaluateAnswer = async () => {}