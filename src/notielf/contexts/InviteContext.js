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
import { useDocuments } from "./DocumentContext";
import { useFolders } from "./FolderContext";

const InviteContext = createContext();

export function useInvites() {
  const context = useContext(InviteContext);
  if (!context) {
    throw new Error("useInvites must be used within an InviteProvider");
  }
  return context;
}

export function InviteProvider({ children }) {
  const { addDocument: addDocumentToShared } = useDocumentOperations();
  const { documents } = useDocuments();
  const { updateFolderStructure } = useFolders();
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
    async (inviteId) => {
      setError(null);

      try {
        // Find the invite in the list
        const invite = invites.find((inv) => inv.id === inviteId);
        
        if (!invite) {
          throw new Error("Invite not found");
        }

        // Remove invite from the list immediately for better UI responsiveness
        setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));

        // Make the API call to accept the invite
        const acceptResponse = await fetch(
          combineUrlAndPath(process.env.NOTIELF_API, "api.php/acceptinvite?invite_id=" + inviteId),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              App_id: tenant,
            },
            body: JSON.stringify({
              action: "acceptinvite",
              invite_id: inviteId,
            }),
          }
        );

        if (!acceptResponse.ok) {
          throw new Error(`HTTP error! Status: ${acceptResponse.status}`);
        }

        await acceptResponse.json();

        // Fetch the document content
        const contentResponse = await fetch(
          combineUrlAndPath(process.env.NOTIELF_API, "api.php/getcontent"),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              App_id: tenant,
            },
            body: JSON.stringify({
              action: "getcontent",
              document_id: invite.document_id,
            }),
          }
        );

        if (!contentResponse.ok) {
          throw new Error(`HTTP error! Status: ${contentResponse.status}`);
        }

        const documentData = await contentResponse.json();

        // Create a document object with the fetched content
        const documentToAdd = {
          id: invite.document_id,
          name: invite.document_title,
          type: "document",
          content: documentData.content || "",
          readonly: documentData.readonly === 1
        };
        
        // Update the folder structure to include the document in folder with id = -1
        updateFolderStructure(prevFolders => {
          const addToFolder = (node) => {
            if (node.id === -1) {
              // Add the document to the folder with id = -1
              return {
                ...node,
                children: [...(node.children || []), documentToAdd]
              };
            }
            if (node.children) {
              return {
                ...node,
                children: node.children.map(child => addToFolder(child))
              };
            }
            return node;
          };
          
          return addToFolder(prevFolders);
        });
      } catch (err) {
        console.error("Error accepting invite:", err);
        setError("Failed to accept invite");
        
        // If there was an error, we might want to add the invite back to the list
        // This is optional and depends on the desired behavior
      }
    },
    [tenant, token, invites, updateFolderStructure]
  );

  const declineInvite = useCallback(
    async (inviteId) => {
      setError(null);

      try {
        // Remove invite from the list immediately for better UI responsiveness
        setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));

        // Make the API call in the background
        const response = await fetch(
          combineUrlAndPath(process.env.NOTIELF_API, "api.php/declineinvite?invite_id=" + inviteId),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              App_id: tenant,
            },
            body: JSON.stringify({
              action: "declineinvite",
              invite_id: inviteId,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        await response.json();
      } catch (err) {
        console.error("Error declining invite:", err);
        setError("Failed to decline invite");
        
        // If there was an error, we might want to add the invite back to the list
        // This is optional and depends on the desired behavior
      }
    },
    [tenant, token]
  );

  const createInvite = useCallback(async (inviteData) => {
    setError(null);

    try {
      const response = await fetch(
        combineUrlAndPath(process.env.NOTIELF_API, "api.php/invite"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            App_id: tenant,
          },
          body: JSON.stringify(inviteData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error creating invite:", err);
      setError("Failed to create invite");
      throw err;
    }
  }, [tenant, token]);

  const value = {
    invites,
    acceptInvite,
    declineInvite,
    createInvite,
    loading,
    error,
  };

  return (
    <InviteContext.Provider value={value}>{children}</InviteContext.Provider>
  );
}

export default InviteProvider;
