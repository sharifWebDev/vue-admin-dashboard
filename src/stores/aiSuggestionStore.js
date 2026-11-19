// stores/aiSuggestionStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axiosClient from "@/axiosClient";
import { useToast } from "vue-toastification";

export const useAiSuggestionStore = defineStore("aiSuggestion", () => {
  const toast = useToast();

  // ========== STATE ==========
  const suggestions = ref({});
  const loading = ref(false);
  const error = ref(null);
  const history = ref([]);
  const cache = ref(new Map());

  // ========== GETTERS ==========
  const getSuggestions = computed(() => suggestions.value);
  const isLoading = computed(() => loading.value);
  const getError = computed(() => error.value);
  const getHistory = computed(() => history.value);

  const getSuggestionsForContext = (context) => {
    return suggestions.value[context] || [];
  };

  const hasSuggestions = (context) => {
    return suggestions.value[context] && suggestions.value[context].length > 0;
  };

  // ========== ACTIONS ==========

  /**
   * Generate AI suggestions
   */
  const generateSuggestions = async (context, prompt, options = {}, useFallback = true) => {
    try {
      loading.value = true;
      error.value = null;

      // Check cache
      const cacheKey = `${context}_${prompt}_${JSON.stringify(options)}`;
      if (cache.value.has(cacheKey)) {
        const cached = cache.value.get(cacheKey);
        if (cached.expiresAt > Date.now()) {
          suggestions.value[context] = cached.data;
          return { success: true, data: cached.data, fromCache: true };
        }
        cache.value.delete(cacheKey);
      }

      // Prepare request
      const requestData = {
        context: context,
        prompt: prompt,
        options: {
          max_suggestions: options.max_suggestions || 5,
          tone: options.tone || "professional",
          language: options.language || "en",
          max_length: options.max_length || 500,
          temperature: options.temperature || 0.7,
          ...options,
        },
      };

      // Make API request
      const response = await axiosClient.post(
        "/ai/suggestions",
        requestData,
      );

      const apiResponse = response.data;

      if (!apiResponse.success) {
        throw new Error(
          apiResponse.message || "Failed to generate suggestions",
        );
      }

      const suggestionsData = apiResponse.data || [];

      // Store suggestions
      suggestions.value[context] = suggestionsData;

      // Add to history
      addToHistory({
        context,
        prompt,
        suggestions: suggestionsData,
        timestamp: new Date().toISOString(),
      });

      // Cache suggestions
      cache.value.set(cacheKey, {
        data: suggestionsData,
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      });

      toast.success(`AI suggestions generated`);

      return {
        success: true,
        data: suggestionsData,
        context: context,
      };
    } catch (err) {
      error.value = err.message || "Failed to generate AI suggestions";
      toast.error(error.value);

      // Return fallback suggestions
      const fallback = useFallback ? getFallbackSuggestions(context) : [];
      if (fallback.length > 0) {
        suggestions.value[context] = fallback;
        return { success: true, data: fallback, isFallback: true };
      }

      return {
        success: false,
        error: error.value,
        data: [],
      };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Generate suggestions for specific component types
   */
  const generateForComponent = async (componentType, context = {}) => {
    const prompts = {
      number: {
        prompt: `Generate number suggestions for ${context.label || "number input"}. Min: ${context.min || 0}, Max: ${context.max || 100}. Current value: ${context.value || "empty"}.`,
        options: { max_suggestions: 3, tone: "neutral" },
      },
      "text-input": {
        prompt: `Generate text suggestions for ${context.label || "text input"}. Current value: ${context.value || "empty"}. Required: ${context.required || false}.`,
        options: { max_suggestions: 5, tone: "professional" },
      },
      textarea: {
        prompt: `Generate content suggestions for ${context.label || "textarea"}. Current content: ${context.value || "empty"}.`,
        options: { max_suggestions: 4, tone: "professional", max_length: 1000 },
      },
      search: {
        prompt: `Generate search suggestions for: ${context.value || "empty"}.`,
        options: { max_suggestions: 5, tone: "neutral" },
      },
      "rich-text": {
        prompt: `Generate rich text content for ${context.label || "rich text editor"}.`,
        options: { max_suggestions: 3, tone: "professional", max_length: 2000 },
      },
      select: {
        prompt: `Suggest the best choices for ${context.label || "dropdown"} ONLY from this list of options: ${JSON.stringify(context.options || [])}. Each suggestion's "label" and "value" must both be exactly one of the option names from the list. Current selection: ${context.value || "none"}.`,
        options: { max_suggestions: 5, tone: "neutral" },
      },
    };

    const config = prompts[componentType] || prompts["text-input"];
    const fullPrompt = `${config.prompt} ${context.additionalInstructions || ""}`;

    return await generateSuggestions(
      `${componentType}_${context.label || "default"}`,
      fullPrompt,
      config.options,
      context.fallback !== false,
    );
  };

  /**
   * Add to history
   */
  const addToHistory = (entry) => {
    history.value.unshift(entry);
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50);
    }
    saveHistory();
  };

  /**
   * Clear history
   */
  const clearHistory = () => {
    history.value = [];
    localStorage.removeItem("ai_suggestions_history");
  };

  /**
   * Clear cache
   */
  const clearCache = () => {
    cache.value.clear();
  };

  /**
   * Clear suggestions for a specific context
   */
  const clearSuggestions = (context) => {
    delete suggestions.value[context];
  };

  /**
   * Clear all suggestions
   */
  const clearAllSuggestions = () => {
    suggestions.value = {};
    cache.value.clear();
  };

  /**
   * Get fallback suggestions
   */
  const getFallbackSuggestions = (context) => {
    const fallbacks = {
      search: [
        { label: "🔍 Popular searches", value: "popular searches" },
        { label: "🔥 Trending now", value: "trending now" },
        { label: "⭐ Top rated", value: "top rated" },
        { label: "💰 Best deals", value: "best deals" },
        { label: "📦 New arrivals", value: "new arrivals" },
      ],
      textarea: [
        {
          label: "📝 Professional Description",
          value:
            "This is a professional description that highlights the key features and benefits. It provides comprehensive information to help users make informed decisions.",
        },
        {
          label: "🎯 Marketing Copy",
          value:
            "Discover the best! Our product offers exceptional quality and unbeatable value. Experience the difference today.",
        },
        {
          label: "✨ Simple & Clear",
          value:
            "A simple and clear description that explains the product in an easy-to-understand manner.",
        },
      ],
      "text-input": [
        { label: "📝 Example 1", value: "Example value 1" },
        { label: "📝 Example 2", value: "Example value 2" },
        { label: "📝 Example 3", value: "Example value 3" },
      ],
      number: [
        { label: "Minimum", value: 10 },
        { label: "Recommended", value: 25 },
        { label: "Maximum", value: 100 },
      ],
    };

    for (const [key, fallback] of Object.entries(fallbacks)) {
      if (context.includes(key)) {
        return fallback;
      }
    }

    return [
      { label: "Suggestion 1", value: "Suggestion 1" },
      { label: "Suggestion 2", value: "Suggestion 2" },
      { label: "Suggestion 3", value: "Suggestion 3" },
    ];
  };

  /**
   * Save history to localStorage
   */
  const saveHistory = () => {
    try {
      localStorage.setItem(
        "ai_suggestions_history",
        JSON.stringify(history.value),
      );
    } catch (e) {
      console.warn("Failed to save AI history:", e);
    }
  };

  /**
   * Load history from localStorage
   */
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem("ai_suggestions_history");
      if (stored) {
        history.value = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load AI history:", e);
    }
  };

  // Load history on store creation
  loadHistory();

  return {
    // State
    suggestions,
    loading,
    error,
    history,
    cache,

    // Getters
    getSuggestions,
    isLoading,
    getError,
    getHistory,
    getSuggestionsForContext,
    hasSuggestions,

    // Actions
    generateSuggestions,
    generateForComponent,
    clearSuggestions,
    clearAllSuggestions,
    clearHistory,
    clearCache,
    saveHistory,
    loadHistory,
    getFallbackSuggestions,
  };
});

