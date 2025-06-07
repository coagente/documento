export {}

declare global {
  interface Window {
    createNewDocument?: () => void;
    saveCurrentDocument?: () => void;
    exportCurrentDocument?: () => void;
    showMarkdownModal?: () => void;
    exportToDocx?: () => void;
    showMarkdown?: () => void;
    updateFooterStats?: (words: number, characters: number) => void;
    refreshDocumentManager?: () => void;
  }
} 