import React, { useState, useEffect } from 'react';

const Timer = ({ endTime, onTimeUp }) => {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const remaining = Math.max(0, end - now);
      return remaining;
    };

    setTimeRemaining(calculateTimeRemaining());

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTimeRemaining(remaining);

      if (remaining <= 0 && onTimeUp) {
        onTimeUp();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const minutesRemaining = Math.floor(timeRemaining / 60000);
  const isCritical = minutesRemaining < 5;
  const isWarning = minutesRemaining < 15 && !isCritical;

  const getContainerStyle = () => {
    if (isCritical) {
      return 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse';
    }
    if (isWarning) {
      return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    }
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  };

  return (
    <div className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border backdrop-blur-md transition-all ${getContainerStyle()}`}>
      <div className="relative flex items-center justify-center">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {isCritical && (
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
        )}
      </div>

      <div className="flex flex-col">
        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
          {isCritical ? 'Time Ending Soon' : 'Time Remaining'}
        </span>
        <span className="font-mono text-xl font-bold tracking-widest tabular-nums">
          {formatTime(timeRemaining)}
        </span>
      </div>
    </div>
  );
};

export default Timer;
