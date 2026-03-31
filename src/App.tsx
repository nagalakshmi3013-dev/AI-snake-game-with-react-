/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Types ---
interface Point {
  x: number;
  y: number;
}

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
}

// --- Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION: Point = { x: 0, y: -1 };
const GAME_SPEED = 120; // Faster, more jarring

const TRACKS: Track[] = [
  {
    id: 1,
    title: "ERR_NO_SIGNAL",
    artist: "SYS_ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "MEMORY_LEAK",
    artist: "KERNEL_PANIC",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "BUFFER_OVERFLOW",
    artist: "NULL_POINTER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

export default function App() {
  // --- Snake Game State ---
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // --- Music Player State ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  // --- Game Logic ---
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    setFood(generateFood(INITIAL_SNAKE));
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setIsGameOver(true);
        setIsPaused(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, isGameOver, isPaused, score, highScore, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
        case 'r':
        case 'R':
          resetGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake]);

  // --- Music Logic ---
  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlayingMusic) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      setIsPlayingMusic(!isPlayingMusic);
    }
  };

  const skipTrack = (dir: 'next' | 'prev') => {
    let nextIndex = currentTrackIndex + (dir === 'next' ? 1 : -1);
    if (nextIndex >= TRACKS.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = TRACKS.length - 1;
    setCurrentTrackIndex(nextIndex);
    setIsPlayingMusic(true);
  };

  useEffect(() => {
    if (audioRef.current && isPlayingMusic) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }
  }, [currentTrackIndex, isPlayingMusic]);

  return (
    <div className="min-h-screen bg-black text-[#00f3ff] font-mono flex flex-col items-center justify-center p-4 overflow-hidden relative screen-tear">
      
      {/* CRT Effects */}
      <div className="fixed inset-0 bg-static z-50 pointer-events-none mix-blend-overlay"></div>
      <div className="fixed inset-0 scanlines z-50 pointer-events-none"></div>

      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: SYS_CTRL */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
          <div className="border-2 border-[#00f3ff] bg-black p-4 shadow-[4px_4px_0px_#ff00ff]">
            <h2 className="text-xl text-[#ff00ff] mb-4 border-b-2 border-[#ff00ff] pb-2 glitch" data-text="&gt;&gt; SYS_RANKING">&gt;&gt; SYS_RANKING</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#00f3ff]/60 mb-1">ACTIVE_CYCLES</p>
                <p className="text-4xl text-[#00f3ff]">{score.toString().padStart(4, '0')}</p>
              </div>
              <div className="h-[2px] bg-[#00f3ff]/30" />
              <div>
                <p className="text-sm text-[#00f3ff]/60 mb-1">PEAK_CYCLES</p>
                <p className="text-4xl text-[#ff00ff]">{highScore.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>

          <div className="border-2 border-[#00f3ff] bg-black p-4 shadow-[4px_4px_0px_#ff00ff]">
            <h2 className="text-xl text-[#ff00ff] mb-4 border-b-2 border-[#ff00ff] pb-2 glitch" data-text="&gt;&gt; INPUT_VECTORS">&gt;&gt; INPUT_VECTORS</h2>
            <ul className="text-sm space-y-3 text-[#00f3ff]">
              <li className="flex justify-between"><span>MOVE</span> <span>[ARROWS]</span></li>
              <li className="flex justify-between"><span>HALT</span> <span>[SPACE]</span></li>
              <li className="flex justify-between"><span>REBOOT</span> <span>[R]</span></li>
            </ul>
          </div>
        </div>

        {/* Center Column: Game Window */}
        <div className="lg:col-span-6 order-1 lg:order-2">
          <div 
            className="relative aspect-square bg-black border-4 border-[#00f3ff] shadow-[8px_8px_0px_#ff00ff] overflow-hidden"
            style={{ borderColor: isGameOver ? '#ff00ff' : '#00f3ff' }}
          >
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-30 pointer-events-none" 
              style={{ 
                backgroundImage: 'linear-gradient(#00f3ff 1px, transparent 1px), linear-gradient(90deg, #00f3ff 1px, transparent 1px)', 
                backgroundSize: '5% 5%' 
              }} 
            />

            {/* Score Overlay in Game Window */}
            <div className="absolute top-4 left-6 z-30 pointer-events-none">
              <div className="glitch-wrapper">
                <div className="glitch text-6xl md:text-8xl" data-text={score.toString().padStart(4, '0')}>
                  {score.toString().padStart(4, '0')}
                </div>
              </div>
            </div>

            {/* Game Canvas Simulation */}
            <div className="absolute inset-0 p-1">
              <div className="relative w-full h-full grid grid-cols-20 grid-rows-20 gap-[1px]">
                {/* Snake Body */}
                {snake.map((segment, i) => (
                  <div
                    key={`${i}-${segment.x}-${segment.y}`}
                    className="bg-[#00f3ff]"
                    style={{
                      gridColumnStart: segment.x + 1,
                      gridRowStart: segment.y + 1,
                      opacity: i === 0 ? 1 : 0.7,
                      zIndex: i === 0 ? 10 : 5
                    }}
                  />
                ))}

                {/* Food */}
                <div
                  className="bg-[#ff00ff] animate-pulse"
                  style={{
                    gridColumnStart: food.x + 1,
                    gridRowStart: food.y + 1,
                  }}
                />
              </div>
            </div>

            {/* Game Over Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 border-4 border-[#ff00ff] m-2">
                <div className="glitch-wrapper mb-4">
                  <h2 className="text-5xl text-[#ff00ff] glitch" data-text="SYSTEM_FAILURE">SYSTEM_FAILURE</h2>
                </div>
                <p className="text-[#00f3ff] mb-8 text-xl">CYCLES_SURVIVED: {score}</p>
                <button 
                  onClick={resetGame}
                  className="px-6 py-2 border-2 border-[#00f3ff] text-[#00f3ff] hover:bg-[#00f3ff] hover:text-black transition-colors text-xl"
                >
                  [ INITIATE_REBOOT ]
                </button>
              </div>
            )}

            {/* Start/Pause Overlay */}
            {isPaused && !isGameOver && (
              <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-40 border-4 border-[#00f3ff] m-2">
                <div className="glitch-wrapper mb-6">
                  <h2 className="text-4xl text-[#00f3ff] glitch" data-text="AWAITING_INPUT">AWAITING_INPUT</h2>
                </div>
                <button 
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-2 border-2 border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-black transition-colors text-xl animate-pulse"
                >
                  [ PRESS_SPACE_TO_EXECUTE ]
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Music Player */}
        <div className="lg:col-span-3 space-y-6 order-3">
          <div className="border-2 border-[#00f3ff] bg-black p-4 shadow-[4px_4px_0px_#ff00ff] flex flex-col">
            <h2 className="text-xl text-[#ff00ff] mb-4 border-b-2 border-[#ff00ff] pb-2 glitch" data-text="&gt;&gt; AUDIO_STREAM">&gt;&gt; AUDIO_STREAM</h2>

            {/* Harsh Visualizer */}
            <div className="w-full h-24 mb-6 border-2 border-[#00f3ff] p-2 flex items-end justify-between gap-1">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i}
                  className="w-full bg-[#ff00ff]"
                  style={{ 
                    height: isPlayingMusic ? `${Math.max(10, Math.random() * 100)}%` : '10%',
                    transition: 'height 0.1s ease-in-out'
                  }}
                />
              ))}
            </div>

            <div className="mb-6 border-l-4 border-[#ff00ff] pl-3">
              <h3 className="text-2xl text-[#00f3ff] truncate">{currentTrack.title}</h3>
              <p className="text-sm text-[#00f3ff]/60 truncate">SRC: {currentTrack.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mb-4 border-2 border-[#00f3ff] p-2">
              <button onClick={() => skipTrack('prev')} className="text-[#00f3ff] hover:text-[#ff00ff] hover:bg-[#00f3ff]/20 px-2">
                [ &lt;&lt; ]
              </button>
              <button 
                onClick={toggleMusic}
                className="text-[#ff00ff] hover:text-[#00f3ff] hover:bg-[#ff00ff]/20 px-4 text-xl"
              >
                {isPlayingMusic ? '[ || ]' : '[ > ]'}
              </button>
              <button onClick={() => skipTrack('next')} className="text-[#00f3ff] hover:text-[#ff00ff] hover:bg-[#00f3ff]/20 px-2">
                [ &gt;&gt; ]
              </button>
            </div>

            <div className="w-full flex items-center gap-3 text-[#00f3ff]">
              <span className="text-xs">VOL</span>
              <div className="flex-1 h-2 border border-[#00f3ff] p-[1px]">
                <div 
                  className="h-full bg-[#ff00ff]"
                  style={{ width: isPlayingMusic ? '100%' : '0%', transition: 'width 0.2s' }}
                />
              </div>
            </div>
          </div>

          {/* Hidden Audio Element */}
          <audio 
            ref={audioRef} 
            src={currentTrack.url} 
            onEnded={() => skipTrack('next')}
          />
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-4 left-0 w-full flex justify-center pointer-events-none z-10">
        <div className="flex items-center gap-4 text-[#00f3ff]/40">
          <div className="h-[2px] w-16 bg-[#00f3ff]/40" />
          <p className="text-sm glitch" data-text="TERMINAL_NODE_77">TERMINAL_NODE_77</p>
          <div className="h-[2px] w-16 bg-[#00f3ff]/40" />
        </div>
      </footer>
    </div>
  );
}
