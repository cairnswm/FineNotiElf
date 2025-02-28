import React from "react";
import "./notielf/notielf.css";
import DocumentProvider from "./notielf/contexts/DocumentContext";
import InviteProvider from "./notielf/contexts/InviteContext";
import { SubscriptionProvider } from "./notielf/contexts/SubscriptionContext";

const Main = ({ children }) => {
  const onError = (error) => {
    console.error(error);
  };
  return (
      <DocumentProvider>
        <InviteProvider>
          <SubscriptionProvider>{children}</SubscriptionProvider>
        </InviteProvider>
      </DocumentProvider>
  );
};

export default Main;
