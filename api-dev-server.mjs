import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Vite middleware plugin for handling /api routes during development
 * Loads and executes handler files from the api/ folder
 */
export function apiDevServer() {
    return {
        name: 'api-dev-server',
        configResolved(config) {
            this.config = config;
        },
        configureServer(server) {
            return () => {
                server.middlewares.use(async (req, res, next) => {
                    if (!req.url.startsWith('/api/')) {
                        return next();
                    }

                    try {
                        const urlPath = req.url.split('?')[0];
                        const filePath = path.join(__dirname, urlPath);

                        // Try .ts, .js, or /index.ts variants
                        const variants = [
                            `${filePath}.ts`,
                            `${filePath}.js`,
                            `${filePath}/index.ts`,
                            `${filePath}/index.js`,
                        ];

                        let resolvedPath = null;
                        for (const variant of variants) {
                            if (fs.existsSync(variant)) {
                                resolvedPath = variant;
                                break;
                            }
                        }

                        if (!resolvedPath) {
                            console.warn(`[API] Route not found: ${urlPath}`);
                            res.statusCode = 404;
                            res.end(JSON.stringify({ error: 'API route not found' }));
                            return;
                        }

                        console.log(`[API] Loading handler: ${resolvedPath}`);

                        // Dynamically import with absolute file:// URL
                        const fileUrl = `file://${resolvedPath.replace(/\\/g, '/')}`;
                        const handler = await import(fileUrl);
                        const method = req.method.toUpperCase();

                        // Try named export first, then default
                        let handlerFn = handler[method] || handler.default;

                        if (!handlerFn || typeof handlerFn !== 'function') {
                            console.warn(`[API] No handler for ${method} ${urlPath}`);
                            res.statusCode = 405;
                            res.end(JSON.stringify({ error: 'Method not allowed' }));
                            return;
                        }

                        // Add Express/Vercel style helpers to res
                        if (!res.status) {
                            res.status = function(code) {
                                this.statusCode = code;
                                return this;
                            };
                        }
                        if (!res.json) {
                            res.json = function(data) {
                                if (!this.getHeader('Content-Type')) {
                                    this.setHeader('Content-Type', 'application/json');
                                }
                                this.end(JSON.stringify(data));
                            };
                        }
                        if (!res.send) {
                            res.send = function(data) {
                                this.end(data);
                            };
                        }

                        // Read request body
                        let body = '';
                        req.on('data', chunk => {
                            body += chunk.toString();
                        });

                        req.on('end', async () => {
                            try {
                                req.body = body ? JSON.parse(body) : {};
                            } catch (e) {
                                req.body = {};
                            }

                            try {
                                console.log(`[API] Calling ${method} ${urlPath}`);
                                await handlerFn(req, res);
                            } catch (handlerErr) {
                                console.error(`[API] Handler error:`, handlerErr);
                                if (!res.headersSent) {
                                    res.statusCode = 500;
                                    res.end(JSON.stringify({ error: 'Handler error', details: handlerErr.message }));
                                }
                            }
                        });
                    } catch (err) {
                        console.error('[API] Middleware error:', err);
                        if (!res.headersSent) {
                            res.statusCode = 500;
                            res.end(JSON.stringify({ error: 'Internal server error', details: err.message }));
                        }
                    }
                });
            };
        },
    };
}

export default apiDevServer;
