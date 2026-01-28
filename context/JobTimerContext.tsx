import React, { createContext, useContext, useRef } from "react";

type JobTimer = {
  jobId: string;
  startedAt: number;
  totalSeconds: number;
};

type JobTimerContextType = {
  timers: Record<string, JobTimer>;
  startJobTimer: (jobId: string, totalSeconds: number) => void;
  stopJobTimer: (jobId: string) => void;
  getJobTimer: (jobId: string) => JobTimer | null;
};

const JobTimerContext = createContext<JobTimerContextType>(null as any);

export const JobTimerProvider = ({ children }: any) => {
  const timersRef = useRef<Record<string, JobTimer>>({});

  const startJobTimer = (jobId: string, totalSeconds: number) => {
    if (!timersRef.current[jobId]) {
      timersRef.current[jobId] = {
        jobId,
        startedAt: Date.now(),
        totalSeconds,
      };
    }
  };

  const stopJobTimer = (jobId: string) => {
    delete timersRef.current[jobId];
  };

  const getJobTimer = (jobId: string) => {
    return timersRef.current[jobId] || null;
  };

  return (
    <JobTimerContext.Provider
      value={{ timers: timersRef.current, startJobTimer, stopJobTimer, getJobTimer }}
    >
      {children}
    </JobTimerContext.Provider>
  );
};

export const useJobTimer = () => useContext(JobTimerContext);