// In NumberInput.vue
// import { useAiSuggestionStore } from '@/stores/aiSuggestionStore';

// const aiStore = useAiSuggestionStore();

// const fetchAIContent = async () => {
//     const context = `number_${props.label || 'input'}`;

//     // Check if suggestions already exist
//     if (aiStore.hasSuggestions(context)) {
//         props.aiSuggestions = aiStore.getSuggestionsForContext(context);
//         showSuggestions.value = true;
//         return;
//     }

//     // Generate new suggestions
//     const result = await aiStore.generateForComponent('number', {
//         label: props.label,
//         min: props.min,
//         max: props.max,
//         value: props.modelValue
//     });

//     if (result.success) {
//         props.aiSuggestions = result.data;
//         showSuggestions.value = true;
//     }
// };

//
// In TextInput.vue
// const fetchAIContent = async () => {
//     const context = `text_${props.label || 'input'}`;

//     if (aiStore.hasSuggestions(context)) {
//         props.aiSuggestions = aiStore.getSuggestionsForContext(context);
//         showSuggestions.value = true;
//         return;
//     }

//     const result = await aiStore.generateForComponent('text-input', {
//         label: props.label,
//         value: props.modelValue
//     });

//     if (result.success) {
//         props.aiSuggestions = result.data;
//         showSuggestions.value = true;
//     }
// };

