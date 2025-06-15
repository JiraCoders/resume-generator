import { AlertColor, Messages } from "@/lib/enums";
import type { AlertConfig, APIResponse } from "@/lib/types";
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
  getTemplateState,
  updateSettings
} from "@/store";
import { Alert, Anchor, Button, Checkbox, Divider, Input, LoadingOverlay, Select, Text } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import React from "react";

const initialAlertState: AlertConfig = {
  color: AlertColor.INFO,
  title: null,
  message: null
};

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isNetworkError, setIsNetworkError] = React.useState<boolean>(false);
  const [templateData, setTemplateData] = React.useState<string[]>([]);
  const [alert, setAlert] = React.useState<AlertConfig>(initialAlertState);

  const [name, setName] = React.useState<string>(getName());
  const [experience, setExperience] = React.useState<string[]>(getExperience());

  const [selectedTemplate, setSelectedTemplate] = React.useState<string>(getTemplateState());
  const [openAIAPIKey, setOpenAIAPIKey] = React.useState<string>(getOpenAIAPIKey());
  const [folderPath, setFolderPath] = React.useState<string>(getFolderPath());
  const [isConvertToPDF, setIsConvertToPDF] = React.useState<boolean>(getConvertPDFCheck());
  const [isOpenResume, setIsOpenResume] = React.useState<boolean>(getOpenResumeCheck());
  const [isFilterSecurityClearance, setIsFilterSecurityClearance] = React.useState<boolean>(
    getFilterSecurityClearanceCheck()
  );
  const [isFilterRemote, setIsFilterRemote] = React.useState<boolean>(getFilterRemoteCheck());

  const dismissAlert = () => {
    setAlert(initialAlertState);
  };

  const validateInputs = () => {
    return name && experience.length > 0 && selectedTemplate && openAIAPIKey && folderPath;
  };

  const save = () => {
    if (!validateInputs()) {
      setAlert({
        color: AlertColor.ERROR,
        title: Messages.VALIDATION_ERROR_TITLE,
        message: Messages.FIELDS_ARE_REQUIRED
      });
      return;
    }

    updateSettings(
      name,
      experience,
      selectedTemplate,
      openAIAPIKey,
      folderPath,
      isConvertToPDF,
      isOpenResume,
      isFilterSecurityClearance,
      isFilterRemote
    );

    setAlert({
      color: AlertColor.SUCCESS,
      title: Messages.SUCCESS_TITLE,
      message: Messages.SETTINGS_UP_TO_DATE
    });
  };

  React.useEffect(() => {
    const fetchFileList = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`${process.env.PLASMO_PUBLIC_BASE_URL}/templates`);
        const data: APIResponse = await response.json();
        setTemplateData(data.data);
      } catch (error) {
        console.error(error);
        setIsNetworkError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFileList();
  }, []);

  return !isNetworkError ? (
    <div className="flex flex-col flex-grow gap-3 py-3">
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ blur: 5 }} />

      {alert.message && (
        <Alert
          variant="light"
          color={alert.color}
          title={alert.title}
          className="flex [&_.mantine-Alert-wrapper]:w-full p-2"
          withCloseButton={true}
          onClose={dismissAlert}>
          <Text size="sm" className="w-full break-all">
            {alert.message}
          </Text>
        </Alert>
      )}

      <Input.Wrapper label={"Name"}>
        <Input
          placeholder={"Dustin Lee"}
          value={name}
          onChange={({ target: { value } }) => setName(value)}
          error={alert.message && !name}
        />
      </Input.Wrapper>

      <Input.Wrapper label={"Experience"} className="flex flex-col gap-1">
        {experience.map((exp: string, index: number) => (
          <Input
            key={index}
            placeholder={"Software Engineer at McKinsey | 2022.8 - Present"}
            value={exp}
            onChange={({ target: { value } }) => {
              const newExperience = [...experience];
              newExperience[index] = value;
              setExperience(newExperience);
            }}
            error={alert.message && (!exp || exp.trim() === "")}
          />
        ))}

        <Button variant="outline" onClick={() => setExperience([...experience, ""])} fullWidth>
          <IconPlus />
        </Button>
      </Input.Wrapper>

      <Divider />

      <Input.Wrapper label={"Resume Template"}>
        <Select
          placeholder={"Choose your template"}
          data={templateData}
          value={selectedTemplate}
          onChange={(value) => setSelectedTemplate(value)}
          error={alert.message && !selectedTemplate}
        />
      </Input.Wrapper>

      <Input.Wrapper label={"OpenAI API Key"}>
        <Input
          placeholder={"Paste your OpenAI Secret key here..."}
          value={openAIAPIKey}
          onChange={({ target: { value } }) => setOpenAIAPIKey(value)}
          error={alert.message && !openAIAPIKey}
        />
      </Input.Wrapper>

      <Input.Wrapper label={"Save Folder Path"} description={"Make sure your folder to not include any whitespace."}>
        <Input
          placeholder={"E:/resumes/custom"}
          value={folderPath}
          onChange={({ target: { value } }) => setFolderPath(value)}
          error={alert.message && !folderPath}
        />
      </Input.Wrapper>

      <Checkbox
        checked={isConvertToPDF}
        onChange={() => setIsConvertToPDF(!isConvertToPDF)}
        label={
          <>
            {"Convert tailored resume to PDF. (Make sure you have "}
            <Anchor href="https://www.libreoffice.org/download/download-libreoffice/" target="_blank" inherit>
              {"LibreOffice"}
            </Anchor>
            {" installed in your system.)"}
          </>
        }
      />

      <Checkbox
        checked={isOpenResume}
        onChange={() => setIsOpenResume(!isOpenResume)}
        label="Open resume file after tailoring is done."
      />

      <Checkbox
        checked={isFilterSecurityClearance}
        onChange={() => setIsFilterSecurityClearance(!isFilterSecurityClearance)}
        label="Exclude security clearance required jobs."
      />

      <Checkbox
        checked={isFilterRemote}
        onChange={() => setIsFilterRemote(!isFilterRemote)}
        label="Exclude hybrid, onsite jobs."
      />

      <Button className="mt-3" onClick={save}>
        {"Save"}
      </Button>
    </div>
  ) : (
    <NetworkError />
  );
}
