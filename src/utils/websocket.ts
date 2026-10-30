export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private connectPromiseResolve: (() => void) | null = null;
  private connectPromiseReject: ((error: Error) => void) | null = null;

  constructor(url: string = process.env.NEXT_PUBLIC_COLLAB_WS_URL || 'ws://localhost:8080') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.connectPromiseResolve = resolve;
      this.connectPromiseReject = reject;

      try {
        this.ws = new WebSocket(this.url);
        this.setupWebSocketHandlers();
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      // eslint-disable-next-line no-console
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.connectPromiseResolve?.();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const handler = this.messageHandlers.get(message.type);
        if (handler) {
          handler(message);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onerror = () => {
      this.connectPromiseReject?.(new Error('WebSocket connection failed'));
    };

    this.ws.onclose = () => {
      // eslint-disable-next-line no-console
      console.log('WebSocket disconnected');
      this.attemptReconnect();
    };
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      // eslint-disable-next-line no-console
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        this.connect().catch(() => {
          // Continue trying
        });
      }, this.reconnectDelay);
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // eslint-disable-next-line no-console
      console.warn('WebSocket is not connected');
    }
  }

  on(type: string, handler: (data: any) => void): () => void {
    this.messageHandlers.set(type, handler);
    return () => {
      this.messageHandlers.delete(type);
    };
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Singleton instance
let wsInstance: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsInstance) {
    wsInstance = new WebSocketClient();
  }
  return wsInstance;
}
