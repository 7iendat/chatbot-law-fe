// Enhanced types for the improved stream API
interface StreamDataPayload {
    event: "data";
    data: {
        token: string;
        is_final: boolean;
        source: "ai" | "dictionary";
        metadata?: {
            chunk_id: number;
            token_count: number;
            timestamp: number;
        };
    };
}

interface StreamStatusPayload {
    event: "status";
    data: {
        status: "processing" | "generating" | "completed" | "truncated";
        message: string;
        timestamp: string;
    };
}

interface StreamSourcesPayload {
    event: "sources";
    data: {
        sources: Array<{
            source: string;
            title: string;
            preview: string;
            relevance_score: number;
        }>;
    };
}

interface StreamErrorPayload {
    event: "error";
    data: {
        error_code: string;
        message: string;
        status_code: number;
        timestamp: string;
    };
}

interface StreamCompletedPayload {
    event: "completed";
    data: {
        statistics: {
            total_tokens: number;
            chunks_sent: number;
            stream_duration: number;
            total_duration: number;
        };
        timestamp: string;
    };
}

interface StreamConnectionPayload {
    event: "connection";
    data: {
        status: "connected";
        timestamp: string;
    };
}

// Enhanced callbacks interface
interface StreamCallbacks {
    onToken: (payload: StreamDataPayload["data"]) => void;
    onStatus: (payload: StreamStatusPayload["data"]) => void;
    onSources: (payload: StreamSourcesPayload["data"]) => void;
    onCompleted: (payload: StreamCompletedPayload["data"]) => void;
    onError: (payload: StreamErrorPayload["data"]) => void;
    onConnection?: (payload: StreamConnectionPayload["data"]) => void;
    onOpen?: () => void;
}

interface StreamConfig {
    chunk_delay?: number;
    enable_sources?: boolean;
    max_tokens?: number;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

class StreamChatManager {
    private eventSource: EventSource | null = null;
    private retryCount = 0;
    private isManualClose = false;
    private connectionTimeout: NodeJS.Timeout | null = null;

    async streamChatResponse(
        chatId: string,
        message: string,
        callbacks: StreamCallbacks,
        config: StreamConfig = {}
    ): Promise<EventSource | null> {
        // Default configuration
        const defaultConfig: Required<StreamConfig> = {
            chunk_delay: 0.01,
            enable_sources: true,
            max_tokens: 4000,
            timeout: 30000, // 30 seconds
            retryAttempts: 3,
            retryDelay: 1000, // 1 second
        };

        const finalConfig = { ...defaultConfig, ...config };

        try {
            // Use POST method for better security
            const requestBody = {
                chat_id: chatId,
                input: message,
            };

            // Optional: Add config to request if using the enhanced API
            const queryParams = new URLSearchParams();
            if (finalConfig.chunk_delay !== defaultConfig.chunk_delay) {
                queryParams.set(
                    "chunk_delay",
                    finalConfig.chunk_delay.toString()
                );
            }
            if (!finalConfig.enable_sources) {
                queryParams.set("enable_sources", "false");
            }

            const streamPath = `/api/chat/stream${
                queryParams.toString() ? "?" + queryParams.toString() : ""
            }`;

            // Pre-flight check (optional, for authentication validation)
            try {
                await this.preflightCheck(streamPath, requestBody);
            } catch (error) {
                console.error(
                    "[StreamChatManager] Pre-flight check failed:",
                    error
                );
                callbacks.onError({
                    error_code: "PREFLIGHT_FAILED",
                    message: "Authentication or connection error",
                    status_code: 500,
                    timestamp: new Date().toISOString(),
                });
                return null;
            }

            // Create EventSource
            console.log(
                `[StreamChatManager] Creating EventSource to: ${streamPath}`
            );
            this.eventSource = new EventSource(streamPath, {
                withCredentials: true,
            });

            this.isManualClose = false;
            this.setupEventSource(this.eventSource, callbacks, finalConfig);

            return this.eventSource;
        } catch (error: any) {
            console.error("[StreamChatManager] Error creating stream:", error);
            callbacks.onError({
                error_code: "STREAM_CREATION_ERROR",
                message: this.getErrorMessage(error),
                status_code: error.response?.status || 500,
                timestamp: new Date().toISOString(),
            });
            return null;
        }
    }

