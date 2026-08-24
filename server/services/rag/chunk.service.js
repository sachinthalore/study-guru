const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_CHUNK_OVERLAP = 200;

export const chunkText = (
  text,
  chunkSize = DEFAULT_CHUNK_SIZE,
  chunkOverlap = DEFAULT_CHUNK_OVERLAP
) => {
  if (!text || !text.trim()) {
    return [];
  }

  if (chunkOverlap >= chunkSize) {
    throw new Error(
      "Chunk overlap must be smaller than chunk size."
    );
  }

  const normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  const chunks = [];

  let start = 0;

  while (start < normalizedText.length) {
    let end = Math.min(
      start + chunkSize,
      normalizedText.length
    );

    // Try to end the chunk at a paragraph boundary.
    if (end < normalizedText.length) {
      const paragraphBreak = normalizedText.lastIndexOf(
        "\n\n",
        end
      );

      if (
        paragraphBreak > start + chunkSize * 0.6
      ) {
        end = paragraphBreak;
      } else {
        // Otherwise try to end at a sentence boundary.
        const sentenceBreak = normalizedText.lastIndexOf(
          ". ",
          end
        );

        if (
          sentenceBreak > start + chunkSize * 0.6
        ) {
          end = sentenceBreak + 1;
        } else {
          // Finally, fall back to the nearest space.
          const wordBreak = normalizedText.lastIndexOf(
            " ",
            end
          );

          if (
            wordBreak > start + chunkSize * 0.6
          ) {
            end = wordBreak;
          }
        }
      }
    }

    const chunk = normalizedText
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= normalizedText.length) {
      break;
    }

    // Calculate overlap from the end of the current chunk.
    let nextStart = Math.max(
      0,
      end - chunkOverlap
    );

    // Never start in the middle of a word.
    const nextSpace = normalizedText.indexOf(
      " ",
      nextStart
    );

    if (
      nextSpace !== -1 &&
      nextSpace < end
    ) {
      nextStart = nextSpace + 1;
    }

    start = nextStart;
  }

  return chunks;
};