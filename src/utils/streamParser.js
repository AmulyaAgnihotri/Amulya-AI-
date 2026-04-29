/**
 * Parses a Server-Sent Events (SSE) stream and yields content chunks.
 * @param {Response} response - The fetch Response object with SSE stream
 * @param {Function} onChunk - Callback called with each text chunk
 * @param {Function} onDone - Callback called when stream completes
 * @param {Function} onError - Callback called on error
 */
export async function parseSSEStream(response, onChunk, onDone, onError) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onDone?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE events (separated by double newlines)
      const events = buffer.split('\n\n');
      buffer = events.pop() || ''; // Keep incomplete event in buffer

      for (const event of events) {
        const lines = event.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                onError?.(data.error);
                return;
              }

              if (data.done) {
                onDone?.();
                return;
              }

              if (data.content) {
                onChunk?.(data.content);
              }
            } catch (e) {
              // Skip malformed JSON lines
            }
          }
        }
      }
    }
  } catch (error) {
    onError?.(error.message);
  }
}
