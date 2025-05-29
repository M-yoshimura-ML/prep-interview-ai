import { evaluateInterviewAnswer } from '@/actions/interview.action';
import { Button } from '@heroui/react'
import React from 'react'

const Results = () => {
    const handleClick = () => {
        evaluateInterviewAnswer();
    }
    return (
        <Button onPress={handleClick}>Evaluate</Button>
    )
}

export default Results