// // In TextareaInput.vue
// const fetchAIContent = async () => {
//     const context = `textarea_${props.label || 'content'}`;

//     if (aiStore.hasSuggestions(context)) {
//         props.aiSuggestions = aiStore.getSuggestionsForContext(context);
//         showSuggestions.value = true;
//         return;
//     }

//     const result = await aiStore.generateForComponent('textarea', {
//         label: props.label,
//         value: props.modelValue
//     });

//     if (result.success) {
//         props.aiSuggestions = result.data;
//         showSuggestions.value = true;
//     }
// };

// // In SearchInput.vue ====================
// const fetchAIContent = async () => {
//     const context = `search_${props.label || 'search'}`;

//     if (aiStore.hasSuggestions(context)) {
//         props.aiSuggestions = aiStore.getSuggestionsForContext(context);
//         showSuggestions.value = true;
//         return;
//     }

//     const result = await aiStore.generateForComponent('search', {
//         label: props.label,
//         value: searchValue.value
//     });

//     if (result.success) {
//         props.aiSuggestions = result.data;
//         showSuggestions.value = true;
//     }
// };

// // In any component ==============================
// import { useAiSuggestionStore } from '@/stores/aiSuggestionStore';

// const aiStore = useAiSuggestionStore();

// const getCustomSuggestions = async () => {
//     const result = await aiStore.generateSuggestions(
//         'custom_context',
//         'Generate product descriptions for a luxury watch brand',
//         {
//             max_suggestions: 5,
//             tone: 'luxury',
//             max_length: 200
//         }
//     );

//     if (result.success) {
//         console.log('Suggestions:', result.data);
//     }
// };

//================================

// // In a component
// import { useAiSuggestionStore } from '@/stores/aiSuggestionStore';

// const aiStore = useAiSuggestionStore();

// // Check history
// const history = aiStore.getHistory;
// console.log('Previous AI suggestions:', history);

// // Clear specific context
// aiStore.clearSuggestions('textarea_description');

// // Clear all suggestions
// aiStore.clearAllSuggestions();

// // Clear cache
// aiStore.clearCache();

// 1 peace Cabinet unit were sent to the headoffice with Mr. Pappu sir's Approval.







// Step 1: Install Required Package
// bash
// composer require google-gemini-php/laravel
// Step 2: Add API Key to .env
// env
// GEMINI_API_KEY=your_gemini_api_key_here
// GEMINI_MODEL=gemini-3.5-flash
// Step 3: Create AI Controller
// php

// <?php
// // app/Http/Controllers/Api/AiSuggestionController.php

// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Http;
// use Illuminate\Support\Facades\Log;

// class AiSuggestionController extends Controller
// {
//   protected $apiKey;
//   protected $model;

//   public function __construct()
//   {
//       $this->apiKey = config('gemini.api_key');
//       $this->model = config('gemini.model', 'gemini-3.5-flash');
//   }

//   /**
//    * Generate AI suggestions
//    */
//   public function generateSuggestions(Request $request)
//   {
//       $request->validate([
//           'context' => 'required|string',
//           'prompt' => 'required|string',
//           'options' => 'array',
//           'options.max_suggestions' => 'integer|min:1|max:10',
//           'options.tone' => 'string|in:professional,casual,marketing,technical,luxury,neutral',
//           'options.language' => 'string',
//           'options.max_length' => 'integer|min:10|max:5000',
//           'options.temperature' => 'numeric|min:0|max:1'
//       ]);

