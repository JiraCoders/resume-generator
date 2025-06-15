const getName = () => {
  return localStorage.getItem("name") ?? "";
};

const getExperience = () => {
  const experienceString = localStorage.getItem("experience");

  if (experienceString) {
    if (experienceString.endsWith(",")) {
      const experienceArray = experienceString.split(",").slice(0, -1);
      localStorage.setItem("experience", experienceArray.join(","));
      return experienceArray;
    } else {
      return experienceString.split(",");
    }
  } else {
    return [];
  }
};

const getTemplateState = () => {
  return localStorage.getItem("template") ?? "";
};

const getOpenAIAPIKey = () => {
  return localStorage.getItem("apiKey") ?? "";
};

const getFolderPath = () => {
  return localStorage.getItem("folderPath") ?? "";
};

const getConvertPDFCheck = () => {
  return localStorage.getItem("isConvertPDF") === "true" ? true : false;
};

const getOpenResumeCheck = () => {
  return localStorage.getItem("isOpenResume") === "true" ? true : false;
};

const getFilterSecurityClearanceCheck = () => {
  return localStorage.getItem("isFilterSecurityClearance") === "true" ? true : false;
};

const getFilterRemoteCheck = () => {
  return localStorage.getItem("isFilterRemote") === "true" ? true : false;
};

const updateSettings = (
  name: string,
  experience: string[],
  template: string,
  apiKey: string,
  folderPath: string,
  isConvertPDF: boolean,
  isResumeOpen: boolean,
  isFilterSecurityClearance: boolean,
  isFilterRemote: boolean
) => {
  localStorage.setItem("name", name);
  localStorage.setItem("experience", experience.join(","));
  localStorage.setItem("template", template);
  localStorage.setItem("apiKey", apiKey);
  localStorage.setItem("folderPath", folderPath);
  localStorage.setItem("isConvertPDF", isConvertPDF ? "true" : "false");
  localStorage.setItem("isOpenResume", isResumeOpen ? "true" : "false");
  localStorage.setItem("isFilterSecurityClearance", isFilterSecurityClearance ? "true" : "false");
  localStorage.setItem("isFilterRemote", isFilterRemote ? "true" : "false");
};

export {
  getName,
  getExperience,
  getTemplateState,
  getOpenAIAPIKey,
  getFolderPath,
  getConvertPDFCheck,
  getOpenResumeCheck,
  getFilterSecurityClearanceCheck,
  getFilterRemoteCheck,
  updateSettings
};
