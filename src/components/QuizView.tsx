import { useState, useMemo } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Loader2, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Question } from "../store/storiesSlice"
import { prepareQuizQuestions, checkAllQuestionsCorrect } from "../utils/quizUtils"

interface QuizViewProps {
  questions: Question[]
  isLoading: boolean
  onComplete: () => void
  onSkip: () => void
  onLikeFeedback: (status: "like" | "dislike") => void
  likeStatus: "like" | "dislike" | null
  feedbackSubmitted: boolean
}

export function QuizView({
  questions,
  isLoading,
  onComplete,
  onSkip,
  onLikeFeedback,
  likeStatus,
  feedbackSubmitted
}: QuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [incorrectAnswers, setIncorrectAnswers] = useState<Record<string, boolean>>({})
  const [correctAnswers, setCorrectAnswers] = useState<Record<string, boolean>>({})

  // Shuffle options once when questions change
  const shuffledQuestions = useMemo(
    () => prepareQuizQuestions(questions),
    [questions]
  )

          
  // Test mode: highlights correct answers for local testing
  const isTestMode = process.env.REACT_APP_TEST_MODE === 'true'

  const handleAnswerSelect = (questionId: string, answerIndex: number, correctAnswer: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }))

    if (answerIndex === correctAnswer) {
      // Correct answer
      setCorrectAnswers(prev => ({ ...prev, [questionId]: true }))
      setIncorrectAnswers(prev => ({ ...prev, [questionId]: false }))
    } else {
      // Incorrect answer
      setIncorrectAnswers(prev => ({ ...prev, [questionId]: true }))
      setCorrectAnswers(prev => ({ ...prev, [questionId]: false }))
    }
  }

  const allQuestionsCorrect = checkAllQuestionsCorrect(questions, correctAnswers)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading questions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {shuffledQuestions.map((question, qIndex) => (
        <Card key={question.id} className="p-6 bg-card shadow-sm">
          <h3 className="text-lg font-medium mb-4 text-card-foreground">
            {qIndex + 1}. {question.text}
          </h3>
          <div className="space-y-3">
            {question.shuffledOptions.map((option, optIndex) => {
              const isSelected = selectedAnswers[question.id] === optIndex
              const isCorrect = correctAnswers[question.id] && isSelected
              const isIncorrect = incorrectAnswers[question.id] && isSelected
              const isAnswered = correctAnswers[question.id]
              const isCorrectAnswer = optIndex === question.correctAnswerIndex

              return (
                <button
                  key={optIndex}
                  onClick={() => handleAnswerSelect(question.id, optIndex, question.correctAnswerIndex)}
                  disabled={isAnswered}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isCorrect
                      ? "bg-green-500/20 border-green-500 text-green-700"
                      : isIncorrect
                        ? "bg-red-500/20 border-red-500 text-red-700"
                        : isTestMode && isCorrectAnswer
                          ? "border-yellow-400 bg-yellow-50/50 hover:bg-yellow-100/50"
                          : "border-border hover:border-primary hover:bg-primary/5"
                  } ${isAnswered ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  {isTestMode && isCorrectAnswer && !isAnswered && (
                    <span className="inline-block mr-2 text-yellow-600">✓</span>
                  )}
                  {option}
                </button>
              )
            })}
          </div>
        </Card>
      ))}

      {/* Like/Dislike buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => onLikeFeedback("like")}
          className={`gap-2 ${
            likeStatus === "like"
              ? "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground"
              : ""
          }`}
        >
          <ThumbsUp className="h-5 w-5" />
          Like
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => onLikeFeedback("dislike")}
          className={`gap-2 ${
            likeStatus === "dislike"
              ? "bg-destructive text-destructive-foreground border-destructive hover:bg-destructive hover:text-destructive-foreground"
              : ""
          }`}
        >
          <ThumbsDown className="h-5 w-5" />
          Dislike
        </Button>
      </div>

      {/* Complete and Skip buttons */}
      <div className="flex flex-col items-center gap-3 pt-4">
        <Button
          onClick={onComplete}
          disabled={!allQuestionsCorrect}
          size="lg"
          className="px-12 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Complete
        </Button>
        <Button
          onClick={onSkip}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          Skip
        </Button>
      </div>
    </div>
  )
}