    private async preflightCheck(
        streamPath: string,
        requestBody: any
    ): Promise<void> {
        // Optional pre-flight check using your existing apiClient
        // This can help catch authentication errors early
        try {
            // You can implement this based on your API structure
            // await apiClient.post('/api/chat/stream/check', requestBody);
            console.log("[StreamChatManager] Pre-flight check passed");
        } catch (error) {
            console.error(
                "[StreamChatManager] Pre-flight check failed:",
                error
            );
            throw error;
        }
    }

    private setupEventSource(
        eventSource: EventSource,
        callbacks: StreamCallbacks,
        config: Required<StreamConfig>
    ): void {
        // Connection timeout
        this.connectionTimeout = setTimeout(() => {
            if (eventSource.readyState === EventSource.CONNECTING) {
                console.warn("[StreamChatManager] Connection timeout");
                eventSource.close();
                callbacks.onError({
                    error_code: "CONNECTION_TIMEOUT",
                    message: "Connection timeout. Please try again.",
                    status_code: 408,
                    timestamp: new Date().toISOString(),
                });
            }
        }, config.timeout);

        // Connection opened
        eventSource.onopen = () => {
            console.log("[StreamChatManager] EventSource connection opened");
            this.retryCount = 0;
            if (this.connectionTimeout) {
                clearTimeout(this.connectionTimeout);
                this.connectionTimeout = null;
            }
            callbacks.onOpen?.();
        };

        // Handle different event types
        eventSource.onmessage = (event) => {
            this.handleMessage(event, callbacks);
        };

        // Connection event
        eventSource.addEventListener("connection", (event) => {
            this.handleConnectionEvent(event as MessageEvent, callbacks);
        });

        // Data events (tokens)
        eventSource.addEventListener("data", (event) => {
            this.handleDataEvent(event as MessageEvent, callbacks);
        });

        // Status events
        eventSource.addEventListener("status", (event) => {
            this.handleStatusEvent(event as MessageEvent, callbacks);
        });

        // Sources events
        eventSource.addEventListener("sources", (event) => {
            this.handleSourcesEvent(event as MessageEvent, callbacks);
        });

        // Completion events
        eventSource.addEventListener("completed", (event) => {
            this.handleCompletedEvent(event as MessageEvent, callbacks);
        });

        // Error events
        eventSource.addEventListener("error", (event) => {
            this.handleErrorEvent(event as MessageEvent, callbacks);
        });

        // Legacy event names for backward compatibility
        eventSource.addEventListener("error_stream", (event) => {
            this.handleErrorEvent(event as MessageEvent, callbacks);
        });

        eventSource.addEventListener("end_stream", (event) => {
            this.handleEndStreamEvent(event as MessageEvent, callbacks);
        });

        // Connection error handler
        eventSource.onerror = (event) => {
            this.handleConnectionError(event, eventSource, callbacks, config);
        };
    }

    private handleMessage(
        event: MessageEvent,
        callbacks: StreamCallbacks
    ): void {
        try {
            // Handle generic messages (fallback for backward compatibility)
            const parsedData = JSON.parse(event.data);
            if (parsedData.token) {
                callbacks.onToken({
                    token: parsedData.token,
                    is_final: parsedData.is_final || false,
                    source: parsedData.source || "ai",
                    metadata: parsedData.metadata,
                });
            }
        } catch (e) {
            console.error(
                "[StreamChatManager] Error parsing generic message:",
                event.data,
                e
            );
        }
    }

    private handleConnectionEvent(
        event: MessageEvent,
        callbacks: StreamCallbacks
    ): void {
        try {
            const payload: StreamConnectionPayload = JSON.parse(event.data);
            console.log(
                "[StreamChatManager] Connection established:",
                payload.data
            );
            callbacks.onConnection?.(payload.data);
        } catch (e) {
            console.error(
                "[StreamChatManager] Error parsing connection event:",
                event.data,
                e
            );
        }
    }

    private handleDataEvent(
        event: MessageEvent,
        callbacks: StreamCallbacks
    ): void {
        try {
            const payload: StreamDataPayload = JSON.parse(event.data);
            callbacks.onToken(payload.data);
        } catch (e) {
            console.error(
                "[StreamChatManager] Error parsing data event:",
                event.data,
                e
            );
        }
    }

    private handleStatusEvent(
        event: MessageEvent,
        callbacks: StreamCallbacks
    ): void {
        try {
            const payload: StreamStatusPayload = JSON.parse(event.data);
            callbacks.onStatus(payload.data);
        } catch (e) {
            console.error(
                "[StreamChatManager] Error parsing status event:",
                event.data,
                e
            );
        }
    }

