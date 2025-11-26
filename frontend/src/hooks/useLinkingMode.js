import { useState, useCallback } from 'react';

/**
 * Custom hook for managing linking mode state
 */
export const useLinkingMode = () => {
  const [isLinkingMode, setIsLinkingMode] = useState(false);
  const [linkingSourceId, setLinkingSourceId] = useState(null);
  const [linkingSourceData, setLinkingSourceData] = useState(null);

  const startLinking = useCallback((sourceNodeId, sourceData) => {
    setIsLinkingMode(true);
    setLinkingSourceId(sourceNodeId);
    setLinkingSourceData(sourceData);
  }, []);

  const cancelLinking = useCallback(() => {
    setIsLinkingMode(false);
    setLinkingSourceId(null);
    setLinkingSourceData(null);
  }, []);

  const finishLinking = useCallback(() => {
    setIsLinkingMode(false);
    setLinkingSourceId(null);
    setLinkingSourceData(null);
  }, []);

  return {
    isLinkingMode,
    linkingSourceId,
    linkingSourceData,
    startLinking,
    cancelLinking,
    finishLinking
  };
};
