import React from "react";
import MobilePage from "./MobilePage";
import DesktopPage from "./DesktopPage";
import "./AppPage.css";
import useIsMobile from "../hooks/useIsMobile"; // Importing the new hook

export default function AppPage() {
  const isMobile = useIsMobile(); // Using the custom hook for mobile detection

  return (
    <>
      {isMobile ? <MobilePage /> : <DesktopPage />}
    </>
  );
}
