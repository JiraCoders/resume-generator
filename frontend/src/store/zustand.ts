import { create } from "zustand";
import { JobStatus } from "@/lib/enums";

type JobCompletionStatus = {
  id: string;
  tabId: string;
  description: string;
  status: JobStatus;
};

type StoreState = {
  jobStatuses: JobCompletionStatus[];
  addJobStatus: (newJobStatus: JobCompletionStatus) => void;
  updateJobStatus: (id: string, updatedStatus: Partial<JobCompletionStatus>) => void;
};

const useStore = create<StoreState>((set) => ({
  jobStatuses: [] as JobCompletionStatus[],

  addJobStatus: (newJobStatus: JobCompletionStatus) =>
    set((state) => ({ jobStatuses: [...state.jobStatuses, newJobStatus] })),

  updateJobStatus: (id: string, updatedStatus: Partial<JobCompletionStatus>) =>
    set((state) => ({
      jobStatuses: state.jobStatuses.map((job) =>
        job.id === id ? { ...job, ...updatedStatus } : job
      )
    })),
}));

export default useStore;
