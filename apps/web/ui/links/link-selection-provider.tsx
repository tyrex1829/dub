import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { ResponseLink } from "./links-container";

interface LinkSelectionContext {
  selectedLinkIds: string[];
  setSelectedLinkIds: Dispatch<SetStateAction<string[]>>;
  lastSelectedLinkId: string | null;
  handleLinkSelection: (linkId: string, e: React.MouseEvent) => void;
}

const LinkSelectionContext = createContext<LinkSelectionContext | null>(null);

export function LinkSelectionProvider({
  children,
  links,
}: {
  children: React.ReactNode;
  links?: ResponseLink[];
}) {
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([]);
  const [lastSelectedLinkId, setLastSelectedLinkId] = useState<string | null>(
    null,
  );

  const handleLinkSelection = (linkId: string, e: React.MouseEvent) => {
    if (e.shiftKey && lastSelectedLinkId && links) {
      const lastSelectedIndex = links.findIndex(
        (l) => l.id === lastSelectedLinkId,
      );
      const currentIndex = links.findIndex((l) => l.id === linkId);

      if (lastSelectedIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastSelectedIndex, currentIndex);
        const end = Math.max(lastSelectedIndex, currentIndex);
        const rangeIds = links.slice(start, end + 1).map((l) => l.id);

        if (selectedLinkIds.includes(linkId)) {
          setSelectedLinkIds((prev) =>
            prev.filter((id) => !rangeIds.includes(id)),
          );
        } else {
          setSelectedLinkIds((prev) =>
            Array.from(new Set([...prev, ...rangeIds])),
          );
        }
        setLastSelectedLinkId(linkId);
      }
    } else {
      setLastSelectedLinkId(linkId);
      setSelectedLinkIds((prev) =>
        prev.includes(linkId)
          ? prev.filter((id) => id !== linkId)
          : [...prev, linkId],
      );
    }
  };

  return (
    <LinkSelectionContext.Provider
      value={{
        selectedLinkIds,
        setSelectedLinkIds,
        lastSelectedLinkId,
        handleLinkSelection,
      }}
    >
      {children}
    </LinkSelectionContext.Provider>
  );
}

export function useLinkSelection() {
  const context = useContext(LinkSelectionContext);
  if (context === null) {
    throw new Error(
      "useLinkSelection must be used within LinkSelectionProvider",
    );
  }
  return context;
}
