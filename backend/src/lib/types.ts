export interface ResumeTailorRequestBody {
  id: string;
  tabId: string;
  name: string;
  experience: string[];
  description: string;
  template: string;
  apiKey: string;
  folderPath: string;
  isConvertPDF: boolean;
  isOpenResume: boolean;
  isFilterSecurityClearance: boolean;
  isFilterRemote: boolean;
}

export interface AnalyticsRequestBody {
  folderPath: string;
}

export interface BufferResponse {
  success: boolean;
  data?: Buffer;
  message?: string;
}

export interface ProfileInfo {
  name: string;
  experienceRecords: string[];
}