//       try {
//           $prompt = $request->input('prompt');
//           $options = $request->input('options', []);
//           $maxSuggestions = $options['max_suggestions'] ?? 5;
//           $tone = $options['tone'] ?? 'professional';
//           $maxLength = $options['max_length'] ?? 500;
//           $temperature = $options['temperature'] ?? 0.7;
//           $language = $options['language'] ?? 'en';

//           // Build prompt
//           $fullPrompt = $this->buildPrompt($prompt, $tone, $maxLength, $maxSuggestions, $language);

//           // Call Gemini API
//           $suggestions = $this->callGeminiApi($fullPrompt, $temperature, $maxSuggestions);

//           return response()->json([
//               'success' => true,
//               'data' => $suggestions,
//               'context' => $request->input('context'),
//               'message' => 'Suggestions generated successfully'
//           ]);

//       } catch (\Exception $e) {
//           Log::error('AI Suggestion Error: ', [$e]);
            
//           // Return fallback suggestions
//           return response()->json([
//               'success' => false,
//               'message' => 'Failed to generate suggestions: ' . $e->getMessage(),
//               'data' => $this->getFallbackSuggestions($request->input('context')),
//               'isFallback' => true
//           ], 500);
//       }
//   }

//   /**
//    * Generate search suggestions
//    */
//   public function generateSearchSuggestions(Request $request)
//   {
//       $request->validate([
//           'query' => 'required|string',
//           'max_suggestions' => 'integer|min:1|max:10'
//       ]);

//       try {
//           $query = $request->input('query');
//           $maxSuggestions = $request->input('max_suggestions', 5);

//           $prompt = "Generate {$maxSuggestions} search suggestions for: '{$query}'. 
//                      Make them relevant, diverse, and useful. 
//                      Return only the suggestions as a list.";

//           $suggestions = $this->callGeminiApi($prompt, 0.5, $maxSuggestions);

//           return response()->json([
//               'success' => true,
//               'data' => $suggestions,
//               'query' => $query
//           ]);

//       } catch (\Exception $e) {
//           Log::error('Search Suggestion Error: ' . $e->getMessage());
            
//           return response()->json([
//               'success' => false,
//               'message' => 'Failed to generate search suggestions',
//               'data' => $this->getFallbackSearchSuggestions($request->input('query'))
//           ], 500);
//       }
//   }

//   /**
//    * Generate content suggestions for rich text editor
//    */
//   public function generateContentSuggestions(Request $request)
//   {
//       $request->validate([
//           'context' => 'required|string',
//           'type' => 'required|string|in:description,marketing,technical,simple,creative',
//           'max_suggestions' => 'integer|min:1|max:10'
//       ]);

//       try {
//           $context = $request->input('context');
//           $type = $request->input('type');
//           $maxSuggestions = $request->input('max_suggestions', 5);

//           $prompts = [
//               'description' => "Generate {$maxSuggestions} detailed product descriptions for: {$context}",
//               'marketing' => "Generate {$maxSuggestions} marketing copies for: {$context}",
//               'technical' => "Generate {$maxSuggestions} technical descriptions for: {$context}",
//               'simple' => "Generate {$maxSuggestions} simple descriptions for: {$context}",
//               'creative' => "Generate {$maxSuggestions} creative descriptions for: {$context}"
//           ];

//           $prompt = $prompts[$type] ?? $prompts['description'];
//           $prompt .= " Include HTML formatting where appropriate (bold, italic, lists).";

//           $suggestions = $this->callGeminiApi($prompt, 0.8, $maxSuggestions);

//           return response()->json([
//               'success' => true,
//               'data' => $suggestions,
//               'type' => $type
//           ]);

//       } catch (\Exception $e) {
//           Log::error('Content Suggestion Error: ' . $e->getMessage());
            
//           return response()->json([
//               'success' => false,
//               'message' => 'Failed to generate content suggestions',
//               'data' => $this->getFallbackContentSuggestions($type)
//           ], 500);
//       }
//   }

//   /**
//    * Call Gemini API
//    */
// private function callGeminiApi($prompt, $temperature = 0.7, $maxSuggestions = 5)
// {
//     // API endpoint downgraded back to v1beta for gemini-1.5-flash model support
//     $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";
//       $payload = [
//           'contents' => [
//               [
//                   'parts' => [
//                       ['text' => $prompt]
//                   ]
//               ]
//           ],
//           'generationConfig' => [
//               'temperature' => $temperature,
//               'maxOutputTokens' => 1000,
//               'topP' => 0.95,
//               'topK' => 40
//           ]
//       ];

