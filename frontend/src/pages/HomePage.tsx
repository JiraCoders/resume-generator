import { AlertColor, ChromeRuntimeMessage, JobStatus, Messages, RequestMethod } from "@/lib/enums";
import type { AlertConfig, APIResponse, ChromeMessageEvent } from "@/lib/types";
import NetworkError from "@/pages/NetworkError";
import {
  getConvertPDFCheck,
  getExperience,
  getFilterRemoteCheck,
  getFilterSecurityClearanceCheck,
  getFolderPath,
  getName,
  getOpenAIAPIKey,
  getOpenResumeCheck,
  getTemplateState
} from "@/store";
import useStore from "@/store/zustand";
import { Alert, List, Loader, LoadingOverlay, Text, ThemeIcon } from "@mantine/core";
import { IconCircleCheck, IconCircleX, IconExclamationCircle, IconLink } from "@tabler/icons-react";
import packageInfo from "package.json";
import React from "react";
import { v4 as uuidv4 } from "uuid";

const shortcutKey = packageInfo.manifest.commands["generate-tailored-resume"]["suggested_key"].default;

const initialAlertState: AlertConfig = {
  color: AlertColor.INFO,
  title: null,
  message: null
};

type SetJobDescriptionPayload = {
  jobDescription: string;
  tabId: string;
};

export default function HomePage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isNetworkError, setIsNetworkError] = React.useState<boolean>(false);
  const [alert, setAlert] = React.useState<AlertConfig>(initialAlertState);
  const { jobStatuses, addJobStatus, updateJobStatus } = useStore();

  const dismissAlert = () => {
    setAlert(initialAlertState);
  };

  const navigateToTab = (tabId: string) => {
    chrome.tabs.get(parseInt(tabId), (tab) => {
      if (chrome.runtime.lastError || !tab) {
        console.warn(`Tab with id:${tabId} is already closed.`);
        return;
      }
      chrome.tabs.update(parseInt(tabId), { active: true });
    });
  };

  const handleSubmit = async (payload: SetJobDescriptionPayload) => {
    dismissAlert();

    if (!payload.jobDescription) {
      console.warn("The job description is not selected.");
      return;
    }

    const userName = getName();
    const userExperience = getExperience();
    const templateName = getTemplateState();
    const openAIAPIKey = getOpenAIAPIKey();
    const folderPath = getFolderPath();
    const isConvertPDF = getConvertPDFCheck();
    const isOpenResume = getOpenResumeCheck();
    const isFilterSecurityClearance = getFilterSecurityClearanceCheck();
    const isFilterRemote = getFilterRemoteCheck();

    if (!userName || !userExperience || !templateName || !openAIAPIKey || !folderPath) {
      setAlert({
        color: AlertColor.ERROR,
        title: Messages.SETTINGS_ERROR_TITLE,
        message: Messages.CONFIGURATION_REQUIRED
      });
      return;
    }

    const newJob = {
      id: uuidv4(),
      tabId: payload.tabId,
      description: `Generating: ${payload.jobDescription.slice(0, 30)}...`,
      status: JobStatus.PENDING
    };
    addJobStatus(newJob);

    try {
      const response = await fetch(`${process.env.PLASMO_PUBLIC_BASE_URL}/generate`, {
        method: RequestMethod.POST,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          id: newJob.id,
          tabId: payload.tabId,
          name: userName,
          experience: userExperience,
          description: payload.jobDescription,
          template: templateName,
          apiKey: openAIAPIKey,
          folderPath,
          isConvertPDF,
          isOpenResume,
          isFilterSecurityClearance,
          isFilterRemote
        })
      });

      const data: APIResponse = await response.json();

      updateJobStatus(data.data.id, {
        tabId: data.data.tabId,
        description: data.success ? `Generated: "${data.data.companyName}"` : data.message,
        status: data.data.status
      });
    } catch (error) {
      console.error(error);
      updateJobStatus(newJob.id, {
        description: "Internal server error occurred.",
        status: JobStatus.FAILED
      });
      setAlert({
        color: AlertColor.ERROR,
        title: Messages.NETWORK_ERROR_TITLE,
        message: Messages.CHECK_SERVER_STATUS
      });
    }
  };

  React.useEffect(() => {
    const checkServerStatus = async () => {
      setIsLoading(true);
      try {
        await fetch(`${process.env.PLASMO_PUBLIC_BASE_URL}/health`);
        chrome.runtime.sendMessage({ type: ChromeRuntimeMessage.SIDE_PANEL_READY });
      } catch (error) {
        console.error(error);
        setIsNetworkError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkServerStatus();

    const chromeMessageEventHandler = (message: ChromeMessageEvent) => {
      const payload = JSON.parse(JSON.stringify(message.payload));

      if (message.type === ChromeRuntimeMessage.SET_JOB_DESCRIPTION) {
        handleSubmit(payload);
      }
    };

    chrome.runtime.onMessage.addListener(chromeMessageEventHandler);
    return () => {
      chrome.runtime.onMessage.removeListener(chromeMessageEventHandler);
    };
  }, []);

  return !isNetworkError ? (
    <div className="flex flex-col gap-2 py-3">
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ blur: 5 }} />
      {alert.message && (
        <Alert
          variant="light"
          color={alert.color}
          title={alert.title}
          className="flex [&_.mantine-Alert-wrapper]:w-full p-2"
          withCloseButton
          onClose={dismissAlert}>
          <Text size="sm" className="w-full break-all">
            {alert.message}
          </Text>
        </Alert>
      )}
      {jobStatuses.length > 0 ? (
        <List spacing="xs" size="sm" center>
          {jobStatuses.map((job) => (
            <List.Item
              key={job.id}
              icon={
                job.status === JobStatus.PENDING ? (
                  <ThemeIcon color="blue" size={24} radius="xl">
                    <Loader size={16} color="white" />
                  </ThemeIcon>
                ) : job.status === JobStatus.COMPLETED ? (
                  <ThemeIcon color="teal" size={24} radius="xl">
                    <IconCircleCheck size={16} />
                  </ThemeIcon>
                ) : job.status === JobStatus.WARNING ? (
                  <ThemeIcon color="orange" size={24} radius="xl">
                    <IconExclamationCircle size={16} />
                  </ThemeIcon>
                ) : (
                  <ThemeIcon color="red" size={24} radius="xl">
                    <IconCircleX size={16} />
                  </ThemeIcon>
                )
              }>
              {job.description}
              {job.status !== JobStatus.PENDING && (
                <IconLink
                  title="Go to the Tab"
                  className="cursor-pointer hover:text-blue-500 inline-block"
                  size={24}
                  onClick={() => navigateToTab(job.tabId)}
                />
              )}
            </List.Item>
          ))}
        </List>
      ) : (
        <Text size="sm" className="text-gray-500">{`Press ${shortcutKey} to generate tailored resumes.`}</Text>
      )}
    </div>
  ) : (
    <NetworkError />
  );
}
