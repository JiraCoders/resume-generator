import { Route, ThemeColor } from "@/lib/enums";
import { Button, Divider, Image, Text, useMantineColorScheme } from "@mantine/core";
import { IconChartBarPopular, IconMoon, IconSettings, IconSun } from "@tabler/icons-react";
import LogoImage from "data-base64:~/../assets/icon.png";
import React from "react";

interface NavbarProps {
  currentRoute: Route;
  navigate: (routeName: Route) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentRoute, navigate }) => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const toggleAnalyticsRoute = () => {
    navigate(currentRoute !== Route.ANALYTICS ? Route.ANALYTICS : Route.HOME);
  };

  const toggleSettingsRoute = () => {
    navigate(currentRoute !== Route.SETTINGS ? Route.SETTINGS : Route.HOME);
  };

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === ThemeColor.LIGHT ? ThemeColor.DARK : ThemeColor.LIGHT);
  };

  return (
    <div className={`flex flex-col gap-4 sticky top-0 z-10 pt-4 ${colorScheme === ThemeColor.LIGHT ? "bg-white" : "bg-primary"}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1">
          <Image alt="logo" src={LogoImage} className="w-8" />

          <Text
            variant="gradient"
            gradient={{ from: "blue", to: "cyan", deg: 90 }}
            className="font-bold text-lg cursor-pointer"
            onClick={() => navigate(Route.HOME)}>
            {"SwiftCV"}
          </Text>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="md"
            variant={currentRoute === Route.ANALYTICS ? "filled" : "outline"}
            radius="xl"
            className="w-8 h-8 p-2"
            onClick={toggleAnalyticsRoute}>
            <IconChartBarPopular size={24} />
          </Button>

          <Button
            size="md"
            variant={currentRoute === Route.SETTINGS ? "filled" : "outline"}
            radius="xl"
            className="w-8 h-8 p-2"
            onClick={toggleSettingsRoute}>
            <IconSettings size={24} />
          </Button>

          <Button size="md" variant="outline" radius="xl" className="w-8 h-8 p-2" onClick={toggleColorScheme}>
            {colorScheme === ThemeColor.LIGHT ? <IconMoon size={24} /> : <IconSun size={24} />}
          </Button>
        </div>
      </div>

      <Divider />
    </div>
  );
};

export default Navbar;
