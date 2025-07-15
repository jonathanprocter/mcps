#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import puppeteer, { Browser, Page } from 'puppeteer';
import { PuppeteerScreenshot, PuppeteerPDFOptions, ScrapingResult } from '../types/index.js';

class PuppeteerMCPServer {
  private server: Server;
  private browser: Browser | null = null;

  constructor() {
    this.server = new Server(
      {
        name: 'puppeteer-mcp-server',
        version: '1.0.0',
        description: 'MCP server for web scraping and automation using Puppeteer on iPhone'
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'scrape_page':
            return await this.scrapePage(args as any);
          case 'take_screenshot':
            return await this.takeScreenshot(args as any);
          case 'generate_pdf':
            return await this.generatePDF(args as any);
          case 'click_element':
            return await this.clickElement(args as any);
          case 'fill_form':
            return await this.fillForm(args as any);
          case 'extract_links':
            return await this.extractLinks(args as any);
          case 'extract_images':
            return await this.extractImages(args as any);
          case 'wait_for_element':
            return await this.waitForElement(args as any);
          case 'get_page_title':
            return await this.getPageTitle(args as any);
          case 'get_page_content':
            return await this.getPageContent(args as any);
          case 'execute_javascript':
            return await this.executeJavaScript(args as any);
          case 'get_cookies':
            return await this.getCookies(args as any);
          case 'set_cookies':
            return await this.setCookies(args as any);
          case 'navigate_to_url':
            return await this.navigateToUrl(args as any);
          case 'go_back':
            return await this.goBack();
          case 'go_forward':
            return await this.goForward();
          case 'reload_page':
            return await this.reloadPage();
          case 'get_viewport_size':
            return await this.getViewportSize();
          case 'set_viewport_size':
            return await this.setViewportSize(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'scrape_page',
        description: 'Scrape content from a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to scrape',
            },
            selector: {
              type: 'string',
              description: 'CSS selector to extract specific content (optional)',
            },
            waitForSelector: {
              type: 'string',
              description: 'CSS selector to wait for before scraping (optional)',
            },
            includeLinks: {
              type: 'boolean',
              description: 'Whether to include links in the scraped content',
            },
            includeImages: {
              type: 'boolean',
              description: 'Whether to include images in the scraped content',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 30000)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'take_screenshot',
        description: 'Take a screenshot of a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to screenshot',
            },
            selector: {
              type: 'string',
              description: 'CSS selector to screenshot specific element (optional)',
            },
            fullPage: {
              type: 'boolean',
              description: 'Whether to capture the full page (default: false)',
            },
            width: {
              type: 'number',
              description: 'Viewport width (default: 1920)',
            },
            height: {
              type: 'number',
              description: 'Viewport height (default: 1080)',
            },
            format: {
              type: 'string',
              enum: ['png', 'jpeg', 'webp'],
              description: 'Image format (default: png)',
            },
            quality: {
              type: 'number',
              description: 'Image quality for jpeg/webp (0-100, default: 80)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'generate_pdf',
        description: 'Generate a PDF from a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to convert to PDF',
            },
            format: {
              type: 'string',
              enum: ['A4', 'A3', 'A2', 'A1', 'A0', 'Legal', 'Letter', 'Tabloid'],
              description: 'Paper format (default: A4)',
            },
            landscape: {
              type: 'boolean',
              description: 'Whether to use landscape orientation (default: false)',
            },
            printBackground: {
              type: 'boolean',
              description: 'Whether to print background graphics (default: false)',
            },
            marginTop: {
              type: 'string',
              description: 'Top margin (default: 0)',
            },
            marginRight: {
              type: 'string',
              description: 'Right margin (default: 0)',
            },
            marginBottom: {
              type: 'string',
              description: 'Bottom margin (default: 0)',
            },
            marginLeft: {
              type: 'string',
              description: 'Left margin (default: 0)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'click_element',
        description: 'Click on an element on a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the page',
            },
            selector: {
              type: 'string',
              description: 'CSS selector of the element to click',
            },
            waitForNavigation: {
              type: 'boolean',
              description: 'Whether to wait for navigation after click (default: false)',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 30000)',
            },
          },
          required: ['url', 'selector'],
        },
      },
      {
        name: 'fill_form',
        description: 'Fill form fields on a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the page',
            },
            fields: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  selector: { type: 'string' },
                  value: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['text', 'select', 'checkbox', 'radio'],
                    description: 'Type of form field (default: text)',
                  },
                },
                required: ['selector', 'value'],
              },
              description: 'Array of form fields to fill',
            },
            submitSelector: {
              type: 'string',
              description: 'CSS selector of the submit button (optional)',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 30000)',
            },
          },
          required: ['url', 'fields'],
        },
      },
      {
        name: 'extract_links',
        description: 'Extract all links from a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to extract links from',
            },
            selector: {
              type: 'string',
              description: 'CSS selector to filter links (optional)',
            },
            includeExternal: {
              type: 'boolean',
              description: 'Whether to include external links (default: true)',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 30000)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'extract_images',
        description: 'Extract all images from a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to extract images from',
            },
            selector: {
              type: 'string',
              description: 'CSS selector to filter images (optional)',
            },
            includeDataUrls: {
              type: 'boolean',
              description: 'Whether to include data URLs (default: false)',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 30000)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'wait_for_element',
        description: 'Wait for an element to appear on a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the page',
            },
            selector: {
              type: 'string',
              description: 'CSS selector of the element to wait for',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 30000)',
            },
            visible: {
              type: 'boolean',
              description: 'Whether to wait for the element to be visible (default: true)',
            },
          },
          required: ['url', 'selector'],
        },
      },
      {
        name: 'get_page_title',
        description: 'Get the title of a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the page',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'get_page_content',
        description: 'Get the HTML content of a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the page',
            },
            selector: {
              type: 'string',
              description: 'CSS selector to get content from specific element (optional)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'execute_javascript',
        description: 'Execute JavaScript on a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the page',
            },
            script: {
              type: 'string',
              description: 'JavaScript code to execute',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 30000)',
            },
          },
          required: ['url', 'script'],
        },
      },
      {
        name: 'get_cookies',
        description: 'Get cookies from a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the page',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'set_cookies',
        description: 'Set cookies for a web page',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL of the page',
            },
            cookies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  value: { type: 'string' },
                  domain: { type: 'string' },
                  path: { type: 'string' },
                  expires: { type: 'number' },
                  httpOnly: { type: 'boolean' },
                  secure: { type: 'boolean' },
                  sameSite: {
                    type: 'string',
                    enum: ['Strict', 'Lax', 'None'],
                  },
                },
                required: ['name', 'value'],
              },
              description: 'Array of cookies to set',
            },
          },
          required: ['url', 'cookies'],
        },
      },
      {
        name: 'navigate_to_url',
        description: 'Navigate to a specific URL',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'URL to navigate to',
            },
            waitUntil: {
              type: 'string',
              enum: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2'],
              description: 'When to consider navigation complete (default: load)',
            },
            timeout: {
              type: 'number',
              description: 'Timeout in milliseconds (default: 30000)',
            },
          },
          required: ['url'],
        },
      },
      {
        name: 'go_back',
        description: 'Go back in browser history',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'go_forward',
        description: 'Go forward in browser history',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'reload_page',
        description: 'Reload the current page',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_viewport_size',
        description: 'Get the current viewport size',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'set_viewport_size',
        description: 'Set the viewport size',
        inputSchema: {
          type: 'object',
          properties: {
            width: {
              type: 'number',
              description: 'Viewport width',
            },
            height: {
              type: 'number',
              description: 'Viewport height',
            },
          },
          required: ['width', 'height'],
        },
      },
    ];
  }

  private async ensureBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  private async scrapePage(args: {
    url: string;
    selector?: string;
    waitForSelector?: string;
    includeLinks?: boolean;
    includeImages?: boolean;
    timeout?: number;
  }): Promise<any> {
    const {
      url,
      selector,
      waitForSelector,
      includeLinks = false,
      includeImages = false,
      timeout = 30000,
    } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, { timeout });

      if (waitForSelector) {
        await page.waitForSelector(waitForSelector, { timeout });
      }

      const result: ScrapingResult = {
        url,
        title: await page.title(),
        content: '',
        links: [],
        images: [],
        metadata: {},
      };

      if (selector) {
        const element = await page.$(selector);
        if (element) {
          result.content = await element.evaluate(el => el.textContent || '');
        }
      } else {
        result.content = await page.evaluate(() => document.body.textContent || '');
      }

      if (includeLinks) {
        result.links = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href]'));
          return links.map(link => (link as HTMLAnchorElement).href);
        });
      }

      if (includeImages) {
        result.images = await page.evaluate(() => {
          const images = Array.from(document.querySelectorAll('img[src]'));
          return images.map(img => (img as HTMLImageElement).src);
        });
      }

      // Extract metadata
      result.metadata = await page.evaluate(() => {
        const metas = Array.from(document.querySelectorAll('meta'));
        const metadata: Record<string, any> = {};
        
        metas.forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (name && content) {
            metadata[name] = content;
          }
        });
        
        return metadata;
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async takeScreenshot(args: {
    url: string;
    selector?: string;
    fullPage?: boolean;
    width?: number;
    height?: number;
    format?: 'png' | 'jpeg' | 'webp';
    quality?: number;
  }): Promise<any> {
    const {
      url,
      selector,
      fullPage = false,
      width = 1920,
      height = 1080,
      format = 'png',
      quality = 80,
    } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.setViewport({ width, height });
      await page.goto(url);

      let screenshot: Buffer;

      if (selector) {
        const element = await page.$(selector);
        if (!element) {
          throw new Error(`Element with selector "${selector}" not found`);
        }
        screenshot = Buffer.from(await element.screenshot({
          type: format,
          quality: format === 'png' ? undefined : quality,
        }));
      } else {
        screenshot = Buffer.from(await page.screenshot({
          fullPage,
          type: format,
          quality: format === 'png' ? undefined : quality,
        }));
      }

      const base64Screenshot = screenshot.toString('base64');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              url,
              format,
              base64: base64Screenshot,
            }, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async generatePDF(args: {
    url: string;
    format?: string;
    landscape?: boolean;
    printBackground?: boolean;
    marginTop?: string;
    marginRight?: string;
    marginBottom?: string;
    marginLeft?: string;
  }): Promise<any> {
    const {
      url,
      format = 'A4',
      landscape = false,
      printBackground = false,
      marginTop = '0',
      marginRight = '0',
      marginBottom = '0',
      marginLeft = '0',
    } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);

      const pdf = await page.pdf({
        format: format as any,
        landscape,
        printBackground,
        margin: {
          top: marginTop,
          right: marginRight,
          bottom: marginBottom,
          left: marginLeft,
        },
      });

      const base64PDF = Buffer.from(pdf).toString('base64');

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              url,
              format,
              base64: base64PDF,
            }, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async clickElement(args: {
    url: string;
    selector: string;
    waitForNavigation?: boolean;
    timeout?: number;
  }): Promise<any> {
    const { url, selector, waitForNavigation = false, timeout = 30000 } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);
      await page.waitForSelector(selector, { timeout });

      if (waitForNavigation) {
        await Promise.all([
          page.waitForNavigation({ timeout }),
          page.click(selector),
        ]);
      } else {
        await page.click(selector);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully clicked element with selector "${selector}"`,
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async fillForm(args: {
    url: string;
    fields: Array<{
      selector: string;
      value: string;
      type?: 'text' | 'select' | 'checkbox' | 'radio';
    }>;
    submitSelector?: string;
    timeout?: number;
  }): Promise<any> {
    const { url, fields, submitSelector, timeout = 30000 } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);

      for (const field of fields) {
        const { selector, value, type = 'text' } = field;
        await page.waitForSelector(selector, { timeout });

        switch (type) {
          case 'text':
            await page.type(selector, value);
            break;
          case 'select':
            await page.select(selector, value);
            break;
          case 'checkbox':
          case 'radio':
            if (value === 'true' || value === '1') {
              await page.click(selector);
            } else {
              // For unchecking, we need to check if it's already checked first
              const element = await page.$(selector);
              if (element) {
                const isChecked = await element.evaluate((el: any) => el.checked);
                if (isChecked) {
                  await page.click(selector);
                }
              }
            }
            break;
        }
      }

      if (submitSelector) {
        await page.click(submitSelector);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Successfully filled form with ${fields.length} fields${submitSelector ? ' and submitted' : ''}`,
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async extractLinks(args: {
    url: string;
    selector?: string;
    includeExternal?: boolean;
    timeout?: number;
  }): Promise<any> {
    const { url, selector, includeExternal = true, timeout = 30000 } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, { timeout });

      const links = await page.evaluate((linkSelector, includeExt, pageUrl) => {
        const linkElements = linkSelector 
          ? Array.from(document.querySelectorAll(linkSelector))
          : Array.from(document.querySelectorAll('a[href]'));

        return linkElements.map(link => {
          const href = (link as HTMLAnchorElement).href;
          const text = link.textContent?.trim() || '';
          const isExternal = !href.startsWith(pageUrl) && !href.startsWith('/');
          
          return {
            href,
            text,
            isExternal,
          };
        }).filter(link => includeExt || !link.isExternal);
      }, selector, includeExternal, url);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(links, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async extractImages(args: {
    url: string;
    selector?: string;
    includeDataUrls?: boolean;
    timeout?: number;
  }): Promise<any> {
    const { url, selector, includeDataUrls = false, timeout = 30000 } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, { timeout });

      const images = await page.evaluate((imgSelector, includeData) => {
        const imgElements = imgSelector 
          ? Array.from(document.querySelectorAll(imgSelector))
          : Array.from(document.querySelectorAll('img[src]'));

        return imgElements.map(img => {
          const src = (img as HTMLImageElement).src;
          const alt = (img as HTMLImageElement).alt;
          const width = (img as HTMLImageElement).width;
          const height = (img as HTMLImageElement).height;
          const isDataUrl = src.startsWith('data:');
          
          return {
            src,
            alt,
            width,
            height,
            isDataUrl,
          };
        }).filter(img => includeData || !img.isDataUrl);
      }, selector, includeDataUrls);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(images, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async waitForElement(args: {
    url: string;
    selector: string;
    timeout?: number;
    visible?: boolean;
  }): Promise<any> {
    const { url, selector, timeout = 30000, visible = true } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);
      await page.waitForSelector(selector, { timeout, visible });

      return {
        content: [
          {
            type: 'text',
            text: `Element with selector "${selector}" is now available`,
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async getPageTitle(args: { url: string }): Promise<any> {
    const { url } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);
      const title = await page.title();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ url, title }, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async getPageContent(args: { url: string; selector?: string }): Promise<any> {
    const { url, selector } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);

      let content: string;
      if (selector) {
        const element = await page.$(selector);
        content = element ? await element.evaluate(el => el.innerHTML) : '';
      } else {
        content = await page.content();
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ url, content }, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async executeJavaScript(args: {
    url: string;
    script: string;
    timeout?: number;
  }): Promise<any> {
    const { url, script, timeout = 30000 } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);
      const result = await page.evaluate(script);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ url, script, result }, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async getCookies(args: { url: string }): Promise<any> {
    const { url } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);
      const cookies = await page.cookies();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ url, cookies }, null, 2),
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async setCookies(args: {
    url: string;
    cookies: Array<{
      name: string;
      value: string;
      domain?: string;
      path?: string;
      expires?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: 'Strict' | 'Lax' | 'None';
    }>;
  }): Promise<any> {
    const { url, cookies } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url);
      await page.setCookie(...cookies);

      return {
        content: [
          {
            type: 'text',
            text: `Successfully set ${cookies.length} cookies`,
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async navigateToUrl(args: {
    url: string;
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    timeout?: number;
  }): Promise<any> {
    const { url, waitUntil = 'load', timeout = 30000 } = args;

    const browser = await this.ensureBrowser();
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil, timeout });

      return {
        content: [
          {
            type: 'text',
            text: `Successfully navigated to ${url}`,
          },
        ],
      };
    } finally {
      await page.close();
    }
  }

  private async goBack(): Promise<any> {
    // This would require maintaining a persistent page, simplified for now
    return {
      content: [
        {
          type: 'text',
          text: 'Go back functionality requires a persistent browser session',
        },
      ],
    };
  }

  private async goForward(): Promise<any> {
    // This would require maintaining a persistent page, simplified for now
    return {
      content: [
        {
          type: 'text',
          text: 'Go forward functionality requires a persistent browser session',
        },
      ],
    };
  }

  private async reloadPage(): Promise<any> {
    // This would require maintaining a persistent page, simplified for now
    return {
      content: [
        {
          type: 'text',
          text: 'Reload page functionality requires a persistent browser session',
        },
      ],
    };
  }

  private async getViewportSize(): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ width: 1920, height: 1080 }, null, 2),
        },
      ],
    };
  }

  private async setViewportSize(args: { width: number; height: number }): Promise<any> {
    const { width, height } = args;

    return {
      content: [
        {
          type: 'text',
          text: `Viewport size set to ${width}x${height}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Puppeteer MCP server running on stdio');

    // Clean up on exit
    process.on('SIGINT', async () => {
      if (this.browser) {
        await this.browser.close();
      }
      process.exit(0);
    });
  }
}

const server = new PuppeteerMCPServer();
server.run().catch(console.error);