#!/usr/bin/env node

/**
 * Context7 MCP Server for ha-cleanup project
 * 
 * This server provides Model Context Protocol integration for Context7 standards,
 * enabling AI assistants to access project patterns, standards, and configurations
 * in real-time.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema,
  ListResourcesRequestSchema, 
  ReadResourceRequestSchema,
  ListPromptsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Context7MCPServer {
  constructor() {
    this.projectRoot = process.env.PROJECT_ROOT || process.cwd();
    this.agentOsPath = process.env.AGENT_OS_PATH || '.agent-os';
    this.projectName = 'ha-cleanup';
    this.projectType = 'react-webapp';
    
    this.server = new Server(
      {
        name: 'context7-ha-cleanup',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );
    
    this.setupHandlers();
  }

  setupHandlers() {
    this.setupResourceHandlers();
    this.setupToolHandlers();
  }

  setupResourceHandlers() {
    // List available Context7 resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'context7://standards/tech-stack',
            name: 'Technology Stack',
            description: 'Current technology stack and standards',
            mimeType: 'text/markdown'
          },
          {
            uri: 'context7://standards/context7-standards',
            name: 'Context7 Standards',
            description: 'Development standards and patterns',
            mimeType: 'text/markdown'
          },
          {
            uri: 'context7://instructions/ai-development',
            name: 'AI Development Instructions',
            description: 'Guidelines for AI-assisted development',
            mimeType: 'text/markdown'
          },
          {
            uri: 'context7://project/agents',
            name: 'Agent Configuration',
            description: 'AI agent setup and instructions',
            mimeType: 'text/markdown'
          },
          {
            uri: 'context7://project/claude',
            name: 'Claude Instructions',
            description: 'Claude Code specific instructions',
            mimeType: 'text/markdown'
          }
        ]
      };
    });

    // Read Context7 resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      let filePath;
      
      if (uri === 'context7://standards/tech-stack') {
        filePath = path.join(this.projectRoot, this.agentOsPath, 'standards', 'tech-stack.md');
      } else if (uri === 'context7://standards/context7-standards') {
        filePath = path.join(this.projectRoot, this.agentOsPath, 'standards', 'context7-standards.md');
      } else if (uri === 'context7://instructions/ai-development') {
        filePath = path.join(this.projectRoot, this.agentOsPath, 'instructions', 'ai-development.md');
      } else if (uri === 'context7://project/agents') {
        filePath = path.join(this.projectRoot, 'AGENTS.md');
      } else if (uri === 'context7://project/claude') {
        filePath = path.join(this.projectRoot, 'CLAUDE.md');
      } else {
        throw new Error(`Unknown resource: ${uri}`);
      }
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return {
          contents: [{
            uri,
            mimeType: 'text/markdown',
            text: content
          }]
        };
      } catch (error) {
        throw new Error(`Failed to read resource ${uri}: ${error.message}`);
      }
    });
  }

  setupToolHandlers() {
    // List available Context7 tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'validate_context7_compliance',
            description: 'Check if code follows Context7 standards',
            inputSchema: {
              type: 'object',
              properties: {
                code: { type: 'string', description: 'Code to validate' },
                filePath: { type: 'string', description: 'File path for context' }
              },
              required: ['code']
            }
          },
          {
            name: 'get_component_pattern',
            description: 'Get React component pattern for Context7 compliance',
            inputSchema: {
              type: 'object',
              properties: {
                componentType: { 
                  type: 'string', 
                  enum: ['functional', 'hook', 'service', 'page'],
                  description: 'Type of component pattern needed'
                },
                componentName: { type: 'string', description: 'Name of the component' }
              },
              required: ['componentType', 'componentName']
            }
          }
        ]
      };
    });

    // Handle Context7 tools
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      if (name === 'validate_context7_compliance') {
        return this.validateContext7Compliance(args.code, args.filePath);
      } else if (name === 'get_component_pattern') {
        return this.getComponentPattern(args.componentType, args.componentName);
      } else {
        throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  async validateContext7Compliance(code, filePath) {
    const issues = [];
    const suggestions = [];
    
    // Basic Context7 checks
    if (!code.includes('AI ASSISTANT CONTEXT')) {
      issues.push('Missing AI ASSISTANT CONTEXT documentation');
      suggestions.push('Add AI ASSISTANT CONTEXT comment block to document component purpose');
    }
    
    if (filePath && filePath.endsWith('.tsx') && !code.includes('React.FC')) {
      if (code.includes('function') && code.includes('export')) {
        suggestions.push('Consider using React.FC type for functional components');
      }
    }
    
    if (code.includes('useState') && !code.includes('loading')) {
      suggestions.push('Consider adding loading states for better UX');
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          compliant: issues.length === 0,
          issues,
          suggestions,
          score: Math.max(0, 100 - (issues.length * 25) - (suggestions.length * 10))
        }, null, 2)
      }]
    };
  }

  async getComponentPattern(componentType, componentName) {
    const patterns = {
      functional: `/**
 * AI ASSISTANT CONTEXT: ${componentName} component
 * Purpose: [Describe the component's purpose and functionality]
 * Usage: [Explain how and where this component is used]
 * Props: [Document expected props and their types]
 * State: [Document any local state management]
 * Dependencies: [List any external dependencies or hooks used]
 */

import React from 'react';

interface ${componentName}Props {
  // Define prop types here
}

export const ${componentName}: React.FC<${componentName}Props> = ({
  // Destructure props here
}) => {
  // Component logic here
  
  return (
    <div className="[tailwind-classes]">
      {/* Component JSX */}
    </div>
  );
};

export default ${componentName};`,
      
      hook: `/**
 * AI ASSISTANT CONTEXT: use${componentName} hook
 * Purpose: [Describe the hook's purpose and functionality]  
 * Usage: [Explain how this hook should be used]
 * Returns: [Document return values and their types]
 * Dependencies: [List any external dependencies]
 */

import { useState, useEffect } from 'react';

interface Use${componentName}Options {
  // Define options interface
}

interface Use${componentName}Return {
  // Define return type interface
}

export const use${componentName} = (options?: Use${componentName}Options): Use${componentName}Return => {
  // Hook logic here
  
  return {
    // Return values here
  };
};`,
      
      service: `/**
 * AI ASSISTANT CONTEXT: ${componentName}Service class
 * Purpose: [Describe the service's purpose and functionality]
 * Usage: [Explain how this service should be used]
 * Methods: [List and describe public methods]
 * Dependencies: [List any external dependencies]
 */

export class ${componentName}Service {
  // Service implementation here
  
  constructor() {
    // Initialize service
  }
  
  // Public methods here
}

export const ${componentName.toLowerCase()}Service = new ${componentName}Service();`
    };
    
    return {
      content: [{
        type: 'text',
        text: patterns[componentType] || 'Pattern not found'
      }]
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Context7 MCP Server running for ha-cleanup');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new Context7MCPServer();
  server.start().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

export default Context7MCPServer;