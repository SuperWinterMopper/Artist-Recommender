"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import type { Question, Rating } from "./constants/interfaces"
import useQuestionArtistNames from "./hooks/useQuestionArtistNames"
import useSpotifyMap from "./hooks/useSpotifyMap"
import useSubmit from "./hooks/useSubmit"
import { numQuestions } from "./constants/constants"


const ratings: Rating[] = [
  { value: 1.0, label: "Love them" },
  { value: 0.75, label: "Like them", },
  { value: 0.5, label: "Tolerate them", },
  { value: 0.25, label: "Dislike them", },
  { value: 0.0, label: "Hate them", },
]

export default function MusicQuestionnaire() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const artistNames: string[] = await useQuestionArtistNames();
      const q: Question[] = await useSpotifyMap(artistNames);
      setQuestions(q);
    }
    // fetchQuestions();

    const testSubmit = async () => {
      const dummyRatings: Rating[] = [{'label': 'The Beatles', 'value': 1}, {'label': 'Radiohead', 'value': 1}, {'label': 'Linkin Park', 'value': 1}, {'label': 'Coldplay', 'value': 1}, {'label': 'Muse', 'value': 1}, {'label': 'Pink Floyd', 'value': 1}, {'label': 'Metallica', 'value': 1}, {'label': 'Nine Inch Nails', 'value': 1}, {'label': 'Depeche Mode', 'value': 1}, {'label': 'Christina Aguilera', 'value': 1}, {'label': 'Lil Wayne', 'value': 1}, {'label': 'System Of A Down', 'value': 1}, {'label': 'Red Hot Chili Peppers', 'value': 1}, {'label': 'Placebo', 'value': 1}, {'label': 'In Flames', 'value': 1}, {'label': 'Death Cab for Cutie', 'value': 1}, {'label': 'Rammstein', 'value': 1}, {'label': 'Rise Against', 'value': 1}, {'label': 'Bob Dylan', 'value': 1}, {'label': 'The Killers', 'value': 1}, {'label': 'Arctic Monkeys', 'value': 1}, {'label': 'AFI', 'value': 1}, {'label': 'Nirvana', 'value': 1}, {'label': 'Led Zeppelin', 'value': 1}, {'label': 'Korn', 'value': 1}, {'label': 'Garbage', 'value': 1}, {'label': 'Iron Maiden', 'value': 1}, {'label': 'Green Day', 'value': 1}, {'label': 'Nightwish', 'value': 1}, {'label': 'The Cure', 'value': 1}, {'label': 'Kanye West', 'value': 1}, {'label': 'The Smashing Pumpkins', 'value': 1}, {'label': 'David Bowie', 'value': 1}, {'label': 'AC/DC', 'value': 1}, {'label': 'Queen', 'value': 1}, {'label': 'Björk', 'value': 1}, {'label': 'Daft Punk', 'value': 1}, {'label': 'Jack Johnson', 'value': 1}, {'label': 'Sigur Rós', 'value': 1}, {'label': 'Tom Waits', 'value': 1}, {'label': 'U2', 'value': 1}, {'label': 'TOOL', 'value': 1}, {'label': 'Böhse Onkelz', 'value': 1}, {'label': 'Britney Spears', 'value': 1}, {'label': 'Elliott Smith', 'value': 1}, {'label': 'Madonna', 'value': 1}, {'label': 'The Prodigy', 'value': 1}, {'label': 'Oasis', 'value': 1}, {'label': 'Queens of the Stone Age', 'value': 1}, {'label': 'Boards of Canada', 'value': 1}]

      const x = await useSubmit("m", 30, dummyRatings); 
      console.log("useSubmit(dummyRatings) has returned with ", x);
    }
    testSubmit();

  }, []);

  useEffect(() => {
    if (!isComplete) return;

    // avoid calling twice
    if (isSubmitting) return;

    const submit = async () => {
      setIsSubmitting(true);

      // convert responses Record<number, number> to array with artist names instead of IDs
      const ratingsArray = Object.entries(responses).map(([artistIdStr, rating]) => {
        const artistId = Number(artistIdStr);
        // lookup the artist name from questions array
        const artistName = questions.find(q => q.id === artistId)?.artist_name || artistIdStr;
        return {
          label: artistName, 
          value: Number(rating),
        };
      });

      try {
        // await useSubmit(ratingsArray); 
        // router.push("/results");
      } catch (err) {
        console.error("submit failed", err);
        // optional: show UI error
      } finally {
        setIsSubmitting(false);
      }
    };

    submit();
  }, [isComplete, questions, responses]); // add questions to dependencies

  useEffect(() => () => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  if (questions.length == 0) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  // Save selection only; schedule a single advance (guarded) when answering the question for the first time
  const handleRating = (artistId: string, rating: number) => {
    setResponses((prev) => {
      const alreadyAnswered = prev[artistId] !== undefined
      const next = { ...prev, [artistId]: rating }

      if (!alreadyAnswered) {
        // clear any previously scheduled advance (avoid double increments)
        if (advanceTimerRef.current) {
          window.clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = null;
        }

        // schedule a single advance that calls goNext with the updated responses snapshot
        advanceTimerRef.current = window.setTimeout(() => {
          advanceTimerRef.current = null;
          goNext(next);
        }, 250);
      }

      return next
    })
  }

  const resetQuestionnaire = () => {
    setCurrentQuestion(0)
    setResponses({})
    setIsComplete(false)
  }

  const goPrev = () => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setCurrentQuestion((q) => Math.max(0, q - 1))
  }

  const goNext = (maybeResponses?: Record<number, number>) => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((q) => q + 1)
      return
    }

    setIsComplete(true)
  }

  const progress = ((currentQuestion) / questions.length) * 100

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-orange-300/20 bg-orange-50/5 shadow-sm">
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

            <h1 className="text-4xl font-bold mb-4 text-balance">{currentArtist.artist_name}</h1>

            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {currentArtist.artist_genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="text-sm bg-orange-600">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-muted-foreground mb-4">I...</p>
            {ratings.map((rating) => {
              // map each rating to its active and hover classes (green -> red)
              const activeCls = rating.value === 1.0
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : rating.value === 0.75
                ? "bg-lime-400 hover:bg-lime-500 text-black"
                : rating.value === 0.5
                ? "bg-yellow-400 hover:bg-yellow-500 text-black"
                : rating.value === 0.25
                ? "bg-orange-400 hover:bg-orange-500 text-black"
                : "bg-red-500 hover:bg-red-600 text-white";

              const hoverOnly = rating.value === 1.0
                ? "hover:bg-emerald-500 hover:text-white"
                : rating.value === 0.75
                ? "hover:bg-lime-500 hover:text-black"
                : rating.value === 0.5
                ? "hover:bg-yellow-500 hover:text-black"
                : rating.value === 0.25
                ? "hover:bg-orange-500 hover:text-black"
                : "hover:bg-red-600 hover:text-white";

              const base = "w-full h-14 text-base font-medium transition-all duration-300 border border-border";

              const className = selectedRating === rating.value
                ? `${base} ${activeCls} scale-105`
                : `${base} bg-card text-foreground ${hoverOnly}`;

              return (
                <Button
                  key={rating.value}
                  onClick={() => handleRating(currentArtist.artist_name, rating.value)}
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
              <Button
                onClick={() => goNext()} // Wrap in an arrow function that ignores the event
                variant="secondary"
                disabled={!selectedRating}
              >
                {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
