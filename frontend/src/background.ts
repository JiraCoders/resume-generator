import { ChromeRuntimeMessage } from "@/lib/enums";

let jobDescription: string = null;

function handleJobDescriptionPaste(tab: chrome.tabs.Tab) {
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString()
    },
    (results) => {
      const selectedText = results[0]?.result;
      if (selectedText) {
        jobDescription = selectedText;
        chrome.sidePanel.open({ tabId: tab.id });

        chrome.runtime.sendMessage({
          type: ChromeRuntimeMessage.SET_JOB_DESCRIPTION,
          payload: {
            jobDescription: selectedText,
            tabId: tab.id,
          }
        });

        jobDescription = null;
      } else {
        console.log("No text selected");
      }
    }
  );
}

chrome.runtime.onInstalled.addListener(() => {
  // chrome.action.setBadgeText({ text: "NEW" });
  // chrome.action.setBadgeTextColor({ color: "white" });
  // chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });

  chrome.contextMenus.create({
    id: "generate-tailored-resume",
    title: "Generate Tailored Resume",
    contexts: ["selection"]
  });
});

chrome.runtime.onMessage.addListener((message, tab) => {
  if (message.type === ChromeRuntimeMessage.SIDE_PANEL_READY) {
    chrome.runtime.sendMessage({
      type: ChromeRuntimeMessage.SET_JOB_DESCRIPTION,
      payload: {
        jobDescription: jobDescription,
        tabId: tab.id,
      }
    });

    jobDescription = "";
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "generate-tailored-resume" && info.selectionText) {
    handleJobDescriptionPaste(tab);
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "generate-tailored-resume") {
    handleJobDescriptionPaste(tab);
  }
});