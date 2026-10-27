// plugins/aiSuggestion.js
import { aiSuggestionService } from "@/services/aiSuggestionService";

export default {
  install(app) {
    // Provide global AI service
    app.config.globalProperties.$ai = {
      getSuggestions:
        aiSuggestionService.getSuggestions.bind(aiSuggestionService),
      prefetch: aiSuggestionService.prefetch.bind(aiSuggestionService),
      clear:
        aiSuggestionService.clearComponentSuggestions.bind(aiSuggestionService),
      clearAll:
        aiSuggestionService.clearAllSuggestions.bind(aiSuggestionService),
      getHistory: aiSuggestionService.getHistory.bind(aiSuggestionService),
      clearHistory: aiSuggestionService.clearHistory.bind(aiSuggestionService),
    };

    // Provide as injectable
    app.provide("aiService", aiSuggestionService);
  },
};