//       $response = Http::withHeaders([
//           'Content-Type' => 'application/json'
//       ])->post($url, $payload);

//       if (!$response->successful()) {
//           throw new \Exception('Gemini API request failed: ' . $response->body());
//       }

//       $data = $response->json();
        
//       if (!isset($data['candidates'][0]['content']['parts'][0]['text'])) {
//           throw new \Exception('Invalid response from Gemini API');
//       }

//       $text = $data['candidates'][0]['content']['parts'][0]['text'];
        
//       return $this->parseSuggestions($text, $maxSuggestions);
//   }

//   /**
//    * Parse suggestions from Gemini response
//    */
//   private function parseSuggestions($text, $maxSuggestions = 5)
//   {
//       $suggestions = [];
        
//       // Split by new lines or numbered list
//       $lines = preg_split('/\n|\d+\.\s*/', $text, -1, PREG_SPLIT_NO_EMPTY);
        
//       // Clean and filter lines
//       $lines = array_map('trim', $lines);
//       $lines = array_filter($lines, function($line) {
//           return !empty($line) && strlen($line) > 5;
//       });

//       $labels = [
//           'Professional',
//           'Simple',
//           'Detailed',
//           'Concise',
//           'Marketing',
//           'Technical',
//           'Creative',
//           'Standard',
//           'Premium',
//           'Basic'
//       ];

//       foreach ($lines as $index => $line) {
//           if (count($suggestions) >= $maxSuggestions) break;
            
//           $suggestions[] = [
//               'label' => $labels[$index % count($labels)] . ' Suggestion',
//               'value' => trim($line),
//               'description' => substr(trim($line), 0, 100) . '...'
//           ];
//       }

//       // If no suggestions parsed, add fallback
//       if (empty($suggestions)) {
//           $suggestions = $this->getFallbackSuggestions('default');
//       }

//       return $suggestions;
//   }

//   /**
//    * Build prompt with tone and constraints
//    */
//   private function buildPrompt($prompt, $tone, $maxLength, $maxSuggestions, $language)
//   {
//       $toneDescriptions = [
//           'professional' => 'professional, formal, and business-like',
//           'casual' => 'casual, friendly, and conversational',
//           'marketing' => 'persuasive, engaging, and marketing-focused',
//           'technical' => 'technical, precise, and detailed',
//           'luxury' => 'premium, sophisticated, and elegant',
//           'neutral' => 'neutral, balanced, and objective'
//       ];

//       $toneDescription = $toneDescriptions[$tone] ?? $toneDescriptions['professional'];

//       return "Generate {$maxSuggestions} different suggestions based on this request: '{$prompt}'.
               
//              Requirements:
//              - Tone: {$toneDescription}
//              - Language: {$language}
//              - Maximum length: {$maxLength} characters per suggestion
//              - Each suggestion should be unique and valuable
//              - Return as a numbered list
               
//              Make each suggestion clear, actionable, and well-formatted.";
//   }

//   /**
//    * Get fallback suggestions
//    */
//   private function getFallbackSuggestions($context)
//   {
//       $fallbacks = [
//           'search' => [
//               ['label' => 'Popular searches', 'value' => 'popular searches'],
//               ['label' => 'Trending now', 'value' => 'trending now'],
//               ['label' => 'Top rated', 'value' => 'top rated'],
//               ['label' => 'Best deals', 'value' => 'best deals'],
//               ['label' => 'New arrivals', 'value' => 'new arrivals']
//           ],
//           'textarea' => [
//               [
//                   'label' => 'Professional Description',
//                   'value' => 'This is a professional description that highlights the key features and benefits. It provides comprehensive information to help users make informed decisions.'
//               ],
//               [
//                   'label' => 'Marketing Copy',
//                   'value' => 'Discover the best! Our product offers exceptional quality and unbeatable value. Experience the difference today with our limited time offer.'
//               ],
//               [
//                   'label' => 'Simple & Clear',
//                   'value' => 'A simple and clear description that explains the product in an easy-to-understand manner.'
//               ]
//           ],
//           'number' => [
//               ['label' => 'Minimum', 'value' => 1],
//               ['label' => 'Recommended', 'value' => 50],
//               ['label' => 'Maximum', 'value' => 100]
//           ],
//           'text-input' => [
//               ['label' => 'Suggestion 1', 'value' => 'Suggestion value 1'],
//               ['label' => 'Suggestion 2', 'value' => 'Suggestion value 2'],
//               ['label' => 'Suggestion 3', 'value' => 'Suggestion value 3']
//           ]
//       ];

