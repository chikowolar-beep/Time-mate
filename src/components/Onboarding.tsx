import { useState } from 'react';
import { Sparkles, Calendar, Droplets, Target, User, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { synth } from '../utils/synth';

interface OnboardingProps {
  onComplete: (name: string, dailyWaterGoal: number) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [slide, setSlide] = useState(0);
  const [name, setName] = useState('Ben');
  const [waterGoal, setWaterGoal] = useState(2000); // 2000ml default

  const handleNext = () => {
    synth.playBubble();
    if (slide < 2) {
      setSlide(slide + 1);
    } else {
      if (!name.trim()) {
        alert('Please tell us your name to personalize your experience.');
        return;
      }
      onComplete(name, waterGoal);
    }
  };

  const slides = [
    {
      icon: <Sparkles className="w-16 h-16 text-sky-500 animate-pulse" />,
      title: "Welcome to TimeMate",
      tagline: "Your Smart Daily Companion",
      desc: "Designed to keep your daily timetable, hydration, professional focus, and scheduled calls in perfect harmony with Material 3 styling."
    },
    {
      icon: <Calendar className="w-16 h-16 text-indigo-500" />,
      title: "All-In-One Organizer",
      tagline: "Seamless Scheduling & Timetables",
      desc: "Easily schedule daily meetings, set custom recurrences, log scheduled calls, and track work sessions smoothly."
    },
    {
      icon: <Droplets className="w-16 h-16 text-teal-400" />,
      title: "Smart Daily Companion",
      tagline: "Healthy Habits & Focus Mode",
      desc: "Stay hydrated with timely reminders, start customizable focus pomodoros, and receive synthesized notifications on time."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-sans leading-relaxed">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col min-h-[500px]">
        
        {/* Dynamic Header */}
        <div className="px-6 pt-8 flex justify-between items-center text-xs font-semibold tracking-wider text-gray-400 uppercase">
          <span>TimeMate Companion</span>
          <span>{slide + 1} / 4</span>
        </div>

        {/* Slide Carousel Section */}
        <div className="flex-1 flex flex-col justify-center px-8 py-6 text-center">
          <AnimatePresence mode="wait">
            {slide < 3 ? (
              <motion.div
                key={`slide-${slide}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="p-4 bg-gray-50 dark:bg-gray-750 rounded-full mb-6 shadow-sm border border-gray-150 dark:border-gray-700">
                  {slides[slide].icon}
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {slides[slide].title}
                </h1>
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1 mb-3">
                  {slides[slide].tagline}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 px-2 leading-relaxed">
                  {slides[slide].desc}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="onboarding-form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col text-left"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-500 rounded-xl">
                    <Target className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Setup</h2>
                    <p className="text-xs text-gray-400">Initialize your personal companion settings</p>
                  </div>
                </div>

                {/* Input Name */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> What should we call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    className="w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  />
                </div>

                {/* Daily Water Ingress Goal */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" /> Daily Water Intake Goal (ML)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1000"
                      max="4000"
                      step="250"
                      value={waterGoal}
                      onChange={(e) => setWaterGoal(Number(e.target.value))}
                      className="flex-1 accent-indigo-550"
                    />
                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 w-20 text-right">
                      {waterGoal}ml
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 leading-normal">
                    Standard recommended water intake for active productivity is 2,000ml to 3,000ml.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dot Indicators */}
        <div className="flex justify-center gap-2 mb-4">
          {[0, 1, 2, 3].map((idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                slide === idx
                  ? 'w-6 bg-indigo-600'
                  : 'w-2 bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Navigation Action */}
        <div className="px-8 pb-8 pt-2">
          <button
            onClick={handleNext}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold shadow-md shadow-indigo-100 dark:shadow-none hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            {slide < 3 ? (
              <>
                Continue <ChevronRight className="w-4 h-4" />
              </>
            ) : (
              "Get Started with TimeMate"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