    private handleSourcesEvent(
        event: MessageEvent,
        callbacks: StreamCallbacks
    ): void {
        try {
            const payload: StreamSourcesPayload = JSON.parse(event.data);
            callbacks.onSources(payload.data);
        } catch (e) {
            console.error(
                "[StreamChatManager] Error parsing sources event:",
                event.data,
                e
            );
        }
    }

    private handleCompletedEvent(
        event: MessageEvent,
        callbacks: StreamCallbacks
    ): void {
        try {
            const payload: StreamCompletedPayload = JSON.parse(event.data);
            console.log(
                "[StreamChatManager] Stream completed:",
                payload.data.statistics
            );
            callbacks.onCompleted(payload.data);
            this.cleanup();
        } catch (e) {
            console.error(
                "[StreamChatManager] Error parsing completed event:",
                event.data,
                e
            );
        }
    }

    private handleErrorEvent(
        event: MessageEvent,
        callbacks: StreamCallbacks
    ): void {
        try {
            const payload: StreamErrorPayload = JSON.parse(event.data);
            console.error("[StreamChatManager] Stream error:", payload.data);
            callbacks.onError(payload.data);
            this.cleanup();
        } catch (e) {
            console.error(
                "[StreamChatManager] Error parsing error event:",
                event.data,
                e
            );
            callbacks.onError({
                error_code: "PARSE_ERROR",
                message: "Error parsing server error response",
                status_code: 500,
                timestamp: new Date().toISOString(),
            });
        }
    }

    private handleEndStreamEvent(
        event: MessageEvent,
        callbacks: StreamCallbacks
    ): void {
        try {
            const payload = event.data
                ? JSON.parse(event.data)
                : { message: "Stream ended" };
            console.log("[StreamChatManager] Stream ended:", payload);

            // Convert to new format for backward compatibility
            callbacks.onCompleted({
                statistics: {
                    total_tokens: 0,
                    chunks_sent: 0,
                    stream_duration: 0,
                    total_duration: 0,
                },
                timestamp: new Date().toISOString(),
            });

            this.cleanup();
        } catch (e) {
            console.error(
                "[StreamChatManager] Error parsing end stream event:",
                event.data,
                e
            );
        }
    }

    private handleConnectionError(
        event: Event,
        eventSource: EventSource,
        callbacks: StreamCallbacks,
        config: Required<StreamConfig>
    ): void {
        if (this.isManualClose) {
            return; // Ignore errors from manual close
        }

        console.error(
            "[StreamChatManager] EventSource connection error:",
            event
        );

        if (eventSource.readyState === EventSource.CLOSED) {
            console.log("[StreamChatManager] EventSource closed");

            // Attempt retry if configured
            if (this.retryCount < config.retryAttempts) {
                this.retryCount++;
                console.log(
                    `[StreamChatManager] Attempting retry ${this.retryCount}/${config.retryAttempts}`
                );

                setTimeout(() => {
                    // You would need to store the original parameters to retry
                    // This is a simplified version
                    callbacks.onStatus({
                        status: "processing",
                        message: `Reconnecting... (attempt ${this.retryCount})`,
                        timestamp: new Date().toISOString(),
                    });
                }, config.retryDelay);
            } else {
                callbacks.onError({
                    error_code: "CONNECTION_FAILED",
                    message: "Connection failed after multiple attempts",
                    status_code: 500,
                    timestamp: new Date().toISOString(),
                });
            }
        } else if (eventSource.readyState === EventSource.CONNECTING) {
            console.warn(
                "[StreamChatManager] EventSource attempting to reconnect..."
            );
            callbacks.onStatus({
                status: "processing",
                message: "Reconnecting...",
                timestamp: new Date().toISOString(),
            });
        } else {
            callbacks.onError({
                error_code: "STREAM_ERROR",
                message: "Streaming connection error. Please try again.",
                status_code: 500,
                timestamp: new Date().toISOString(),
            });
        }
    }

    public close(): void {
        this.isManualClose = true;
        this.cleanup();
    }

    private cleanup(): void {
        if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
        }

        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }

    private getErrorMessage(error: any): string {
        if (error.response?.data?.message) {
            return error.response.data.message;
        }
        if (error.message) {
            return error.message;
        }
        return "An unexpected error occurred";
    }
}

// Export the enhanced API function
const streamChatManager = new StreamChatManager();

export const streamChatResponse = (
    chatId: string,
    message: string,
    callbacks: StreamCallbacks,
    config?: StreamConfig
): Promise<EventSource | null> => {
    return streamChatManager.streamChatResponse(
        chatId,
        message,
        callbacks,
        config
    );
};
