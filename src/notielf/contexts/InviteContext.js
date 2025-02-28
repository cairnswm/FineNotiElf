import React, { createContext, useContext, useState, useCallback } from 'react';
import { useDocumentOperations } from '../hooks/useDocumentOperations';

const InviteContext = createContext();

export function useInvites() {
  const context = useContext(InviteContext);
  if (!context) {
    throw new Error('useInvites must be used within an InviteProvider');
  }
  return context;
}

export function InviteProvider({ children }) {
  console.log("InviteProvider.js");
  const { addDocument } = useDocumentOperations();
  const [invites, setInvites] = useState([
    {
      id: 'inv-1',
      documentId: 'doc-123',
      documentTitle: 'Family Vacation Plans',
      from: {
        name: 'Yolande Cairns',
        email: 'yolande@cairns.co.za'
      },
      reason: 'Please review our upcoming vacation plans and add your suggestions.',
      createdAt: new Date('2023-11-20').toISOString()
    },
    {
      id: 'inv-2',
      documentId: 'doc-456',
      documentTitle: 'Christmas Party Menu',
      from: {
        name: 'John Smith',
        email: 'john@example.com'
      },
      reason: 'Need your input on the menu planning.',
      createdAt: new Date('2023-11-21').toISOString()
    }
  ]);

  const acceptInvite = useCallback((inviteId) => {
    const invite = invites.find(inv => inv.id === inviteId);
    if (invite) {
      // Create new document from invite
      const newDocument = {
        id: invite.documentId,
        name: invite.documentTitle,
        type: 'document',
        content: `<p>${invite.reason}</p>`,
        owner: invite.from.email,
        sharedWith: [],
        readonly: true,
        createdAt: new Date().toISOString(),
        sharedBy: {
          name: invite.from.name,
          email: invite.from.email
        }
      };

      // Add document to "Shared with Me" folder
      addDocument(newDocument);

      // Remove invite
      setInvites(prev => prev.filter(inv => inv.id !== inviteId));
    }
  }, [invites, addDocument]);

  const declineInvite = useCallback((inviteId) => {
    setInvites(prev => prev.filter(invite => invite.id !== inviteId));
  }, []);

  const value = {
    invites,
    acceptInvite,
    declineInvite
  };

  return (
    <InviteContext.Provider value={value}>
      {children}
    </InviteContext.Provider>
  );
}

export default InviteProvider;
