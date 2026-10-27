// stores/journalEntryStore.js
import { createBaseStore } from "./baseStore";

// Base store
export const useJournalEntryStore = createBaseStore(
  "journal-entry",
  "journal-entries",
  {
    useFormData: true,
    primaryKey: "id",
  }
);
 