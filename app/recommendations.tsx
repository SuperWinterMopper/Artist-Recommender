"use client"

import { useEffect, useState } from "react";
import type { ReccomendedArtist } from "./constants/interfaces"
import { Question } from "./constants/interfaces";
import useSpotifyMap from "./hooks/useSpotifyMap";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Recommendations({ artists }: { artists: ReccomendedArtist[]}) {
  const [recs, setRecs] = useState<(Question & { match_score: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        // Get artist details from Spotify
        const questions = await useSpotifyMap(artists.map((x) => x.artist_name));
        
        // Merge Spotify data with match scores
        const mergedRecs = questions.map(q => {
          const matchedArtist = artists.find(a => 
            a.artist_name.toLowerCase() === q.artist_name.toLowerCase());
          return {
            ...q,
            match_score: matchedArtist?.match_score || 0
          };
        }).sort((a, b) => b.match_score - a.match_score); // Sort by match score
        
        setRecs(mergedRecs);
      } catch (err) {
        console.error("Error fetching artist details:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtists();
  }, [artists]);

  if (loading || recs.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-orange-500 border-r-2 rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Finding your perfect matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2">Your Music Matches</h1>
        <p className="text-muted-foreground text-center mb-10">
          Our K-NN model found these artists based on your preferences!
        </p>
        
        <div className="flex flex-col gap-8">
          {recs.map((artist) => (
            <Card key={artist.id} className="overflow-hidden border border-orange-300/20 bg-orange-50/5 shadow-md hover:shadow-orange-500/10 transition-all">
              <div className="flex flex-col">
                {/* Artist Image - Now above text content */}
                <div className="w-full h-[240px] relative">
                  <img 
                    src={artist.artist_image || "/placeholder.svg"} 
                    alt={artist.artist_name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Match score overlay */}
                  <div className="absolute top-0 right-0 bg-black/70 text-white px-3 py-1 rounded-bl-md font-mono">
                    {Math.round(artist.match_score * 100)}% match
                  </div>
                </div>
                
                {/* Artist Details */}
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-3">{artist.artist_name}</h2>
                  
                  {/* Match score visual */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Match Score</span>
                      <span>{Math.round(artist.match_score * 100)}%</span>
                    </div>
                    <Progress 
                      value={artist.match_score * 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  {/* Genres */}
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1.5">
                      {artist.artist_genres.slice(0, 5).map((genre, idx) => (
                        <Badge key={idx} variant="outline" className="bg-orange-500/10 text-xs">
                          {genre}
                        </Badge>
                      ))}
                      {artist.artist_genres.length > 5 && (
                        <Badge variant="outline" className="bg-muted/50 text-xs">
                          +{artist.artist_genres.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}