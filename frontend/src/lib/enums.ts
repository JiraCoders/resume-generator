export enum ThemeColor {
  LIGHT = "light",
  DARK = "dark"
}

export enum AlertColor {
  SUCCESS = "green",
  ERROR = "red",
  WARNING = "yellow",
  INFO = "blue"
}

export enum Route {
  HOME = "home",
  ANALYTICS = "analytics",
  SETTINGS = "settings"
}

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE"
}

export enum JobStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  WARNING = "warning",
  FAILED = "failed"
}

export enum ChromeRuntimeMessage {
  SIDE_PANEL_READY = "SIDE_PANEL_READY",
  SET_JOB_DESCRIPTION = "SET_JOB_DESCRIPTION",
  IMPORT_RESUME = "IMPORT_RESUME",
  TAB_CHANGED = "TAB_CHANGED"
}

export enum Messages {
  SUCCESS_TITLE = "Successful",
  NETWORK_ERROR_TITLE = "Network Error",
  SERVER_ERROR_TITLE = "Internal Server Error",
  VALIDATION_ERROR_TITLE = "Validation Error Occured",
  SETTINGS_ERROR_TITLE = "Invalid Settings",
  SETTINGS_UP_TO_DATE = "Settings are up-to-date!",
  CONFIGURATION_REQUIRED = "Please completed your settings to proceed.",
  FIELDS_ARE_REQUIRED = "Please fill out all required fields.",
  JOB_DESCRIPTION_REQUIRED = "Please enter a job description.",
  CHECK_SERVER_STATUS = "Please check your server connection.",
  COULD_NOT_IMPORT_RESUME = "Could not import the resume."
}
