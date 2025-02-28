import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useDocumentOperations } from "../hooks/useDocumentOperations";
import { useAuth } from "../../auth/hooks/useAuth";
import { useTenant } from '../../auth/hooks/useTenant';
import { combineUrlAndPath } from '../../auth/utils/combineUrlAndPath';

const InviteContext = createContext();

export function useInvites() {
  const context = useContext(InviteContext);
  if (!context) {
    throw new Error("useInvites must be used within an InviteProvider");
  }
  return context;
}

export function InviteProvider({ children }) {
  console.log("InviteProvider.js");
  const { addDocument } = useDocumentOperations();
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const { user: currentUser, token } = useAuth();
    const { tenant } = useTenant();

  useEffect(() => {
    const loadInvites = async () => {
      if (!currentUser || !currentUser.email) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          combineUrlAndPath(
            process.env.NOTIELF_API,
            "getinvites.php?email=" + currentUser.email
          ),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              App_id: tenant,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Map API response to the structure expected by components
        const formattedInvites = data.map((invite) => ({
          id: invite.id,
          document_title: invite.document_title,
          document_id: invite.document_id,
          to_email: invite.to_email,
          from_id: invite.from_id,
          name: invite.from_name,
          email: invite.from_email,
          reason: invite.reason,
          createdAt: invite.created_at,
        }));

        setInvites(formattedInvites);
      } catch (err) {
        console.error("Error fetching invites:", err);
        setError("Failed to load invites");
      } finally {
        setLoading(false);
      }
    };

    loadInvites();
  }, [currentUser, tenant, token]);

  const acceptInvite = useCallback(
    (inviteId) => {
      const invite = invites.find((inv) => inv.id === inviteId);
      if (invite) {
        // Create new document from invite
        const newDocument = {
          id: `doc-${invite.document_id}`,
          name: invite.document_title,
          type: "document",
          content: `<p>${invite.reason}</p>`,
          owner: invite.email,
          sharedWith: [],
          readonly: true,
          createdAt: new Date().toISOString(),
          sharedBy: {
            name: invite.name,
            email: invite.email,
          },
        };

        // Add document to "Shared with Me" folder
        addDocument(newDocument);

        // Remove invite
        setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
      }
    },
    [invites, addDocument]
  );

  const declineInvite = useCallback((inviteId) => {
    setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
  }, []);

  const value = {
    invites,
    acceptInvite,
    declineInvite,
    loading,
    error,
  };

  return (
    <InviteContext.Provider value={value}>{children}</InviteContext.Provider>
  );
}

export default InviteProvider;