//       foreach ($fallbacks as $key => $suggestions) {
//           if (strpos($context, $key) !== false) {
//               return $suggestions;
//           }
//       }

//       return [
//           ['label' => 'Suggestion 1', 'value' => 'Suggestion 1'],
//           ['label' => 'Suggestion 2', 'value' => 'Suggestion 2'],
//           ['label' => 'Suggestion 3', 'value' => 'Suggestion 3']
//       ];
//   }

//   /**
//    * Get fallback search suggestions
//    */
//   private function getFallbackSearchSuggestions($query)
//   {
//       return [
//           ['label' => "🔍 $query products", 'value' => "$query products"],
//           ['label' => "🔥 Popular $query", 'value' => "popular $query"],
//           ['label' => "⭐ Best $query", 'value' => "best $query"],
//           ['label' => "💰 Cheap $query", 'value' => "cheap $query"],
//           ['label' => "📦 New $query", 'value' => "new $query"]
//       ];
//   }

//   /**
//    * Get fallback content suggestions
//    */
//   private function getFallbackContentSuggestions($type)
//   {
//       $fallbacks = [
//           'description' => [
//               ['label' => 'Professional Description', 'value' => '<p>This is a <strong>professional description</strong> that highlights key features and benefits.</p>'],
//               ['label' => 'Simple Description', 'value' => '<p>A simple and clear description of the product.</p>']
//           ],
//           'marketing' => [
//               ['label' => 'Marketing Copy', 'value' => '<p><strong>Amazing Product!</strong> Discover the <em>best quality</em> at an unbeatable price.</p>'],
//               ['label' => 'Sales Pitch', 'value' => '<p><strong>Limited time offer!</strong> Get the best deal today.</p>']
//           ],
//           'technical' => [
//               ['label' => 'Technical Specs', 'value' => '<ul><li><strong>Feature 1:</strong> Specification</li><li><strong>Feature 2:</strong> Specification</li></ul>']
//           ]
//       ];

//       return $fallbacks[$type] ?? $fallbacks['description'];
//   }
//   }


// Step 4: Create Routes
// php
// <?php
// // routes/api.php

// use App\Http\Controllers\Api\AiSuggestionController;

// Route::prefix('/ai')->group(function () {
//     // Generate general suggestions
//     Route::post('/suggestions', [AiSuggestionController::class, 'generateSuggestions']);
    
//     // Generate search suggestions
//     Route::post('/search-suggestions', [AiSuggestionController::class, 'generateSearchSuggestions']);
    
//     // Generate content suggestions for rich text editor
//     Route::post('/content-suggestions', [AiSuggestionController::class, 'generateContentSuggestions']);
// });
// Step 5: Create Config File
// php
// <?php
// // config/gemini.php

// return [
//     /*
//     |--------------------------------------------------------------------------
//     | Gemini API Key
//     |--------------------------------------------------------------------------
//     */
//     'api_key' => env('GEMINI_API_KEY', ''),

//     /*
//     |--------------------------------------------------------------------------
//     | Gemini Model
//     |--------------------------------------------------------------------------
//     */
//     'model' => env('GEMINI_MODEL', 'gemini-3.5-flash'),

//     /*
//     |--------------------------------------------------------------------------
//     | Default Generation Config
//     |--------------------------------------------------------------------------
//     */
//     'defaults' => [
//         'temperature' => 0.7,
//         'max_output_tokens' => 1000,
//         'top_p' => 0.95,
//         'top_k' => 40,
//     ],
// ];
// Step 6: Create Service Provider (Optional)
// php
// <?php
// // app/Providers/GeminiServiceProvider.php

// namespace App\Providers;

// use Illuminate\Support\ServiceProvider;

// class GeminiServiceProvider extends ServiceProvider
// {
//     public function register()
//     {
//         $this->mergeConfigFrom(
//             __DIR__.'/../../config/gemini.php', 'gemini'
//         );
//     }

