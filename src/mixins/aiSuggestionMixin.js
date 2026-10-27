// mixins/aiSuggestionMixin.js
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { aiSuggestionService } from "@/services/aiSuggestionService";

export function useAiSuggestions(props, context) {
  // ========== STATE ==========
  const aiSuggestions = ref([]);
  const isAILoading = ref(false);
  const showSuggestions = ref(false);

  // ========== COMPUTED ==========
  const hasAiSuggestions = computed(() => {
    return aiSuggestions.value && aiSuggestions.value.length > 0;
  });

  const aiContext = computed(() => ({
    label: props.label || context?.label || "input",
    value: props.value || context?.modelValue || "",
    required: props.required || context?.required || false,
    min: props.min,
    max: props.max,
    field: props.field || context?.field || "default",
  }));

  // ========== METHODS ==========

  /**
   * Fetch AI suggestions with optional custom prompt
   */
  const fetchAIContent = async (customPrompt = null) => {
    try {
      isAILoading.value = true;

      const component = {
        type: props.componentType || context?.componentType || "text-input",
        label: props.label,
        required: props.required,
        min: props.min,
        max: props.max,
        modelValue: props.value || context?.modelValue,
      };

      // If custom prompt provided, use it
      if (customPrompt) {
        const store = aiSuggestionService.getStore();
        const result = await store.generateSuggestions(
          `${component.type}_${props.label || "default"}`,
          customPrompt,
          {
            max_suggestions: props.maxSuggestions || 5,
            tone: props.tone || "professional",
          },
        );

        if (result.success) {
          aiSuggestions.value = result.data;
          showSuggestions.value = true;
          return result;
        }
      }

      // Use default service
      const result = await aiSuggestionService.getSuggestions(
        component,
        aiContext.value,
      );

      if (result.success) {
        aiSuggestions.value = result.data;
        showSuggestions.value = true;
      }

      return result;
    } catch (error) {
      console.error("Failed to fetch AI suggestions:", error);
      // Use default suggestions
      aiSuggestions.value = aiSuggestionService.getDefaultSuggestions(
        { type: props.componentType, label: props.label },
        aiContext.value,
      );
      showSuggestions.value = true;
      return { success: true, data: aiSuggestions.value, isFallback: true };
    } finally {
      isAILoading.value = false;
    }
  };

  /**
   * Show AI suggestions
   */
  const showAISuggestions = () => {
    if (hasAiSuggestions.value) {
      showSuggestions.value = !showSuggestions.value;
    } else {
      fetchAIContent();
    }
  };

  /**
   * Apply AI suggestion
   */
  const applyAISuggestion = (suggestion) => {
    // Clear suggestions
    aiSuggestions.value = [];
    showSuggestions.value = false;

    // Apply suggestion
    if (context?.onApply) {
      context.onApply(suggestion.value);
    } else if (context?.emit) {
      context.emit("update:modelValue", suggestion.value);
      context.emit("change", suggestion.value);
    }

    // Trigger validation if needed
    if (props.validateOnInput) {
      if (context?.validate) {
        context.validate();
      }
    }
  };

  /**
   * Prefetch AI suggestions
   */
  const prefetchAISuggestions = () => {
    if (props.prefetch !== false) {
      const component = {
        type: props.componentType,
        label: props.label,
        required: props.required,
        min: props.min,
        max: props.max,
      };
      aiSuggestionService.prefetch(component, aiContext.value);
    }
  };

  /**
   * Clear AI suggestions
   */
  const clearAISuggestions = () => {
    const component = {
      type: props.componentType,
      label: props.label,
    };
    aiSuggestionService.clearComponentSuggestions(component, aiContext.value);
    aiSuggestions.value = [];
    showSuggestions.value = false;
  };

  /**
   * Close suggestions dropdown
   */
  const closeSuggestions = () => {
    showSuggestions.value = false;
  };

  // ========== RETURN ==========
  return {
    aiSuggestions,
    isAILoading,
    showSuggestions,
    hasAiSuggestions,
    fetchAIContent,
    showAISuggestions,
    applyAISuggestion,
    prefetchAISuggestions,
    clearAISuggestions,
    closeSuggestions,
  };
}
