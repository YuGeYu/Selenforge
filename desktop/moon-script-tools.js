(function () {
    const BUILTIN_NAMES = [
        'print', 'type', 'str', 'int', 'float', 'bool',
        'len', 'append', 'insert', 'pop', 'remove',
        'contains', 'index_of', 'join', 'split',
        'trim', 'to_upper', 'to_lower', 'substring',
        'starts_with', 'ends_with', 'replace',
        'abs', 'min', 'max', 'floor', 'ceil', 'round',
        'sqrt', 'pow', 'random', 'random_int',
        'now', 'sleep'
    ];

    const normalizeExpr = (expr) => String(expr || '')
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\b/g, '!')
        .trim();

    const emitLine = (lines, depth, text) => {
        lines.push(`${'    '.repeat(Math.max(0, depth))}${text}`);
    };

    const makeCompileError = (lineNumber, message) => {
        const error = new Error(`line ${lineNumber}: ${message}`);
        error.lineNumber = lineNumber;
        return error;
    };

    const makeBuiltins = (runtime, logger = console) => {
        const toNumber = (value, method) => {
            const parsed = method(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };
        const toType = (value) => {
            if (value === null || value === undefined) return 'null';
            if (Array.isArray(value)) return 'list';
            if (typeof value === 'object') return 'dict';
            return typeof value;
        };

        return {
            print(...args) {
                const text = args.map((item) => item === null || item === undefined ? 'null' : String(item)).join(' ');
                if (runtime?.bus?.emit) {
                    runtime.bus.emit('log', { level: 'info', text, args });
                }
                logger.log(...args);
                return text;
            },
            type: toType,
            str: (value) => value === null || value === undefined ? 'null' : String(value),
            int: (value) => toNumber(value, (input) => Number.parseInt(input, 10)),
            float: (value) => toNumber(value, Number.parseFloat),
            bool: (value) => !!value,
            len(value) {
                if (typeof value === 'string' || Array.isArray(value)) return value.length;
                if (value && typeof value === 'object') return Object.keys(value).length;
                return 0;
            },
            append(list, item) {
                if (Array.isArray(list)) list.push(item);
                return list;
            },
            insert(list, index, item) {
                if (Array.isArray(list)) list.splice(Math.max(0, Number(index) || 0), 0, item);
                return list;
            },
            pop(list) {
                return Array.isArray(list) ? list.pop() : null;
            },
            remove(list, item) {
                if (Array.isArray(list)) {
                    const index = list.indexOf(item);
                    if (index !== -1) list.splice(index, 1);
                }
                return list;
            },
            contains(target, needle) {
                if (typeof target === 'string') return target.includes(String(needle));
                if (Array.isArray(target)) return target.includes(needle);
                return false;
            },
            index_of(target, needle) {
                if (typeof target === 'string') return target.indexOf(String(needle));
                if (Array.isArray(target)) return target.indexOf(needle);
                return -1;
            },
            join(list, delimiter) {
                return Array.isArray(list) ? list.join(delimiter ?? '') : '';
            },
            split(text, delimiter) {
                return String(text ?? '').split(delimiter ?? '');
            },
            trim: (text) => String(text ?? '').trim(),
            to_upper: (text) => String(text ?? '').toUpperCase(),
            to_lower: (text) => String(text ?? '').toLowerCase(),
            substring(text, start, length) {
                const normalized = String(text ?? '');
                const offset = Math.max(0, Number(start) || 0);
                if (length === undefined) return normalized.slice(offset);
                return normalized.slice(offset, offset + Math.max(0, Number(length) || 0));
            },
            starts_with: (text, prefix) => String(text ?? '').startsWith(String(prefix ?? '')),
            ends_with: (text, suffix) => String(text ?? '').endsWith(String(suffix ?? '')),
            replace: (text, oldValue, newValue) => String(text ?? '').split(String(oldValue ?? '')).join(String(newValue ?? '')),
            abs: (value) => Math.abs(Number(value) || 0),
            min: (...values) => Math.min(...values.map((value) => Number(value) || 0)),
            max: (...values) => Math.max(...values.map((value) => Number(value) || 0)),
            floor: (value) => Math.floor(Number(value) || 0),
            ceil: (value) => Math.ceil(Number(value) || 0),
            round: (value) => Math.round(Number(value) || 0),
            sqrt: (value) => Math.sqrt(Number(value) || 0),
            pow: (base, exponent) => Math.pow(Number(base) || 0, Number(exponent) || 0),
            random: () => Math.random(),
            random_int(minValue, maxValue) {
                const min = Math.ceil(Number(minValue) || 0);
                const max = Math.floor(Number(maxValue) || 0);
                if (max <= min) return min;
                return Math.floor(Math.random() * (max - min + 1)) + min;
            },
            now: () => Date.now(),
            sleep: (ms) => new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)))
        };
    };

    const compileToJs = (source, options = {}) => {
        const rawLines = String(source || '').replace(/\r\n/g, '\n').split('\n');
        const output = [];
        const blocks = [];

        emitLine(output, 0, `'use strict';`);
        emitLine(output, 0, `const __moon = window.SelenforgeMoonRuntime;`);
        emitLine(output, 0, `const { ${BUILTIN_NAMES.join(', ')} } = __moon;`);
        if (options.moduleName) {
            emitLine(output, 0, `const __moduleName = ${JSON.stringify(options.moduleName)};`);
        }

        rawLines.forEach((rawLine, index) => {
            const lineNumber = index + 1;
            const trimmed = rawLine.trim();

            if (!trimmed) {
                return;
            }

            if (trimmed.startsWith('#')) {
                emitLine(output, blocks.length, `// ${trimmed.slice(1).trim()}`);
                return;
            }

            if (trimmed === 'end') {
                if (!blocks.length) {
                    throw makeCompileError(lineNumber, 'unexpected `end`');
                }
                blocks.pop();
                emitLine(output, blocks.length, '}');
                return;
            }

            const fnMatch = trimmed.match(/^function\s+([A-Za-z_]\w*)\s*\((.*?)\)\s*:\s*$/);
            if (fnMatch) {
                emitLine(output, blocks.length, `function ${fnMatch[1]}(${fnMatch[2]}) {`);
                blocks.push({ type: 'function', lineNumber });
                return;
            }

            const ifMatch = trimmed.match(/^if\s+(.+)\s*:\s*$/);
            if (ifMatch) {
                emitLine(output, blocks.length, `if (${normalizeExpr(ifMatch[1])}) {`);
                blocks.push({ type: 'if', lineNumber });
                return;
            }

            const elifMatch = trimmed.match(/^elif\s+(.+)\s*:\s*$/);
            if (elifMatch) {
                const top = blocks[blocks.length - 1];
                if (!top || top.type !== 'if') {
                    throw makeCompileError(lineNumber, '`elif` must follow an `if` block');
                }
                emitLine(output, blocks.length - 1, `} else if (${normalizeExpr(elifMatch[1])}) {`);
                return;
            }

            if (trimmed === 'else:') {
                const top = blocks[blocks.length - 1];
                if (!top || top.type !== 'if') {
                    throw makeCompileError(lineNumber, '`else` must follow an `if` block');
                }
                emitLine(output, blocks.length - 1, '} else {');
                return;
            }

            const whileMatch = trimmed.match(/^while\s+(.+)\s*:\s*$/);
            if (whileMatch) {
                emitLine(output, blocks.length, `while (${normalizeExpr(whileMatch[1])}) {`);
                blocks.push({ type: 'while', lineNumber });
                return;
            }

            const forToMatch = trimmed.match(/^for\s+([A-Za-z_]\w*)\s*=\s*(.+?)\s+to\s+(.+?)\s*:\s*$/);
            if (forToMatch) {
                const iterator = forToMatch[1];
                const start = normalizeExpr(forToMatch[2]);
                const end = normalizeExpr(forToMatch[3]);
                emitLine(output, blocks.length, `for (let ${iterator} = ${start}; ${iterator} <= ${end}; ${iterator} += 1) {`);
                blocks.push({ type: 'for', lineNumber });
                return;
            }

            const forRangeMatch = trimmed.match(/^for\s+([A-Za-z_]\w*)\s+in\s+range\((.+?)\)\s*:\s*$/);
            if (forRangeMatch) {
                const iterator = forRangeMatch[1];
                const args = forRangeMatch[2].split(',').map((part) => part.trim()).filter(Boolean);
                const start = args.length > 1 ? normalizeExpr(args[0]) : '0';
                const end = args.length > 1 ? normalizeExpr(args[1]) : normalizeExpr(args[0] || '0');
                emitLine(output, blocks.length, `for (let ${iterator} = ${start}; ${iterator} < ${end}; ${iterator} += 1) {`);
                blocks.push({ type: 'for', lineNumber });
                return;
            }

            const forInMatch = trimmed.match(/^for\s+([A-Za-z_]\w*)\s+in\s+(.+)\s*:\s*$/);
            if (forInMatch) {
                emitLine(output, blocks.length, `for (const ${forInMatch[1]} of ${normalizeExpr(forInMatch[2])}) {`);
                blocks.push({ type: 'for', lineNumber });
                return;
            }

            if (trimmed === 'try:') {
                emitLine(output, blocks.length, 'try {');
                blocks.push({ type: 'try', lineNumber });
                return;
            }

            const catchMatch = trimmed.match(/^catch(?:\s+([A-Za-z_]\w*))?\s*:\s*$/);
            if (catchMatch) {
                const top = blocks[blocks.length - 1];
                if (!top || top.type !== 'try') {
                    throw makeCompileError(lineNumber, '`catch` must follow a `try` block');
                }
                emitLine(output, blocks.length - 1, `} catch (${catchMatch[1] || 'error'}) {`);
                blocks[blocks.length - 1] = { type: 'catch', lineNumber };
                return;
            }

            const moonMatch = trimmed.match(/^moon\s+(.+)$/);
            if (moonMatch) {
                emitLine(output, blocks.length, `__moon.spawn(() => ${normalizeExpr(moonMatch[1])});`);
                return;
            }

            if (trimmed.startsWith('throw ')) {
                emitLine(output, blocks.length, `throw ${normalizeExpr(trimmed.slice(6))};`);
                return;
            }

            if (trimmed.startsWith('return ')) {
                emitLine(output, blocks.length, `return ${normalizeExpr(trimmed.slice(7))};`);
                return;
            }

            if (trimmed === 'return') {
                emitLine(output, blocks.length, 'return;');
                return;
            }

            if (trimmed === 'break') {
                emitLine(output, blocks.length, 'break;');
                return;
            }

            if (trimmed === 'continue') {
                emitLine(output, blocks.length, 'continue;');
                return;
            }

            if (trimmed.startsWith('global ')) {
                emitLine(output, blocks.length, `// ${trimmed}`);
                return;
            }

            if (/^(class|switch)\b/.test(trimmed)) {
                throw makeCompileError(lineNumber, `unsupported syntax: ${trimmed.split(/\s+/)[0]}`);
            }

            emitLine(output, blocks.length, `${normalizeExpr(trimmed)};`);
        });

        if (blocks.length) {
            const unclosed = blocks[blocks.length - 1];
            throw makeCompileError(unclosed.lineNumber, `missing \`end\` for ${unclosed.type} block`);
        }

        return output.join('\n');
    };

    const createBus = () => {
        const listeners = new Map();
        return {
            on(event, handler) {
                const list = listeners.get(event) || [];
                list.push(handler);
                listeners.set(event, list);
            },
            emit(event, payload) {
                const list = listeners.get(event) || [];
                list.forEach((handler) => {
                    try {
                        handler(payload);
                    } catch (error) {
                        console.warn('[SelenforgeMoonBus]', error);
                    }
                });
            }
        };
    };

    const runtime = {
        bus: createBus(),
        Scene: {},
        Entity: {},
        Transform: {},
        Camera: {},
        Input: {},
        Time: {},
        Physics: {},
        Audio: {},
        spawn(task) {
            try {
                return Promise.resolve(typeof task === 'function' ? task() : task);
            } catch (error) {
                console.warn('[SelenforgeMoonSpawn]', error);
                return Promise.reject(error);
            }
        }
    };

    Object.assign(runtime, makeBuiltins(runtime, console));

    window.SelenforgeMoonRuntime = runtime;
    window.SelenforgeMoon = {
        compileToJs,
        compileProjectScripts(project) {
            const result = {};
            const scripts = Array.isArray(project?.scripts) ? project.scripts : [];
            scripts.forEach((script) => {
                result[script.id] = compileToJs(script.source, { moduleName: script.name });
            });
            return result;
        },
        createTemplate(kind = 'game', name = 'script.moon') {
            if (kind === 'system') {
                return `function start():\n    print("system script start:", ${JSON.stringify(name)})\nend\n`;
            }
            if (kind === 'rotator') {
                return `function start():\n    self = Scene.findByName("月铸核心")\n    print("rotator ready")\nend\n\nfunction update(dt):\n    if self != null:\n        Transform.rotateY(self, 36 * dt)\n    end\nend\n`;
            }
            return `function start():\n    print("game script start:", ${JSON.stringify(name)})\nend\n\nfunction update(dt):\n    return dt\nend\n`;
        }
    };
})();
