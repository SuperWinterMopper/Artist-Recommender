"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Question, Rating } from "./constants/interfaces"
import useQuestionArtistNames from "./hooks/useQuestionArtistNames"
import useSpotifyMap from "./hooks/useSpotifyMap"


const ratings: Rating[] = [
  { value: "1.0", label: "Love them", color: "bg-accent hover:bg-accent/90" },
  { value: ".75", label: "Like them", color: "bg-primary hover:bg-primary/90" },
  { value: ".5", label: "Tolerate them", color: "bg-muted hover:bg-muted/90" },
  { value: ".25", label: "Dislike them", color: "bg-secondary hover:bg-secondary/90" },
  { value: "0.0", label: "Hate them", color: "bg-destructive hover:bg-destructive/90" },
]

export default function MusicQuestionnaire() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      const artistNames: string[] = await useQuestionArtistNames();
      const q: Question[] = await useSpotifyMap(artistNames);
      setQuestions(q);
    }
    fetchQuestions();
  }, [])

  if (questions.length == 0) {
    return <div>Nothing</div>
  }

  const handleRating = (artistId: number, rating: string) => {
    // Save selection only; do not auto-advance so the selected color persists
    setResponses((prev) => ({ ...prev, [artistId]: rating }))
  }

  const resetQuestionnaire = () => {
    setCurrentQuestion(0)
    setResponses({})
    setIsComplete(false)
  }

  const goPrev = () => {
    setCurrentQuestion((q) => Math.max(0, q - 1))
  }

  const goNext = () => {
    setCurrentQuestion((q) => {
      if (q < questions.length - 1) return q + 1
      setIsComplete(true)
      return q
    })
  }

  const progress = ((currentQuestion) / questions.length) * 100

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Questionnaire Complete!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for rating {questions.length} artists. Your responses have been recorded.
            </p>
            <Button onClick={resetQuestionnaire} className="w-full">
              Take Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentArtist = questions[currentQuestion]
  const selectedRating = responses[currentArtist.id]

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="w-full max-w-lg">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="relative w-48 h-48 mx-auto mb-6 rounded-lg overflow-hidden">
              <img
                src={currentArtist.artist_image || "/placeholder.svg"}
                alt={currentArtist.artist_name}
                className="w-full h-full object-cover"
              />
            </div>

            <h1 className="text-3xl font-bold mb-4 text-balance">{currentArtist.artist_name}</h1>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {currentArtist.artist_genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-sm">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-muted-foreground mb-4">How do you feel about this artist?</p>
            {ratings.map((rating) => {
              // map each rating to its active and hover classes (green -> red)
              const activeCls = rating.value === "1.0"
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : rating.value === ".75"
                ? "bg-lime-400 hover:bg-lime-500 text-black"
                : rating.value === ".5"
                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                : rating.value === ".25"
                ? "bg-orange-400 hover:bg-orange-500 text-black"
                : "bg-red-500 hover:bg-red-600 text-white";

              const hoverOnly = rating.value === "1.0"
                ? "hover:bg-emerald-500 hover:text-white"
                : rating.value === ".75"
                ? "hover:bg-lime-500 hover:text-black"
                : rating.value === ".5"
                ? "hover:bg-yellow-500 hover:text-black"
                : rating.value === ".25"
                ? "hover:bg-orange-500 hover:text-black"
                : "hover:bg-red-600 hover:text-white";

              const base = "w-full h-14 text-base font-medium transition-all duration-300 border border-border";

              const className = selectedRating === rating.value
                ? `${base} ${activeCls} scale-105`
                : `${base} bg-card text-foreground ${hoverOnly}`;

              return (
                <Button
                  key={rating.value}
                  onClick={() => handleRating(currentArtist.id, rating.value)}
                  className={className}
                >
                  {rating.label}
                </Button>
              );
            })}

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button onClick={goPrev} disabled={currentQuestion === 0} variant="outline">
                Back
              </Button>
              <Button onClick={goNext} variant="secondary" disabled={!selectedRating}>
                {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