//     public function boot()
//     {
//         $this->publishes([
//             __DIR__.'/../../config/gemini.php' => config_path('gemini.php'),
//         ], 'config');
//     }
// }
// Step 7: Create Frontend Service
// javascript
// // services/aiService.js
// import axios from 'axios'

// class AiService {
//     constructor() {
//         this.baseUrl = '/api/ai'
//     }

//     /**
//      * Generate general suggestions
//      */
//     async generateSuggestions(context, prompt, options = {}) {
//         try {
//             const response = await axios.post(`${this.baseUrl}/suggestions`, {
//                 context,
//                 prompt,
//                 options: {
//                     max_suggestions: options.maxSuggestions || 5,
//                     tone: options.tone || 'professional',
//                     language: options.language || 'en',
//                     max_length: options.maxLength || 500,
//                     temperature: options.temperature || 0.7,
//                     ...options
//                 }
//             })
//             return response.data
//         } catch (error) {
//             console.error('AI Service Error:', error)
//             throw error
//         }
//     }

//     /**
//      * Generate search suggestions
//      */
//     async generateSearchSuggestions(query, maxSuggestions = 5) {
//         try {
//             const response = await axios.post(`${this.baseUrl}/search-suggestions`, {
//                 query,
//                 max_suggestions: maxSuggestions
//             })
//             return response.data
//         } catch (error) {
//             console.error('Search Suggestion Error:', error)
//             throw error
//         }
//     }

//     /**
//      * Generate content suggestions
//      */
//     async generateContentSuggestions(context, type = 'description', maxSuggestions = 5) {
//         try {
//             const response = await axios.post(`${this.baseUrl}/content-suggestions`, {
//                 context,
//                 type,
//                 max_suggestions: maxSuggestions
//             })
//             return response.data
//         } catch (error) {
//             console.error('Content Suggestion Error:', error)
//             throw error
//         }
//     }

//     /**
//      * Generate component-specific suggestions
//      */
//     async generateForComponent(componentType, context) {
//         const prompts = {
//             'number': {
//                 prompt: `Generate number suggestions for ${context.label}. Min: ${context.min || 0}, Max: ${context.max || 100}`,
//                 options: { max_suggestions: 3, tone: 'neutral' }
//             },
//             'text-input': {
//                 prompt: `Generate text suggestions for ${context.label}. Current value: ${context.value || 'empty'}`,
//                 options: { max_suggestions: 5, tone: 'professional' }
//             },
//             'textarea': {
//                 prompt: `Generate content suggestions for ${context.label}. Current content: ${context.value || 'empty'}`,
//                 options: { max_suggestions: 5, tone: 'professional', max_length: 500 }
//             },
//             'search': {
//                 prompt: `Generate search suggestions for: ${context.value || 'empty'}`,
//                 options: { max_suggestions: 5, tone: 'neutral' }
//             },
//             'rich-text': {
//                 prompt: `Generate rich text content for ${context.label}. Current content: ${context.value || 'empty'}`,
//                 options: { max_suggestions: 5, tone: 'professional', max_length: 1000 }
//             }
//         }

//         const config = prompts[componentType] || prompts['text-input']
//         return await this.generateSuggestions(
//             `${componentType}_${context.label || 'default'}`,
//             config.prompt,
//             config.options
//         )
//     }
// }

// export const aiService = new AiService()
// Step 8: Test API with Postman
// http
// POST http://localhost:8000/api/ai/suggestions
// Content-Type: application/json

// {
//     "context": "number_quantity",
//     "prompt": "Generate quantity suggestions for order. Min: 1, Max: 100",
//     "options": {
//         "max_suggestions": 5,
//         "tone": "professional",
//         "language": "en",
//         "max_length": 100
//     }
// }
// Step 9: Using in Vue Component
// vue
// <script setup>
// import { ref } from 'vue'
// import { aiService } from '@/services/aiService'

// const suggestions = ref([])
// const isLoading = ref(false)

// const fetchSuggestions = async () => {
//     isLoading.value = true
//     try {
//         const result = await aiService.generateForComponent('number', {
//             label: 'Quantity',
//             min: 1,
//             max: 100
//         })
        
//         if (result.success) {
//             suggestions.value = result.data
//         }
//     } catch (error) {
//         console.error('Failed to fetch suggestions:', error)
//     } finally {
//         isLoading.value = false
//     }
// }
// </script>