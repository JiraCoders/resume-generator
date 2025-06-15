import { AlertColor, Messages } from "@/lib/enums";
import { Text } from "@mantine/core";
import { IconNetworkOff } from "@tabler/icons-react";
import React from "react";

const NetworkError = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 w-full h-screen">
      <div className="flex flex-col justify-center items-center">
        <IconNetworkOff size={48} color={AlertColor.ERROR} />
        <Text size="xl" className="font-bold text-red-500">
          {Messages.NETWORK_ERROR_TITLE}
        </Text>
      </div>

      <Text className="text-center">{Messages.CHECK_SERVER_STATUS}</Text>
    </div>
  );
};

export default NetworkError;
