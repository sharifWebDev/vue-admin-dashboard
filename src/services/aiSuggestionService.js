// services/aiSuggestionService.js
import { useAiSuggestionStore } from "@/stores/aiSuggestionStore";

class AiSuggestionService {
  constructor() {
    this.store = null;
    this.componentCache = new Map();
  }

  /**
   * Get store instance (lazy loading)
   */
  getStore() {
    if (!this.store) {
      this.store = useAiSuggestionStore();
    }
    return this.store;
  }

  /**
   * Get component type from props or instance
   */
  getComponentType(component) {
    // Check if component has explicit type
    if (component.type) return component.type;

    // Check component name
    const name = component.$?.type?.name || component.constructor?.name || "";

    const types = {
      NumberInput: "number",
      TextInput: "text-input",
      TextareaInput: "textarea",
      RichTextEditor: "rich-text",
      SearchInput: "search",
      GlobalDropdown: "select",
    };

    for (const [key, value] of Object.entries(types)) {
      if (name.includes(key)) return value;
    }

    return "text-input";
  }

  /**
   * Get unique component ID
   */
  getComponentId(component, context) {
    const label = context.label || component.label || "input";
    const type = this.getComponentType(component);
    const field = context.field || component.field || "default";
    return `${type}_${label}_${field}`;
  }

  /**
   * Build prompt dynamically
   */
  buildPrompt(component, context) {
    const type = this.getComponentType(component);
    const label = context.label || component.label || "input";
    const value = context.value || component.modelValue || "";
    const required = context.required || component.required || false;

    const prompts = {
      number: `Generate number suggestions for ${label}. Current value: ${value}. Min: ${context.min || 0}, Max: ${context.max || 100}`,
      "text-input": `Generate text suggestions for ${label}. Current value: ${value}. Required: ${required}`,
      textarea: `Generate content suggestions for ${label}. Current content: ${value || "empty"}`,
      "rich-text": `Generate rich text content for ${label}. Current content: ${value || "empty"}`,
      search: `Generate search suggestions for: ${value || "empty"}`,
      select: `Generate selection suggestions for ${label}`,
    };

    return prompts[type] || prompts["text-input"];
  }

  /**
   * Get default suggestions
   */
  getDefaultSuggestions(component, context) {
    const type = this.getComponentType(component);
    const label = context.label || component.label || "input";

    const defaults = {
      number: [
        { label: "Minimum", value: context.min || 1 },
        {
          label: "Recommended",
          value: Math.floor((context.min || 0 + context.max || 100) / 2),
        },
        { label: "Maximum", value: context.max || 100 },
      ],
      "text-input": [
        { label: `Example ${label} 1`, value: `Example ${label} value 1` },
        { label: `Example ${label} 2`, value: `Example ${label} value 2` },
        { label: `Example ${label} 3`, value: `Example ${label} value 3` },
      ],
      textarea: [
        {
          label: "📝 Professional Description",
          value:
            "This is a professional description that highlights the key features and benefits.",
        },
        {
          label: "🎯 Marketing Copy",
          value:
            "Discover the best! Our product offers exceptional quality and unbeatable value.",
        },
        {
          label: "✨ Simple & Clear",
          value:
            "A simple and clear description that explains the product in an easy-to-understand manner.",
        },
      ],
      search: [
        { label: "🔍 Popular searches", value: "popular searches" },
        { label: "🔥 Trending now", value: "trending now" },
        { label: "⭐ Top rated", value: "top rated" },
        { label: "💰 Best deals", value: "best deals" },
      ],
    };

    return defaults[type] || defaults["text-input"];
  }

  /**
   * Get suggestions for any component
   */
  async getSuggestions(component, context = {}) {
    const store = this.getStore();
    const componentType = this.getComponentType(component);
    const componentId = this.getComponentId(component, context);

    // Check if suggestions already exist
    if (store.hasSuggestions(componentId)) {
      return {
        success: true,
        data: store.getSuggestionsForContext(componentId),
        cached: true,
      };
    }

    // Check if we have default suggestions
    const defaults = this.getDefaultSuggestions(component, context);
    if (defaults.length > 0) {
      // Store default suggestions
      store.suggestions[componentId] = defaults;
      return {
        success: true,
        data: defaults,
        isDefault: true,
      };
    }

    // Generate new suggestions
    const prompt = this.buildPrompt(component, context);
    const result = await store.generateForComponent(componentType, {
      ...context,
      componentId: componentId,
    });

    return result;
  }

  /**
   * Prefetch suggestions
   */
  async prefetch(component, context = {}) {
    const componentId = this.getComponentId(component, context);
    const store = this.getStore();

    if (!store.hasSuggestions(componentId)) {
      setTimeout(async () => {
        await this.getSuggestions(component, context);
      }, 100);
    }
  }

  /**
   * Clear component suggestions
   */
  clearComponentSuggestions(component, context = {}) {
    const store = this.getStore();
    const componentId = this.getComponentId(component, context);
    store.clearSuggestions(componentId);
  }

  /**
   * Clear all suggestions
   */
  clearAllSuggestions() {
    const store = this.getStore();
    store.clearAllSuggestions();
  }

  /**
   * Get suggestions history
   */
  getHistory() {
    const store = this.getStore();
    return store.getHistory;
  }

  /**
   * Clear history
   */
  clearHistory() {
    const store = this.getStore();
    store.clearHistory();
  }
}

// Create singleton instance
export const aiSuggestionService = new AiSuggestionService();
