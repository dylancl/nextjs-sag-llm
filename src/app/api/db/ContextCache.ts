import NodeCache from 'node-cache';

/**
 * Used to store the context of the conversation
 * This is a simple in-memory cache that stores the context of the conversation
 * The cache is stored in a key-value format where the key is the conversation ID
 * and the value is the context of the conversation
 */
export class ContextCache {
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache();
  }

  /**
   * Get the context of the conversation
   * @param conversationId The conversation ID
   * @returns The context of the conversation
   */
  get(conversationId: string): any {
    console.log(
      'Getting context for conversationId: ',
      conversationId,
      this.cache.get(conversationId)
    );
    return this.cache.get(conversationId);
  }

  /**
   * Set the context of the conversation
   * @param conversationId The conversation ID
   * @param context The context of the conversation
   */
  set(conversationId: string, context: any): void {
    console.log(
      'Setting context for conversationId: ',
      conversationId,
      context
    );
    this.cache.set(conversationId, context);
  }

  /**
   * Delete the context of the conversation
   * @param conversationId The conversation ID
   */
  delete(conversationId: string): void {
    this.cache.del(conversationId);
  }
}
