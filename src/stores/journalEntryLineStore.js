// stores/journalEntryLineStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useJournalEntryLineStore = createBaseStore(
  "journal-entry-line",
  "journal-entry-lines",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 