#!/usr/bin/env node
// generated-by-copilot: Book Database MCP Server - Main entry point with stdio transport
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerBookTools } from './tools/books-tools.js';
/**
 * Initialize and start the MCP server
 */
async function main() {
    // Create MCP server instance
    const server = new McpServer({
        name: 'book-database-mcp-server',
        version: '1.0.0',
    });
    // Register all book-related tools
    registerBookTools(server);
    // Set up stdio transport for local integrations
    const transport = new StdioServerTransport();
    // Connect server to transport
    await server.connect(transport);
    // Log to stderr to indicate server is running
    console.error('Book Database MCP Server running via stdio');
}
// Start the server
main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map