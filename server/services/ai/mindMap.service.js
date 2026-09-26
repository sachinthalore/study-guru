import genAI from "../../config/gemini.js";
import ApiError from "../../utils/apiError.js";
import {
  generateContentWithRetry,
  isGeminiQuotaError,
} from "../../utils/geminiRetry.js";

const MODEL_NAME = "gemini-3.8-flash";

const MIN_TEXT_LENGTH = 200;
const MAX_NODES = 100;

const countWords = (text) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const getTargetNodeCount = (wordCount) => {
  if (wordCount < 1000) return 15;
  if (wordCount < 3000) return 30;
  if (wordCount < 6000) return 45;
  if (wordCount < 10000) return 60;

  return 75;
};

const validateNode = (node, depth = 0) => {
  if (!node || typeof node !== "object") {
    return false;
  }

  if (
    typeof node.label !== "string" ||
    !node.label.trim()
  ) {
    return false;
  }

  if (!Array.isArray(node.children)) {
    return false;
  }

  if (depth > 10) {
    return false;
  }

  return node.children.every((child) =>
    validateNode(child, depth + 1)
  );
};

const countNodes = (node) => {
  if (!node) return 0;

  return (
    1 +
    node.children.reduce(
      (total, child) => total + countNodes(child),
      0
    )
  );
};

const parseGeminiResponse = (response) => {
  const text = response?.text?.trim();

  if (!text) {
    throw new ApiError(
      500,
      "AI returned an empty mind map."
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError(
      500,
      "AI returned an invalid mind map format."
    );
  }
};

export const generateDocumentMindMap = async (
  extractedText
) => {
  if (
    typeof extractedText !== "string" ||
    !extractedText.trim()
  ) {
    throw new ApiError(
      400,
      "Document text is required to generate a mind map."
    );
  }

  const normalizedText = extractedText.trim();

  if (normalizedText.length < MIN_TEXT_LENGTH) {
    throw new ApiError(
      400,
      "Document content is too short to generate a meaningful mind map."
    );
  }

  const wordCount = countWords(normalizedText);
  const targetNodeCount = getTargetNodeCount(wordCount);

  const prompt = `
You are an AI study assistant.

Create a structured mind map from the provided document content.

Rules:
- Use ONLY information present in the document.
- Do not add external knowledge.
- Identify the main topic as the root node.
- Organize concepts from general to specific.
- Group related concepts under meaningful parent nodes.
- Avoid duplicate or nearly duplicate nodes.
- Keep labels concise and easy for a college student to understand.
- Preserve important concepts, definitions, processes, categories, relationships, and key facts.
- Do not write paragraphs inside labels.
- Create approximately ${targetNodeCount} meaningful nodes.
- Never exceed ${MAX_NODES} total nodes.
- The root node must have at least one child.
- Every node must contain a "label" and a "children" array.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap the JSON in \`\`\`.

Required JSON structure:

{
  "title": "Main Topic",
  "root": {
    "label": "Main Topic",
    "children": [
      {
        "label": "Concept",
        "children": []
      }
    ]
  }
}

Document content:

${normalizedText}
`;

  try {
    const response = await generateContentWithRetry(
      () =>
        genAI.models.generateContent({
          model: MODEL_NAME,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          },
        })
    );

    const mindMap = parseGeminiResponse(response);

    if (
      typeof mindMap.title !== "string" ||
      !mindMap.title.trim()
    ) {
      throw new ApiError(
        500,
        "AI returned an invalid mind map title."
      );
    }

    if (!mindMap.root) {
      throw new ApiError(
        500,
        "AI returned a mind map without a root node."
      );
    }

    if (!validateNode(mindMap.root)) {
      throw new ApiError(
        500,
        "AI returned an invalid mind map structure."
      );
    }

    const totalNodes = countNodes(mindMap.root);

    if (totalNodes > MAX_NODES) {
      throw new ApiError(
        500,
        "AI generated too many mind map nodes."
      );
    }

    if (mindMap.root.children.length === 0) {
      throw new ApiError(
        500,
        "AI generated an empty mind map."
      );
    }

    return {
      title: mindMap.title.trim(),
      root: mindMap.root,
      metadata: {
        wordCount,
        nodeCount: totalNodes,
      },
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Mind Map Generation Error:", error);

    if (isGeminiQuotaError(error)) {
      throw new ApiError(
        429,
        "AI service quota or rate limit reached. Please try again later."
      );
    }

    const statusCode =
      error?.status ||
      error?.statusCode ||
      error?.response?.status;

    if (
      typeof statusCode === "number" &&
      statusCode >= 500 &&
      statusCode < 600
    ) {
      throw new ApiError(
        503,
        "AI service is temporarily unavailable. Please try again later."
      );
    }

    throw new ApiError(
      500,
      "Failed to generate mind map."
    );
  }
};