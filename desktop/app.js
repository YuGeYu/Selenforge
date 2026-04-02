(function () {
    const $ = (id) => document.getElementById(id);
    const ui = {
        sceneList: $('scene-list'),
        sceneFilter: $('scene-filter'),
        sceneAddButton: $('scene-add-button'),
        sceneDeleteButton: $('scene-delete-button'),
        inspectorContent: $('inspector-content'),
        assetList: $('asset-list'),
        assetCreateScriptButton: $('asset-create-script-button'),
        consoleList: $('console-list'),
        cameraSelect: $('camera-select'),
        saveProjectButton: $('save-project-button'),
        loadProjectButton: $('load-project-button'),
        buildGameButton: $('build-game-button'),
        canvas: $('viewport-canvas'),
        statusBanner: $('status-banner'),
        projectChip: $('project-chip'),
        cameraChip: $('camera-chip'),
        sceneContextMenu: $('scene-context-menu'),
        toast: $('toast'),
        confirmMask: $('confirm-mask'),
        confirmTitle: $('confirm-title'),
        confirmText: $('confirm-text'),
        confirmCancel: $('confirm-cancel'),
        confirmOk: $('confirm-ok'),
        scriptEditorMask: $('script-editor-mask'),
        scriptEditorTitle: $('script-editor-title'),
        scriptEditorMeta: $('script-editor-meta'),
        scriptEditorName: $('script-editor-name'),
        scriptEditorDescription: $('script-editor-description'),
        scriptEditorTemplate: $('script-editor-template'),
        scriptEditorRole: $('script-editor-role'),
        scriptEditorSource: $('script-editor-source'),
        scriptEditorPreview: $('script-editor-preview'),
        scriptEditorOutput: $('script-editor-output'),
        scriptEditorTemplateApply: $('script-editor-template-apply'),
        scriptEditorDuplicate: $('script-editor-duplicate'),
        scriptEditorDelete: $('script-editor-delete'),
        scriptEditorApply: $('script-editor-apply'),
        scriptEditorClose: $('script-editor-close'),
        scriptEditorRun: $('script-editor-run'),
        buildMask: $('build-mask'),
        buildGameName: $('build-game-name'),
        buildCompanyName: $('build-company-name'),
        buildVersion: $('build-version'),
        buildWidth: $('build-width'),
        buildHeight: $('build-height'),
        buildStart: $('build-start'),
        buildClose: $('build-close')
    };
    ui.panels = {
        scene: $('scene-drawer'),
        assets: $('assets-drawer'),
        console: $('console-drawer'),
        inspector: $('inspector-drawer')
    };

    const TYPES = [
        ['sprite', '精灵', 'sprite', '#7cc7ff'],
        ['animated-sprite', '动画精灵', 'animatedSprite', '#6fd4ff'],
        ['render', '渲染组件对象', 'render', '#8ccfff'],
        ['box', '盒体', 'render', '#8ccfff'],
        ['capsule', '胶囊体', 'render', '#7ed2c4'],
        ['cone', '圆锥体', 'render', '#79c7ff'],
        ['cylinder', '圆柱体', 'render', '#8bb7ff'],
        ['plane', '平面', 'render', '#5f7f96'],
        ['sphere', '球体', 'render', '#efc97d'],
        ['gsplat', '高斯点云', 'gsplat', '#d6a2ff'],
        ['model-legacy', '模型（Legacy）', 'model', '#8ce1f5'],
        ['audio-listener', '音频监听器', 'audioListener', '#f2a6a6'],
        ['sound', '声音', 'sound', '#f29ba6'],
        ['perspective', '透视摄像机', 'camera', '#f0ce88'],
        ['orthographic', '正交摄像机', 'camera', '#e0be7b'],
        ['directional-light', '方向光', 'light', '#ffd48b'],
        ['omni-light', '全向光', 'light', '#ffd6a5'],
        ['spot-light', '聚光灯', 'light', '#ffc874'],
        ['screen-2d', '二维屏幕', 'screen', '#7ebdff'],
        ['screen-3d', '三维屏幕', 'screen', '#6ea5ff'],
        ['button', '按钮', 'button', '#6cd2ff'],
        ['layout-group', '布局组', 'layoutGroup', '#87b4ff'],
        ['layout-child', '布局子', 'layoutChild', '#7f9dff'],
        ['group-element', '组元素', 'groupElement', '#8ae7ff'],
        ['text-element', '文本元素', 'textElement', '#f2f4ff'],
        ['image-element', '图像元素', 'imageElement', '#7fd5ff'],
        ['scrollbar', '滚动条', 'scrollbar', '#9db6ff'],
        ['scrollview', '滚动视图', 'scrollview', '#8bb7ff']
    ];
    const TYPE_MAP = new Map(TYPES.map(([id, label, category, color]) => [id, { id, label, category, color }]));
    const COMPONENT_LABELS = {
        sprite: 'Sprite',
        animatedSprite: '动画精灵',
        render: '渲染',
        gsplat: '高斯点云',
        model: '模型',
        audioListener: '音频监听器',
        sound: '声音',
        camera: '相机',
        light: '灯光',
        screen: '屏幕',
        button: '按钮',
        layoutGroup: '布局组',
        layoutChild: '布局子',
        groupElement: '组元素',
        textElement: '文本',
        imageElement: '图像',
        scrollbar: '滚动条',
        scrollview: '滚动视图'
    };
    const FIELD_LABELS = {
        enabled: '已启用', name: '名称', tags: '标签', position: '位置', rotation: '旋转度', scale: '比例',
        type: '类型', frame: '帧序号', color: '颜色', opacity: '不透明度', flipX: '水平翻转', flipY: '垂直翻转',
        layer: '层次', order: '顺序', clip: '动画片段', speed: '播放速度', loop: '循环播放',
        castShadows: '投射阴影', receiveShadows: '接收阴影', tint: '颜色', pointSize: '点尺寸',
        volume: '音量', pitch: '音高', positional: '三维声音', refDistance: '参考距离',
        projection: '投影方式', fov: '视野角', orthoHeight: '正交高度', nearClip: '近裁剪面', farClip: '远裁剪面', priority: '优先级',
        intensity: '强度', range: '范围', innerConeAngle: '内锥角', outerConeAngle: '外锥角',
        screenSpace: '屏幕空间', scaleMode: '缩放模式', referenceResolutionX: '参考宽度', referenceResolutionY: '参考高度',
        active: '可交互', transitionMode: '过渡模式', width: '宽度', height: '高度',
        orientation: '排列方向', spacing: '间距', reverseX: '反转 X', reverseY: '反转 Y',
        minWidth: '最小宽度', minHeight: '最小高度', maxWidth: '最大宽度', maxHeight: '最大高度',
        fitWidthProportion: '宽度适配比', fitHeightProportion: '高度适配比', useInput: '响应输入',
        text: '文本内容', fontSize: '字号', lineHeight: '行高', alignment: '对齐方式',
        autoWidth: '自动宽度', autoHeight: '自动高度', spriteAsset: '精灵资源', spriteFrame: '精灵帧',
        value: '当前值', handleSize: '滑块尺寸', horizontal: '允许水平滚动', vertical: '允许垂直滚动',
        scrollMode: '滚动模式', bounceAmount: '回弹强度', friction: '摩擦系数', lightmapped: '使用光照贴图'
    };

    const state = {
        project: null,
        selectedId: '',
        dirty: false,
        sceneFilter: '',
        gizmoMode: 'translate',
        consoleItems: [],
        paths: { snapshotName: 'sfa1', projectFile: 'sfa1/project.txt' }
    };
    const runtime = {
        app: null,
        entities: new Map(),
        editorCamera: null,
        panels: { scene: true, assets: false, console: false, inspector: true },
        confirmHandler: null,
        scriptAssetId: '',
        cameraRig: { yaw: -35, pitch: -15, dragging: false, move: { forward: 0, right: 0, up: 0 } },
        gizmo: { root: null, lines: {}, handles: {}, drag: null }
    };
    const fallbackPaths = {
        snapshotName: 'sfa1',
        projectFile: 'localStorage://sfa1/project.txt',
        projectIniFile: 'localStorage://sfa1/project.ini',
        sceneFile: 'localStorage://sfa1/scenes/main.scene.txt',
        assetFile: 'localStorage://sfa1/assets/assets.cfg',
        scriptsFile: 'localStorage://sfa1/scripts/scripts.cfg'
    };
    const fallbackApi = {
        loadProject: () => ({ ok: true, project: JSON.parse(localStorage.getItem('selenforge-desktop-project-snapshot') || 'null'), paths: fallbackPaths }),
        saveProject: (payload) => {
            localStorage.setItem('selenforge-desktop-project-snapshot', payload);
            return { ok: true, project: JSON.parse(payload), path: fallbackPaths.projectFile, paths: fallbackPaths };
        },
        buildInfo: () => ({ ok: true, paths: fallbackPaths }),
        executeSystemMoonScript: () => ({ ok: false, output: 'Browser fallback does not support system Moon execution.' }),
        buildGame: (payload) => ({ ok: true, outputDir: 'localStorage://builds/mock', exePath: 'localStorage://builds/mock/Game.exe', log: `mock build\n${payload}` }),
        debugLog: () => ({ ok: true })
    };
    const SCRIPT_TEMPLATES = {
        game: {
            role: 'game',
            description: '游戏循环脚本',
            createSource: (name) => window.SelenforgeMoon?.createTemplate ? window.SelenforgeMoon.createTemplate('game', name) : 'function start():\n    print("game script start")\nend\n'
        },
        rotator: {
            role: 'game',
            description: '旋转示例脚本',
            createSource: (name) => window.SelenforgeMoon?.createTemplate ? window.SelenforgeMoon.createTemplate('rotator', name) : 'function update(dt):\n    return dt\nend\n'
        },
        system: {
            role: 'system',
            description: '系统任务脚本',
            createSource: (name) => window.SelenforgeMoon?.createTemplate ? window.SelenforgeMoon.createTemplate('system', name) : 'function start():\n    print("system script start")\nend\n'
        }
    };

    const clone = (v) => JSON.parse(JSON.stringify(v));
    const esc = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
    const typeInfo = (typeId) => TYPE_MAP.get(typeId) || TYPE_MAP.get('box');
    const round2 = (v) => Math.round(Number(v || 0) * 100) / 100;
    const eventElement = (event) => {
        const target = event?.target || null;
        return target instanceof Element ? target : (target?.parentElement || null);
    };
    const unwrapMoonValue = (value) => {
        if (Array.isArray(value)) {
            if (!value.length) return null;
            return unwrapMoonValue(value[0]);
        }
        if (typeof value !== 'string') return value;
        const trimmed = value.trim();
        if (!trimmed.length) return '';
        try {
            return unwrapMoonValue(JSON.parse(trimmed));
        } catch (error) {
            return value;
        }
    };
    const callMoon = async (name, payload) => {
        const result = window.MoonGUI?.call ? await Promise.resolve(window.MoonGUI.call(name, payload || '')) : fallbackApi[name](payload || '');
        return unwrapMoonValue(result);
    };
    const normalizeScriptFileName = (value, fallback = 'script.moon') => {
        const raw = String(value || '').trim() || fallback;
        const safe = raw
            .replace(/[\\/:*?"<>|]/g, '_')
            .replace(/\s+/g, '_');
        const withExt = safe.endsWith('.moon') ? safe : `${safe}.moon`;
        return withExt.startsWith('.') ? fallback : withExt;
    };
    const makeUniqueScriptName = (candidate, ignoreId = '') => {
        const base = normalizeScriptFileName(candidate);
        const existing = new Set((state.project?.scripts || [])
            .filter((script) => script.id !== ignoreId)
            .map((script) => String(script.name || '').toLowerCase()));
        if (!existing.has(base.toLowerCase())) {
            return base;
        }
        const stem = base.replace(/\.moon$/i, '');
        let index = 2;
        while (existing.has(`${stem}_${index}.moon`.toLowerCase())) {
            index += 1;
        }
        return `${stem}_${index}.moon`;
    };
    const compileScript = (source, moduleName) => {
        try {
            const code = window.SelenforgeMoon ? window.SelenforgeMoon.compileToJs(source, { moduleName }) : '';
            return { ok: true, code, error: '' };
        } catch (error) {
            const message = error?.message || String(error);
            return { ok: false, code: `// compile failed: ${message}`, error: message };
        }
    };
    const createScriptRecord = ({ name, role = 'game', description, template = 'game' } = {}) => {
        const normalizedName = makeUniqueScriptName(name || `script_${(state.project?.scripts?.length || 0) + 1}.moon`);
        const selectedTemplate = SCRIPT_TEMPLATES[template] || SCRIPT_TEMPLATES.game;
        const resolvedRole = role || selectedTemplate.role || 'game';
        const source = selectedTemplate.createSource(normalizedName);
        const compilation = compileScript(source, normalizedName);
        return {
            id: `script-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
            name: normalizedName,
            path: `scripts/${normalizedName}`,
            role: resolvedRole,
            description: description || selectedTemplate.description || 'MoonLang 脚本',
            source,
            compiledJs: compilation.code
        };
    };
    const pushConsole = (text, level = 'info') => {
        state.consoleItems.push({ id: `${Date.now()}-${Math.random()}`, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), text, level });
        state.consoleItems = state.consoleItems.slice(-120);
        ui.consoleList.innerHTML = state.consoleItems.map((item) => `<div class="console-entry panel-surface"><div class="console-time">${esc(item.time)}</div><div>${esc(item.text)}</div></div>`).join('');
    };
    const safeRun = (label, fn) => {
        try {
            return fn();
        } catch (error) {
            const message = error?.stack || error?.message || String(error);
            setStatus(`${label}失败：${message}`, true);
            pushConsole(`${label}失败：${message}`, 'warn');
            return null;
        }
    };
    const pushConsoleBlock = (text, level = 'info') => String(text ?? '').replace(/\r\n/g, '\n').split('\n').forEach((line) => line.trim() && pushConsole(line, level));
    const setStatus = (text, warn = false) => {
        ui.statusBanner.textContent = text;
        ui.statusBanner.style.borderColor = warn ? 'rgba(255, 202, 128, 0.42)' : 'rgba(182, 221, 255, 0.28)';
    };
    const showToast = (text) => {
        ui.toast.textContent = text;
        ui.toast.classList.add('show');
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => ui.toast.classList.remove('show'), 2200);
    };
    const syncPanels = () => Object.entries(ui.panels).forEach(([name, panel]) => {
        panel.classList.toggle('open', !!runtime.panels[name]);
        document.querySelector(`[data-toggle-panel="${name}"]`)?.classList.toggle('active', !!runtime.panels[name]);
    });
    const ensurePanel = (name) => {
        runtime.panels[name] = true;
        syncPanels();
    };
    const getObjects = () => state.project?.scene?.objects || [];
    const getObject = (id) => getObjects().find((item) => item.id === id) || null;
    const getScriptByAsset = (assetId) => state.project.scripts.find((script) => `asset-${script.id}` === assetId) || null;
    const cameraObjects = () => getObjects().filter((item) => item.typeId === 'perspective' || item.typeId === 'orthographic');
    const viewportRect = () => ui.canvas.getBoundingClientRect();
    const colorToPc = (hex, alpha = 1) => {
        const safe = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex.slice(1) : 'ffffff';
        return new pc.Color(parseInt(safe.slice(0, 2), 16) / 255, parseInt(safe.slice(2, 4), 16) / 255, parseInt(safe.slice(4, 6), 16) / 255, alpha);
    };
    const defaultComponent = (typeId, category, color) => ({
        sprite: { sprite: { enabled: true, type: 'simple', frame: 0, color: '#ffffff', opacity: 1, flipX: false, flipY: false, layer: 'World', order: 0 } },
        animatedSprite: { animatedSprite: { enabled: true, clip: 'Idle', speed: 1, loop: true, color: '#ffffff', opacity: 1, flipX: false, flipY: false, order: 0 } },
        render: { render: { enabled: true, type: ['render', 'box', 'capsule', 'cone', 'cylinder', 'plane', 'sphere'].includes(typeId) ? (typeId === 'render' ? 'asset' : typeId) : 'box', castShadows: typeId !== 'plane', receiveShadows: true, color, opacity: 1, layer: 'World', order: 0 } },
        gsplat: { gsplat: { enabled: true, tint: color, opacity: 0.92, pointSize: 1, order: 0 } },
        model: { model: { enabled: true, type: 'asset', castShadows: true, receiveShadows: true, lightmapped: false, color } },
        audioListener: { audioListener: { enabled: true } },
        sound: { sound: { enabled: true, volume: 1, pitch: 1, loop: false, positional: true, refDistance: 1.5 } },
        camera: { camera: { enabled: true, projection: typeId === 'orthographic' ? 'orthographic' : 'perspective', fov: 45, orthoHeight: 6, nearClip: 0.1, farClip: 1000, priority: 0 } },
        light: { light: { enabled: true, type: typeId === 'directional-light' ? 'directional' : typeId === 'omni-light' ? 'omni' : 'spot', color, intensity: 1.2, range: 8, innerConeAngle: 25, outerConeAngle: 45, castShadows: false } },
        screen: { screen: { enabled: true, screenSpace: typeId === 'screen-2d', scaleMode: typeId === 'screen-2d' ? 'blend' : 'none', referenceResolutionX: 1280, referenceResolutionY: 720 } },
        button: { button: { enabled: true, active: true, transitionMode: 'tint', width: 180, height: 56, color, opacity: 1 } },
        layoutGroup: { layoutGroup: { enabled: true, orientation: 'horizontal', spacing: 12, reverseX: false, reverseY: false } },
        layoutChild: { layoutChild: { enabled: true, minWidth: 100, minHeight: 50, maxWidth: 300, maxHeight: 180, fitWidthProportion: 1, fitHeightProportion: 0 } },
        groupElement: { groupElement: { enabled: true, width: 220, height: 120, useInput: false, opacity: 0.35, color } },
        textElement: { textElement: { enabled: true, text: '新建文本', fontSize: 32, lineHeight: 34, alignment: 'center', autoWidth: false, autoHeight: false, color, opacity: 1 } },
        imageElement: { imageElement: { enabled: true, width: 160, height: 160, spriteAsset: '', spriteFrame: 0, color, opacity: 1 } },
        scrollbar: { scrollbar: { enabled: true, orientation: 'horizontal', value: 0.5, handleSize: 0.2 } },
        scrollview: { scrollview: { enabled: true, horizontal: true, vertical: true, scrollMode: 'bounce', bounceAmount: 0.1, friction: 0.05 } }
    }[category] || { render: { enabled: true, type: 'box', color, opacity: 1 } });
    const makeObject = (typeId) => {
        const type = typeInfo(typeId);
        const existingObjects = Array.isArray(state.project?.scene?.objects) ? state.project.scene.objects : [];
        const obj = {
            id: `${typeId}-${Math.random().toString(36).slice(2, 8)}`,
            typeId,
            name: `${type.label}${existingObjects.filter((item) => item.typeId === typeId).length + 1}`,
            enabled: true,
            tags: [],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            components: clone(defaultComponent(typeId, type.category, type.color))
        };
        if (typeId === 'plane') obj.scale = [8, 8, 8];
        if (typeId === 'perspective') { obj.position = [4.8, 3.2, 7.2]; obj.rotation = [-15, -35, 0]; }
        if (typeId === 'orthographic') { obj.position = [0, 8, 0]; obj.rotation = [-90, 0, 0]; }
        if (type.category === 'light') { obj.position = [2.8, 4.5, 2.4]; obj.rotation = [45, 35, 0]; }
        return obj;
    };
    const normalizeVec3 = (value, fallback) => [0, 1, 2].map((index) => {
        const raw = Array.isArray(value) ? Number(value[index]) : Number.NaN;
        return Number.isFinite(raw) ? round2(raw) : fallback[index];
    });
    const normalizeObject = (object, index = 0) => {
        const source = object && typeof object === 'object' ? clone(object) : {};
        const typeId = TYPE_MAP.has(source.typeId) ? source.typeId : 'box';
        const type = typeInfo(typeId);
        const fallback = {
            id: source.id || `${typeId}-${Math.random().toString(36).slice(2, 8)}`,
            typeId,
            name: source.name || `${type.label}${index + 1}`,
            enabled: source.enabled !== false,
            tags: Array.isArray(source.tags) ? source.tags.map((item) => String(item || '').trim()).filter(Boolean) : [],
            position: normalizeVec3(source.position, [0, 0, 0]),
            rotation: normalizeVec3(source.rotation, [0, 0, 0]),
            scale: normalizeVec3(source.scale, [1, 1, 1]),
            components: clone(defaultComponent(typeId, type.category, type.color))
        };
        if (!Array.isArray(source.scale) && typeId === 'plane') fallback.scale = [8, 8, 8];
        if (!Array.isArray(source.position) && typeId === 'perspective') fallback.position = [4.8, 3.2, 7.2];
        if (!Array.isArray(source.rotation) && typeId === 'perspective') fallback.rotation = [-15, -35, 0];
        if (!Array.isArray(source.position) && typeId === 'orthographic') fallback.position = [0, 8, 0];
        if (!Array.isArray(source.rotation) && typeId === 'orthographic') fallback.rotation = [-90, 0, 0];
        if (source.components && typeof source.components === 'object') {
            Object.entries(source.components).forEach(([key, value]) => {
                if (!value || typeof value !== 'object' || Array.isArray(value)) {
                    fallback.components[key] = value;
                    return;
                }
                fallback.components[key] = { ...(fallback.components[key] || {}), ...clone(value) };
            });
        }
        return fallback;
    };
    const normalizeScripts = (scripts) => (Array.isArray(scripts) && scripts.length ? scripts : [
        { id: 'script-bootstrap', name: 'bootstrap.moon', path: 'scripts/bootstrap.moon', role: 'game', description: '游戏入口脚本', source: 'function start():\n    print("Selenforge bootstrap start")\nend\n', compiledJs: '' }
    ]).map((script, index) => {
        const item = { id: script.id || `script-${index + 1}`, name: script.name || `script_${index + 1}.moon`, path: script.path || `scripts/script_${index + 1}.moon`, role: script.role || 'game', description: script.description || 'MoonLang 脚本', source: String(script.source || ''), compiledJs: String(script.compiledJs || '') };
        item.name = normalizeScriptFileName(item.name, `script_${index + 1}.moon`);
        item.path = `scripts/${item.name}`;
        item.compiledJs = compileScript(item.source, item.name).code;
        return item;
    });
    const rebuildAssets = (project) => {
        project.assets = [
            { id: 'asset-project-manifest', name: 'project.txt', type: '项目清单', path: 'project.txt', description: '完整项目快照' },
            { id: 'asset-project-config', name: 'project.ini', type: '项目配置', path: 'project.ini', description: '项目基本信息' },
            { id: 'asset-scene-main', name: 'main.scene.txt', type: '场景', path: 'scenes/main.scene.txt', description: '当前主场景' },
            { id: 'asset-assets-index', name: 'assets.cfg', type: '资源索引', path: 'assets/assets.cfg', description: '资源列表索引' },
            ...project.scripts.map((script) => ({ id: `asset-${script.id}`, name: script.name, type: 'Moon脚本', path: script.path, description: script.description, role: script.role }))
        ];
    };
    const normalizeProject = (project) => {
        const source = project && typeof project === 'object' ? clone(project) : {};
        source.meta = source.meta || { format: 'selenforge-project', version: '0.1.0', updatedAt: new Date().toISOString() };
        source.scene = source.scene || { name: '主场景', objects: [] };
        source.scene.name = source.scene.name || '主场景';
        source.scene.objects = (Array.isArray(source.scene.objects) && source.scene.objects.length ? source.scene.objects : [makeObject('perspective'), makeObject('directional-light'), makeObject('plane'), makeObject('box')]).map((object, index) => normalizeObject(object, index));
        source.scene.editorCamera = source.scene.editorCamera || { position: [4.8, 3.2, 7.2], yaw: -35, pitch: -15 };
        source.scripts = normalizeScripts(source.scripts);
        rebuildAssets(source);
        return source;
    };
    const materialColor = (object) => object.components.render?.color || object.components.sprite?.color || object.components.animatedSprite?.color || object.components.model?.color || object.components.gsplat?.tint || object.components.button?.color || object.components.groupElement?.color || object.components.textElement?.color || object.components.imageElement?.color || typeInfo(object.typeId).color;
    const materialOpacity = (object) => object.components.render?.opacity ?? object.components.sprite?.opacity ?? object.components.animatedSprite?.opacity ?? object.components.gsplat?.opacity ?? object.components.button?.opacity ?? object.components.groupElement?.opacity ?? object.components.textElement?.opacity ?? object.components.imageElement?.opacity ?? 1;
    const activeCameraEntity = () => ui.cameraSelect.value === 'editor' ? runtime.editorCamera : (runtime.entities.get(ui.cameraSelect.value) || runtime.editorCamera);
    const syncOverview = () => {
        ui.projectChip.textContent = `${state.project.scene.name} · ${getObjects().length} 个对象 · ${state.paths.snapshotName}${state.dirty ? ' · 未保存' : ''}`;
        ui.cameraChip.textContent = ui.cameraSelect.selectedOptions[0]?.textContent || '编辑器相机';
    };
    const buildEntity = (object) => {
        const type = typeInfo(object.typeId);
        const entity = new pc.Entity(object.name);
        entity.enabled = object.enabled !== false;
        entity.setPosition(...object.position);
        entity.setEulerAngles(...object.rotation);
        entity.setLocalScale(...object.scale);
        if (type.category === 'camera') {
            entity.addComponent('camera', { clearColor: new pc.Color(0.06, 0.09, 0.13), projection: object.components.camera?.projection === 'orthographic' ? pc.PROJECTION_ORTHOGRAPHIC : pc.PROJECTION_PERSPECTIVE, fov: object.components.camera?.fov || 45, orthoHeight: object.components.camera?.orthoHeight || 6, nearClip: object.components.camera?.nearClip || 0.1, farClip: object.components.camera?.farClip || 1000, priority: object.components.camera?.priority || 0 });
        } else if (type.category === 'light') {
            entity.addComponent('light', { type: object.components.light?.type || 'directional', color: colorToPc(object.components.light?.color || type.color), intensity: object.components.light?.intensity || 1.2, range: object.components.light?.range || 8, innerConeAngle: object.components.light?.innerConeAngle || 25, outerConeAngle: object.components.light?.outerConeAngle || 45, castShadows: object.components.light?.castShadows || false });
        } else {
            entity.addComponent('render', { type: ['box', 'plane', 'sphere', 'capsule', 'cone', 'cylinder'].includes(object.typeId) ? object.typeId : 'box' });
            const material = new pc.StandardMaterial();
            material.diffuse = colorToPc(materialColor(object));
            material.opacity = materialOpacity(object);
            material.blendType = material.opacity < 1 ? pc.BLEND_NORMAL : pc.BLEND_NONE;
            material.update();
            entity.render.material = material;
        }
        runtime.entities.set(object.id, entity);
        runtime.app.root.addChild(entity);
    };
    const refreshEntity = (object) => {
        const entity = runtime.entities.get(object.id);
        if (!entity) return;
        entity.name = object.name;
        entity.enabled = object.enabled !== false;
        entity.setPosition(...object.position);
        entity.setEulerAngles(...object.rotation);
        entity.setLocalScale(...object.scale);
        if (entity.render) {
            const material = entity.render.material || new pc.StandardMaterial();
            material.diffuse = colorToPc(materialColor(object));
            material.opacity = materialOpacity(object);
            material.blendType = material.opacity < 1 ? pc.BLEND_NORMAL : pc.BLEND_NONE;
            material.update();
            entity.render.material = material;
        }
        if (entity.light && object.components.light) {
            entity.light.color = colorToPc(object.components.light.color || typeInfo(object.typeId).color);
            entity.light.intensity = object.components.light.intensity || 1.2;
            entity.light.range = object.components.light.range || 8;
            entity.light.innerConeAngle = object.components.light.innerConeAngle || 25;
            entity.light.outerConeAngle = object.components.light.outerConeAngle || 45;
        }
        if (entity.camera && object.components.camera) {
            entity.camera.enabled = object.components.camera.enabled !== false;
            entity.camera.projection = object.components.camera.projection === 'orthographic' ? pc.PROJECTION_ORTHOGRAPHIC : pc.PROJECTION_PERSPECTIVE;
            entity.camera.fov = object.components.camera.fov || 45;
            entity.camera.orthoHeight = object.components.camera.orthoHeight || 6;
            entity.camera.nearClip = object.components.camera.nearClip || 0.1;
            entity.camera.farClip = object.components.camera.farClip || 1000;
            entity.camera.priority = object.components.camera.priority || 0;
        }
    };
    const persistEditorCameraState = () => {
        if (!state.project?.scene || !runtime.editorCamera) return;
        const p = runtime.editorCamera.getPosition();
        state.project.scene.editorCamera = {
            position: [round2(p?.x || 4.8), round2(p?.y || 3.2), round2(p?.z || 7.2)],
            yaw: round2(runtime.cameraRig.yaw),
            pitch: round2(runtime.cameraRig.pitch)
        };
    };
    const syncEditorCameraTransform = () => {
        runtime.editorCamera?.setEulerAngles(runtime.cameraRig.pitch, runtime.cameraRig.yaw, 0);
        persistEditorCameraState();
    };
    const restoreEditorCamera = () => {
        const saved = state.project.scene.editorCamera || {};
        const pos = saved.position || [4.8, 3.2, 7.2];
        runtime.cameraRig.yaw = Number(saved.yaw ?? -35);
        runtime.cameraRig.pitch = Number(saved.pitch ?? -15);
        runtime.editorCamera?.setPosition(pos[0] || 4.8, pos[1] || 3.2, pos[2] || 7.2);
        syncEditorCameraTransform();
    };
    const saveEditorCamera = () => persistEditorCameraState();
    const syncActiveCamera = () => {
        runtime.editorCamera.enabled = ui.cameraSelect.value === 'editor';
        cameraObjects().forEach((object) => {
            const entity = runtime.entities.get(object.id);
            if (entity?.camera) {
                entity.enabled = object.enabled !== false;
                entity.camera.enabled = ui.cameraSelect.value === object.id && object.components.camera?.enabled !== false && object.enabled !== false;
            }
        });
        syncOverview();
        updateGizmo();
    };
    const rebuildScene = () => {
        runtime.entities.forEach((entity) => entity.destroy());
        runtime.entities.clear();
        getObjects().forEach(buildEntity);
        if (!getObject(state.selectedId)) state.selectedId = getObjects()[0]?.id || '';
        const previous = ui.cameraSelect.value;
        ui.cameraSelect.innerHTML = '<option value="editor">编辑器相机</option>' + cameraObjects().map((object) => `<option value="${esc(object.id)}">${esc(object.name)}</option>`).join('');
        ui.cameraSelect.value = [...ui.cameraSelect.options].some((option) => option.value === previous) ? previous : 'editor';
        syncActiveCamera();
    };
    const renderSceneList = () => {
        const keyword = state.sceneFilter.trim().toLowerCase();
        const objects = keyword ? getObjects().filter((item) => `${item.name} ${item.typeId}`.toLowerCase().includes(keyword)) : getObjects();
        ui.sceneList.innerHTML = objects.length ? objects.map((object) => `<div class="scene-item ${object.id === state.selectedId ? 'selected' : ''}" data-object-id="${esc(object.id)}"><div class="scene-name">${esc(object.name)}</div><div class="scene-meta">${esc(typeInfo(object.typeId).label)}</div></div>`).join('') : '<div class="empty-panel">当前筛选条件下没有对象。</div>';
    };
    const renderAssets = () => {
        ui.assetList.innerHTML = state.project.assets.map((asset) => {
            const script = getScriptByAsset(asset.id);
            return `<article class="asset-card panel-surface ${script ? 'script-asset' : ''}" ${script ? `data-script-asset-id="${esc(asset.id)}"` : ''}><div class="asset-name">${esc(asset.name)}</div><div class="asset-kind">${esc(asset.type)}</div><div class="asset-meta">${esc(asset.description || '')}<br>${esc(asset.path || '')}</div></article>`;
        }).join('');
    };
    const renderInspector = () => {
        const object = getObject(state.selectedId);
        if (!object) { ui.inspectorContent.innerHTML = '<div class="empty-panel">选择一个对象后，这里会显示对象细节与 Gizmos 状态。</div>'; return; }
        const componentEntries = Object.entries(object.components || {}).filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value));
        const renderInput = (path, value, label) => {
            const type = typeof value === 'boolean' ? 'select' : /^#[0-9a-f]{6}$/i.test(String(value || '')) ? 'color' : typeof value === 'number' ? 'number' : 'text';
            if (type === 'select') return `<label class="detail-row"><span>${esc(label)}</span><div class="field-control"><select data-field="${esc(path)}"><option value="true"${value ? ' selected' : ''}>是</option><option value="false"${!value ? ' selected' : ''}>否</option></select></div></label>`;
            return `<label class="detail-row"><span>${esc(label)}</span><div class="field-control"><input type="${type}" ${type === 'number' ? 'step="0.1"' : ''} data-field="${esc(path)}" value="${esc(value)}"></div></label>`;
        };
        ui.inspectorContent.innerHTML = `
            <section class="detail-section">
                <h3>${esc(typeInfo(object.typeId).label)}</h3>
                ${renderInput('enabled', object.enabled, '已启用')}
                ${renderInput('name', object.name, '名称')}
                ${renderInput('tags', (object.tags || []).join(', '), '标签')}
                <div class="detail-row"><span>位置</span><div class="vector-grid">${[0, 1, 2].map((i) => `<input type="number" step="0.1" data-field="position.${i}" value="${round2(object.position[i])}">`).join('')}</div></div>
                <div class="detail-row"><span>旋转度</span><div class="vector-grid">${[0, 1, 2].map((i) => `<input type="number" step="0.1" data-field="rotation.${i}" value="${round2(object.rotation[i])}">`).join('')}</div></div>
                <div class="detail-row"><span>比例</span><div class="vector-grid">${[0, 1, 2].map((i) => `<input type="number" step="0.1" data-field="scale.${i}" value="${round2(object.scale[i])}">`).join('')}</div></div>
                <div class="scene-meta">当前 Gizmo：${esc({ translate: '平移', rotate: '旋转', scale: '缩放' }[state.gizmoMode])}</div>
            </section>
            ${componentEntries.map(([componentKey, component]) => `<section class="detail-section"><h3>${esc(`${COMPONENT_LABELS[componentKey] || componentKey}组件`)}</h3>${Object.entries(component).map(([key, value]) => renderInput(`components.${componentKey}.${key}`, value, FIELD_LABELS[key] || key)).join('')}</section>`).join('')}
        `;
        ui.inspectorContent.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('input', () => {
            const path = input.dataset.field.split('.');
            let target = object;
            while (path.length > 1) target = target[path.shift()];
            let value = input.value;
            if (value === 'true' || value === 'false') value = value === 'true';
            else if (input.type === 'number') value = Number(value || 0);
            if (path[0] === 'tags') value = String(value).split(',').map((item) => item.trim()).filter(Boolean);
            target[path[0]] = value;
            state.dirty = true;
            refreshEntity(object);
            renderSceneList();
            renderInspector();
            syncOverview();
            setStatus(`已修改对象：${object.name}，尚未保存。`);
            updateGizmo();
        }));
    };
    const renderAll = () => { renderSceneList(); renderAssets(); renderInspector(); syncOverview(); };
    const openConfirm = (title, text, handler) => { ui.confirmTitle.textContent = title; ui.confirmText.textContent = text; runtime.confirmHandler = handler; ui.confirmMask.classList.remove('hidden'); };
    const closeConfirm = () => { runtime.confirmHandler = null; ui.confirmMask.classList.add('hidden'); };
    const updateScriptEditorMeta = (script) => {
        ui.scriptEditorMeta.textContent = `${script.description || 'MoonLang 脚本'} | role: ${script.role || 'game'} | path: ${script.path}`;
        ui.scriptEditorRun.disabled = (script.role || 'game') !== 'system';
    };
    const previewScriptCompilation = () => {
        const result = compileScript(ui.scriptEditorSource.value, ui.scriptEditorName.value || ui.scriptEditorTitle.textContent || 'script.moon');
        ui.scriptEditorPreview.textContent = result.code;
        if (!result.ok) {
            ui.scriptEditorOutput.textContent = result.error;
        } else if (ui.scriptEditorOutput.textContent.startsWith('line ')) {
            ui.scriptEditorOutput.textContent = '';
        }
        return result;
    };
    const applyTemplateToEditor = () => {
        const templateKey = ui.scriptEditorTemplate.value || 'game';
        const template = SCRIPT_TEMPLATES[templateKey] || SCRIPT_TEMPLATES.game;
        const fileName = normalizeScriptFileName(ui.scriptEditorName.value || 'script.moon');
        ui.scriptEditorName.value = fileName;
        ui.scriptEditorDescription.value = template.description;
        ui.scriptEditorRole.value = template.role;
        ui.scriptEditorRun.disabled = ui.scriptEditorRole.value !== 'system';
        ui.scriptEditorSource.value = template.createSource(fileName);
        previewScriptCompilation();
    };
    const openScriptEditor = (assetId) => {
        const script = getScriptByAsset(assetId);
        if (!script) return;
        ensurePanel('assets');
        runtime.scriptAssetId = assetId;
        ui.scriptEditorTitle.textContent = script.name;
        ui.scriptEditorName.value = script.name || '';
        ui.scriptEditorDescription.value = script.description || '';
        ui.scriptEditorMeta.textContent = `${script.description} · 角色：${script.role} · 保存项目时会覆盖写入当前项目目录。`;
        ui.scriptEditorRole.value = script.role || 'game';
        ui.scriptEditorTemplate.value = script.role === 'system' ? 'system' : 'game';
        ui.scriptEditorSource.value = script.source || '';
        ui.scriptEditorPreview.textContent = script.compiledJs || '';
        ui.scriptEditorOutput.textContent = '';
        updateScriptEditorMeta(script);
        ui.scriptEditorMask.classList.remove('hidden');
    };
    const applyScriptEditor = () => {
        const script = getScriptByAsset(runtime.scriptAssetId);
        if (!script) return;
        return commitScriptEditor();
        const finalName = makeUniqueScriptName(ui.scriptEditorName.value || script.name, script.id);
        const compilation = previewScriptCompilation();
        script.name = finalName;
        script.path = `scripts/${finalName}`;
        script.description = (ui.scriptEditorDescription.value || 'MoonLang 脚本').trim();
        script.role = ui.scriptEditorRole.value || 'game';
        script.source = ui.scriptEditorSource.value;
        script.compiledJs = compilation.code;
        ui.scriptEditorTitle.textContent = finalName;
        ui.scriptEditorName.value = finalName;
        updateScriptEditorMeta(script);
        rebuildAssets(state.project);
        renderAssets();
        state.dirty = true;
        syncOverview();
        if (/^\/\/ compile failed:/m.test(script.compiledJs || '')) { ensurePanel('console'); pushConsoleBlock(script.compiledJs, 'warn'); setStatus(`脚本编译失败：${script.name}`, true); } else setStatus(`脚本 ${script.name} 已更新，尚未保存。`);
    };
    const runSystemScript = async () => {
        const script = getScriptByAsset(runtime.scriptAssetId);
        if (!script || (ui.scriptEditorRole.value || 'game') !== 'system') return;
        ui.scriptEditorOutput.textContent = 'running...';
        const result = await callMoon('executeSystemMoonScript', JSON.stringify({ name: script.name, role: 'system', source: ui.scriptEditorSource.value }));
        ui.scriptEditorOutput.textContent = result?.output || '';
        if (!result?.ok) { ensurePanel('console'); pushConsoleBlock(result?.output || '', 'warn'); setStatus(`系统脚本执行失败：${script.name}`, true); return; }
        pushConsoleBlock(result.output || '', 'info');
        setStatus(`系统脚本执行完成：${script.name}`);
    };
    const closeScriptEditor = () => { runtime.scriptAssetId = ''; ui.scriptEditorMask.classList.add('hidden'); };
    const createMoonScript = () => {
        const index = state.project.scripts.length + 1;
        const template = ui.scriptEditorTemplate?.value || 'game';
        const script = { id: `script-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, name: `script_${index}.moon`, path: `scripts/script_${index}.moon`, role: 'game', description: '新建 MoonLang 脚本', source: 'function start():\n    print("new moon script start")\nend\n\nfunction update(dt):\n    return dt\nend\n', compiledJs: '' };
        try { script.compiledJs = window.SelenforgeMoon ? window.SelenforgeMoon.compileToJs(script.source, { moduleName: script.name }) : ''; } catch (error) { script.compiledJs = `// compile failed: ${error.message || error}`; }
        state.project.scripts.push(script);
        rebuildAssets(state.project);
        state.dirty = true;
        renderAssets();
        syncOverview();
        openScriptEditor(`asset-${script.id}`);
    };
    const saveProject = async () => {
        saveEditorCamera();
        const payload = normalizeProject(state.project);
        payload.meta.updatedAt = new Date().toISOString();
        const result = await callMoon('saveProject', JSON.stringify(payload));
        if (!result?.ok) { ensurePanel('console'); setStatus('保存失败。', true); return; }
        state.project = normalizeProject(result.project || payload);
        state.paths = { ...state.paths, ...(result.paths || {}), projectFile: result.path || state.paths.projectFile };
        state.dirty = false;
        rebuildScene();
        restoreEditorCamera();
        renderAll();
        setStatus(`已覆盖保存到 ${state.paths.snapshotName}`);
        pushConsole(`项目已保存：${state.paths.projectFile}`, 'info');
        showToast(`已保存项目\n${state.paths.projectFile}`);
    };
    const loadProject = async (silent = false) => {
        const result = await callMoon('loadProject', '');
        if (!result?.ok) { setStatus('载入失败。', true); return; }
        state.project = normalizeProject(result.project);
        state.paths = { ...state.paths, ...(result.paths || {}) };
        state.selectedId = getObjects()[0]?.id || '';
        state.dirty = false;
        rebuildScene();
        restoreEditorCamera();
        renderAll();
        if (!silent) { setStatus(`已载入 ${state.paths.snapshotName}`); pushConsole(`项目已载入：${state.paths.projectFile}`, 'info'); }
    };
    const openBuildDialog = () => { ui.buildMask.classList.remove('hidden'); $('build-output').textContent = ''; };
    const closeBuildDialog = () => { ui.buildMask.classList.add('hidden'); };
    const buildGame = async () => {
        if (state.dirty) { $('build-output').textContent = '检测到未保存改动，正在先覆盖保存当前项目目录...\n'; await saveProject(); }
        const result = await callMoon('buildGame', JSON.stringify({ gameName: ui.buildGameName.value || 'SelenforgeGame', companyName: ui.buildCompanyName.value || 'Selenforge', version: ui.buildVersion.value || '0.1.0', width: Number(ui.buildWidth.value || 1280), height: Number(ui.buildHeight.value || 720) }));
        if (!result?.ok) { ensurePanel('console'); $('build-output').textContent = result?.log || 'build failed'; pushConsoleBlock(result?.log || 'build failed', 'warn'); setStatus('构建失败。', true); return; }
        $('build-output').textContent = `${result.log || ''}\n\noutputDir: ${result.outputDir}\nexePath: ${result.exePath}`;
        pushConsoleBlock(result.log || '', 'info');
        setStatus(`构建完成：${result.outputDir}`);
    };
    const commitScriptEditor = () => {
        const script = getScriptByAsset(runtime.scriptAssetId);
        if (!script) return;
        const finalName = makeUniqueScriptName(ui.scriptEditorName.value || script.name, script.id);
        const compilation = previewScriptCompilation();
        script.name = finalName;
        script.path = `scripts/${finalName}`;
        script.description = (ui.scriptEditorDescription.value || 'MoonLang 脚本').trim();
        script.role = ui.scriptEditorRole.value || 'game';
        script.source = ui.scriptEditorSource.value;
        script.compiledJs = compilation.code;
        ui.scriptEditorTitle.textContent = finalName;
        ui.scriptEditorName.value = finalName;
        updateScriptEditorMeta(script);
        rebuildAssets(state.project);
        renderAssets();
        state.dirty = true;
        syncOverview();
        if (!compilation.ok) {
            ensurePanel('console');
            pushConsoleBlock(compilation.error, 'warn');
            setStatus(`脚本编译失败: ${script.name}`, true);
            return;
        }
        setStatus(`脚本已更新: ${script.name}`);
    };
    const duplicateScriptFromEditor = () => {
        const script = getScriptByAsset(runtime.scriptAssetId);
        if (!script) return;
        const duplicate = createScriptRecord({
            name: script.name.replace(/\.moon$/i, '_copy.moon'),
            role: script.role,
            description: `${script.description || 'MoonLang 脚本'} copy`,
            template: script.role === 'system' ? 'system' : 'game'
        });
        duplicate.source = script.source;
        duplicate.compiledJs = compileScript(duplicate.source, duplicate.name).code;
        state.project.scripts.push(duplicate);
        rebuildAssets(state.project);
        renderAssets();
        state.dirty = true;
        syncOverview();
        openScriptEditor(`asset-${duplicate.id}`);
        setStatus(`已复制脚本: ${duplicate.name}`);
    };
    const deleteScriptFromEditor = () => {
        const script = getScriptByAsset(runtime.scriptAssetId);
        if (!script) return;
        openConfirm('删除脚本', `确认删除 ${script.name} 吗？`, () => {
            state.project.scripts = state.project.scripts.filter((item) => item.id !== script.id);
            rebuildAssets(state.project);
            renderAssets();
            state.dirty = true;
            syncOverview();
            closeScriptEditor();
            closeConfirm();
            setStatus(`已删除脚本: ${script.name}`);
        });
    };
    const screenPos = (world, space = 'local') => {
        const point = activeCameraEntity()?.camera?.worldToScreen(world);
        if (!point || point.z < 0) return null;
        if (space === 'client') {
            const rect = viewportRect();
            return { x: rect.left + point.x, y: rect.top + point.y, z: point.z };
        }
        return { x: point.x, y: point.y, z: point.z };
    };
    const getEntityAxes = (entity) => {
        const transform = entity.getWorldTransform();
        return {
            x: transform.getX(new pc.Vec3()).normalize(),
            y: transform.getY(new pc.Vec3()).normalize(),
            z: transform.getZ(new pc.Vec3()).normalize()
        };
    };
    const getSelectionExtents = (object, entity) => {
        const type = typeInfo(object.typeId);
        const maxScale = Math.max(...object.scale.map((value) => Math.max(0.35, Math.abs(Number(value) || 0))));
        if (type.category === 'camera') return [0.8, 0.6, 1.2];
        if (type.category === 'light') return type.id === 'directional-light' ? [0.8, 0.8, 1.3] : [0.6, 0.6, 0.6];
        if (type.category === 'screen') return [Math.max(0.9, maxScale * 0.8), Math.max(0.6, maxScale * 0.45), 0.15];
        if (entity.render?.aabb) return [0, 0, 0];
        return [Math.max(0.45, maxScale * 0.6), Math.max(0.45, maxScale * 0.6), Math.max(0.45, maxScale * 0.6)];
    };
    const getProjectedBoundsFromPoints = (points) => {
        if (!points.length) return null;
        const xs = points.map((point) => point.x);
        const ys = points.map((point) => point.y);
        const zs = points.map((point) => point.z);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
            centerX: (Math.min(...xs) + Math.max(...xs)) / 2,
            centerY: (Math.min(...ys) + Math.max(...ys)) / 2,
            depth: Math.min(...zs)
        };
    };
    const getEntityScreenBounds = (entity, object, space = 'local') => {
        if (!entity) return null;
        const projected = [];

        const aabb = entity.render?.aabb || null;
        if (aabb) {
            const c = aabb.center;
            const h = aabb.halfExtents;

            [-1, 1].forEach((sx) => {
                [-1, 1].forEach((sy) => {
                    [-1, 1].forEach((sz) => {
                        const point = screenPos(new pc.Vec3(c.x + h.x * sx, c.y + h.y * sy, c.z + h.z * sz), space);
                        if (point) projected.push(point);
                    });
                });
            });
        }

        const origin = entity.getPosition();
        const originPoint = screenPos(origin, space);
        if (!originPoint) return null;
        projected.push(originPoint);

        const [extentX, extentY, extentZ] = getSelectionExtents(object, entity);
        if (extentX || extentY || extentZ) {
            const axes = getEntityAxes(entity);
            [-1, 1].forEach((sx) => {
                [-1, 1].forEach((sy) => {
                    [-1, 1].forEach((sz) => {
                        const sample = origin.clone()
                            .add(axes.x.clone().mulScalar(extentX * sx))
                            .add(axes.y.clone().mulScalar(extentY * sy))
                            .add(axes.z.clone().mulScalar(extentZ * sz));
                        const point = screenPos(sample, space);
                        if (point) projected.push(point);
                    });
                });
            });
        }

        const bounds = getProjectedBoundsFromPoints(projected);
        if (!bounds) return null;
        const minSize = 26;
        if ((bounds.maxX - bounds.minX) < minSize) {
            const half = minSize / 2;
            bounds.minX = bounds.centerX - half;
            bounds.maxX = bounds.centerX + half;
        }
        if ((bounds.maxY - bounds.minY) < minSize) {
            const half = minSize / 2;
            bounds.minY = bounds.centerY - half;
            bounds.maxY = bounds.centerY + half;
        }
        return bounds;
    };
    const getGizmoAxisInfo = (entity, axis, space = 'local') => {
        const origin = screenPos(entity.getPosition(), space);
        if (!origin) return null;
        const object = getObject(state.selectedId);
        const axes = getEntityAxes(entity);
        const axisWorld = axes[axis];
        const activeCamera = activeCameraEntity();
        const cameraDistance = activeCamera ? activeCamera.getPosition().distance(entity.getPosition()) : 6;
        const scaleHint = object ? Math.max(...object.scale.map((value) => Math.max(0.3, Math.abs(Number(value) || 0)))) : 1;
        const worldLength = Math.max(1.15, scaleHint * 0.8, cameraDistance * 0.18);
        const target = screenPos(entity.getPosition().clone().add(axisWorld.clone().mulScalar(worldLength)), space);
        if (!target) return null;
        const dx = target.x - origin.x;
        const dy = target.y - origin.y;
        const screenLength = Math.max(1, Math.hypot(dx, dy));
        return {
            origin,
            target,
            worldDir: axisWorld.clone(),
            worldLength,
            screenDir: { x: dx / screenLength, y: dy / screenLength },
            screenLength
        };
    };
    const createGizmo = () => {
        const root = document.createElement('div');
        root.style.position = 'absolute';
        root.style.inset = '0';
        root.style.pointerEvents = 'none';
        root.style.zIndex = '14';
        ui.canvas.parentElement.appendChild(root);
        runtime.gizmo.root = root;
        ['x', 'y', 'z'].forEach((axis) => {
            const line = document.createElement('div');
            line.style.position = 'absolute';
            line.style.height = '2px';
            line.style.transformOrigin = '0 50%';
            line.style.background = axis === 'x' ? '#ff6b6b' : axis === 'y' ? '#6bff95' : '#6bb9ff';
            root.appendChild(line);
            runtime.gizmo.lines[axis] = line;
            const handle = document.createElement('button');
            handle.type = 'button';
            handle.dataset.axis = axis;
            handle.style.position = 'absolute';
            handle.style.pointerEvents = 'auto';
            handle.style.background = axis === 'x' ? 'rgba(255,107,107,.92)' : axis === 'y' ? 'rgba(107,255,149,.92)' : 'rgba(107,185,255,.92)';
            handle.style.color = '#08111a';
            handle.style.border = '1px solid rgba(255,255,255,.35)';
            handle.style.fontWeight = '700';
            handle.textContent = axis.toUpperCase();
            root.appendChild(handle);
            runtime.gizmo.handles[axis] = handle;
        });
    };
    const updateGizmo = () => {
        if (!runtime.gizmo.root) return;
        const entity = runtime.entities.get(state.selectedId);
        if (!entity) { runtime.gizmo.root.style.display = 'none'; return; }
        runtime.gizmo.root.style.display = 'block';
        ['x', 'y', 'z'].forEach((axis) => {
            const gizmoAxis = getGizmoAxisInfo(entity, axis, 'local');
            const line = runtime.gizmo.lines[axis];
            const handle = runtime.gizmo.handles[axis];
            if (!gizmoAxis) {
                line.style.display = 'none';
                handle.style.display = 'none';
                return;
            }
            line.style.display = 'block';
            handle.style.display = 'block';
            line.style.left = `${gizmoAxis.origin.x}px`;
            line.style.top = `${gizmoAxis.origin.y}px`;
            line.style.width = `${Math.max(30, gizmoAxis.screenLength)}px`;
            line.style.transform = `rotate(${Math.atan2(gizmoAxis.target.y - gizmoAxis.origin.y, gizmoAxis.target.x - gizmoAxis.origin.x) * 180 / Math.PI}deg)`;
            handle.style.borderRadius = state.gizmoMode === 'scale' ? '6px' : '999px';
            handle.style.width = state.gizmoMode === 'rotate' ? '28px' : '22px';
            handle.style.height = state.gizmoMode === 'rotate' ? '28px' : '22px';
            handle.style.left = `${gizmoAxis.target.x - (state.gizmoMode === 'rotate' ? 14 : 11)}px`;
            handle.style.top = `${gizmoAxis.target.y - (state.gizmoMode === 'rotate' ? 14 : 11)}px`;
        });
    };
    const selectObject = (id) => { state.selectedId = id || ''; ensurePanel('scene'); ensurePanel('inspector'); renderSceneList(); renderInspector(); updateGizmo(); };
    const pickObject = (clientX, clientY) => {
        let best = null;
        getObjects().forEach((object) => {
            const bounds = getEntityScreenBounds(runtime.entities.get(object.id), object, 'client');
            if (!bounds) return;

            const hitPadding = 12;
            const inside = clientX >= bounds.minX - hitPadding &&
                clientX <= bounds.maxX + hitPadding &&
                clientY >= bounds.minY - hitPadding &&
                clientY <= bounds.maxY + hitPadding;
            if (!inside) return;

            const centerDist = Math.hypot(bounds.centerX - clientX, bounds.centerY - clientY);
            const area = Math.max(1, (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY));
            const score = centerDist + Math.min(area, 40000) * 0.0005 + (bounds.depth || 0) * 24;
            if (!best || score < best.score) best = { id: object.id, score };
        });
        return best?.id || null;
    };
    const openCreateMenu = (x, y) => {
        ui.sceneContextMenu.innerHTML = TYPES.map(([typeId, label]) => `<button class="context-item" type="button" data-context-create="${esc(typeId)}"><span class="context-item-label">${esc(label)}</span><span class="context-item-desc">在当前场景中创建 ${esc(label)}</span></button>`).join('');
        ui.sceneContextMenu.style.left = `${x}px`;
        ui.sceneContextMenu.style.top = `${y}px`;
        ui.sceneContextMenu.classList.add('open');
    };
    const bindEvents = () => {
        document.addEventListener('contextmenu', (event) => safeRun('右键菜单处理', () => event.preventDefault()));
        document.querySelectorAll('[data-toggle-panel]').forEach((button) => button.addEventListener('click', () => safeRun('面板切换', () => { runtime.panels[button.dataset.togglePanel] = !runtime.panels[button.dataset.togglePanel]; syncPanels(); })));
        document.querySelectorAll('[data-close-panel]').forEach((button) => button.addEventListener('click', () => safeRun('面板关闭', () => { runtime.panels[button.dataset.closePanel] = false; syncPanels(); })));
        document.querySelectorAll('[data-gizmo-mode]').forEach((button) => button.addEventListener('click', () => safeRun('Gizmo 模式切换', () => { state.gizmoMode = button.dataset.gizmoMode; document.querySelectorAll('[data-gizmo-mode]').forEach((item) => item.classList.toggle('active', item.dataset.gizmoMode === state.gizmoMode)); renderInspector(); updateGizmo(); })));
        document.querySelector('[data-gizmo-mode="translate"]')?.classList.add('active');
        ui.sceneFilter.addEventListener('input', () => safeRun('场景筛选', () => { state.sceneFilter = ui.sceneFilter.value || ''; renderSceneList(); }));
        ui.sceneAddButton.addEventListener('click', (event) => safeRun('打开创建菜单', () => { const rect = event.currentTarget.getBoundingClientRect(); openCreateMenu(rect.left, rect.bottom + 6); }));
        ui.panels.scene.addEventListener('contextmenu', (event) => safeRun('场景创建菜单', () => openCreateMenu(event.clientX, event.clientY)));
        ui.sceneDeleteButton.addEventListener('click', () => safeRun('删除对象', () => { const object = getObject(state.selectedId); if (object) openConfirm('删除游戏对象', `确认删除“${object.name}”吗？`, () => { state.project.scene.objects = getObjects().filter((item) => item.id !== object.id); state.selectedId = getObjects()[0]?.id || ''; state.dirty = true; rebuildScene(); renderAll(); closeConfirm(); }); }));
        ui.assetCreateScriptButton.addEventListener('click', () => safeRun('创建脚本', createMoonScript));
        ui.saveProjectButton.addEventListener('click', () => safeRun('保存项目', () => saveProject()));
        ui.loadProjectButton.addEventListener('click', () => safeRun('载入项目', () => (!state.dirty ? loadProject() : openConfirm('载入当前项目', '当前有未保存改动，载入将丢失这些修改。确认继续吗？', () => { closeConfirm(); loadProject(); }))));
        ui.buildGameButton.addEventListener('click', () => safeRun('打开构建面板', openBuildDialog));
        ui.confirmCancel.addEventListener('click', () => safeRun('取消确认', closeConfirm));
        ui.confirmOk.addEventListener('click', () => safeRun('确认操作', () => typeof runtime.confirmHandler === 'function' && runtime.confirmHandler()));
        ui.cameraSelect.addEventListener('change', () => safeRun('切换相机', syncActiveCamera));
        ui.scriptEditorApply.addEventListener('click', () => safeRun('应用脚本编辑', applyScriptEditor));
        ui.scriptEditorRun.addEventListener('click', () => safeRun('运行系统脚本', () => runSystemScript()));
        ui.scriptEditorClose.addEventListener('click', () => safeRun('关闭脚本编辑器', closeScriptEditor));
        ui.scriptEditorRole.addEventListener('change', () => safeRun('切换脚本角色', () => { ui.scriptEditorRun.disabled = ui.scriptEditorRole.value !== 'system'; }));
        ui.scriptEditorSource.addEventListener('input', () => safeRun('脚本预览编译', () => { try { ui.scriptEditorPreview.textContent = window.SelenforgeMoon ? window.SelenforgeMoon.compileToJs(ui.scriptEditorSource.value, { moduleName: ui.scriptEditorTitle.textContent }) : ''; } catch (error) { ui.scriptEditorPreview.textContent = `// compile failed: ${error.message || error}`; } }));
        ui.buildStart.addEventListener('click', () => safeRun('构建游戏', () => buildGame()));
        ui.buildClose.addEventListener('click', () => safeRun('关闭构建面板', closeBuildDialog));
        document.addEventListener('click', (event) => safeRun('全局点击处理', () => {
            const target = eventElement(event);
            if (!target) return;
            const objectNode = target.closest('[data-object-id]');
            if (objectNode) return selectObject(objectNode.dataset.objectId);
            const assetNode = target.closest('[data-script-asset-id]');
            if (assetNode) return openScriptEditor(assetNode.dataset.scriptAssetId);
            const createNode = target.closest('[data-context-create]');
            if (createNode) { getObjects().push(makeObject(createNode.dataset.contextCreate)); selectObject(getObjects()[getObjects().length - 1].id); state.dirty = true; rebuildScene(); renderAll(); ui.sceneContextMenu.classList.remove('open'); return; }
            if (!target.closest('#scene-context-menu')) ui.sceneContextMenu.classList.remove('open');
        }));
        ui.canvas.addEventListener('mousedown', (event) => safeRun('视口鼠标按下', () => {
            if (event.button === 0) {
                const id = pickObject(event.clientX, event.clientY);
                if (id) selectObject(id);
            }
            if (event.button === 2) {
                if (ui.cameraSelect.value !== 'editor') {
                    ui.cameraSelect.value = 'editor';
                    syncActiveCamera();
                }
                runtime.cameraRig.dragging = true;
            }
        }));
        window.addEventListener('mousemove', (event) => safeRun('鼠标移动', () => {
            if (runtime.gizmo.drag) {
                const object = getObject(state.selectedId);
                const idx = runtime.gizmo.drag.axis === 'x' ? 0 : runtime.gizmo.drag.axis === 'y' ? 1 : 2;
                const dx = event.clientX - runtime.gizmo.drag.x;
                const dy = event.clientY - runtime.gizmo.drag.y;
                const projectedDelta = dx * runtime.gizmo.drag.screenDir.x + dy * runtime.gizmo.drag.screenDir.y;
                if (state.gizmoMode === 'translate') {
                    object.position = runtime.gizmo.drag.base.map((value, index) => round2(value + runtime.gizmo.drag.worldDir[index] * projectedDelta * runtime.gizmo.drag.translateUnitsPerPixel));
                }
                if (state.gizmoMode === 'rotate') object.rotation[idx] = round2(runtime.gizmo.drag.base[idx] + projectedDelta * 0.45);
                if (state.gizmoMode === 'scale') object.scale[idx] = round2(Math.max(0.1, runtime.gizmo.drag.base[idx] + projectedDelta * 0.01));
                state.dirty = true;
                refreshEntity(object);
                renderInspector();
                renderSceneList();
                syncOverview();
                updateGizmo();
                return;
            }
            if (!runtime.cameraRig.dragging || ui.cameraSelect.value !== 'editor') return;
            runtime.cameraRig.yaw -= event.movementX * 0.18;
            runtime.cameraRig.pitch = Math.max(-89, Math.min(89, runtime.cameraRig.pitch - event.movementY * 0.18));
            syncEditorCameraTransform();
            updateGizmo();
        }));
        window.addEventListener('mouseup', (event) => safeRun('鼠标释放', () => { if (event.button === 2) runtime.cameraRig.dragging = false; runtime.gizmo.drag = null; }));
        Object.values(runtime.gizmo.handles).forEach((handle) => handle.addEventListener('mousedown', (event) => safeRun('Gizmo 拖拽开始', () => {
            event.preventDefault();
            const object = getObject(state.selectedId);
            const entity = runtime.entities.get(state.selectedId);
            const gizmoAxis = entity ? getGizmoAxisInfo(entity, handle.dataset.axis, 'client') : null;
            if (!object || !gizmoAxis) return;
            runtime.gizmo.drag = {
                x: event.clientX,
                y: event.clientY,
                axis: handle.dataset.axis,
                base: state.gizmoMode === 'translate' ? [...object.position] : state.gizmoMode === 'rotate' ? [...object.rotation] : [...object.scale],
                worldDir: [gizmoAxis.worldDir.x, gizmoAxis.worldDir.y, gizmoAxis.worldDir.z],
                screenDir: gizmoAxis.screenDir,
                translateUnitsPerPixel: Math.min(0.25, Math.max(0.003, gizmoAxis.worldLength / Math.max(gizmoAxis.screenLength, 18)))
            };
        })));
        const moveState = (code, active) => {
            if (code === 'KeyW') runtime.cameraRig.move.forward = active ? -1 : (runtime.cameraRig.move.forward === -1 ? 0 : runtime.cameraRig.move.forward);
            if (code === 'KeyS') runtime.cameraRig.move.forward = active ? 1 : (runtime.cameraRig.move.forward === 1 ? 0 : runtime.cameraRig.move.forward);
            if (code === 'KeyA') runtime.cameraRig.move.right = active ? -1 : (runtime.cameraRig.move.right === -1 ? 0 : runtime.cameraRig.move.right);
            if (code === 'KeyD') runtime.cameraRig.move.right = active ? 1 : (runtime.cameraRig.move.right === 1 ? 0 : runtime.cameraRig.move.right);
            if (code === 'KeyQ') runtime.cameraRig.move.up = active ? -1 : (runtime.cameraRig.move.up === -1 ? 0 : runtime.cameraRig.move.up);
            if (code === 'KeyE') runtime.cameraRig.move.up = active ? 1 : (runtime.cameraRig.move.up === 1 ? 0 : runtime.cameraRig.move.up);
        };
        window.addEventListener('keydown', (event) => safeRun('键盘按下', () => { if (event.ctrlKey && event.code === 'KeyS') { event.preventDefault(); saveProject(); } if (event.ctrlKey && event.code === 'KeyO') { event.preventDefault(); ui.loadProjectButton.click(); } if (event.code === 'Delete' && getObject(state.selectedId)) ui.sceneDeleteButton.click(); moveState(event.code, true); }));
        window.addEventListener('keyup', (event) => safeRun('键盘释放', () => moveState(event.code, false)));
        window.addEventListener('blur', () => safeRun('窗口失焦', () => { runtime.cameraRig.dragging = false; runtime.gizmo.drag = null; runtime.cameraRig.move = { forward: 0, right: 0, up: 0 }; }));
    };
    const bindScriptEditorEnhancements = () => {
        ui.scriptEditorTemplateApply?.addEventListener('click', () => safeRun('套用脚本模板', applyTemplateToEditor));
        ui.scriptEditorDuplicate?.addEventListener('click', () => safeRun('复制脚本', duplicateScriptFromEditor));
        ui.scriptEditorDelete?.addEventListener('click', () => safeRun('删除脚本', deleteScriptFromEditor));
        ui.scriptEditorName?.addEventListener('input', () => safeRun('脚本名称预览', previewScriptCompilation));
        ui.scriptEditorDescription?.addEventListener('input', () => safeRun('脚本描述更新', () => {
            const script = getScriptByAsset(runtime.scriptAssetId);
            if (script) {
                updateScriptEditorMeta({ ...script, description: ui.scriptEditorDescription.value || script.description });
            }
        }));
        ui.scriptEditorSource?.addEventListener('input', () => safeRun('脚本预览编译增强', previewScriptCompilation));
    };
    const initEngine = () => {
        runtime.app = new pc.Application(ui.canvas);
        runtime.app.start();
        runtime.app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        runtime.app.setCanvasResolution(pc.RESOLUTION_AUTO);
        runtime.app.scene.ambientLight = new pc.Color(0.18, 0.2, 0.24);
        runtime.editorCamera = new pc.Entity('EditorCamera');
        runtime.editorCamera.addComponent('camera', { clearColor: new pc.Color(0.06, 0.09, 0.13), fov: 45, nearClip: 0.1, farClip: 1000 });
        runtime.editorCamera.setPosition(4.8, 3.2, 7.2);
        runtime.app.root.addChild(runtime.editorCamera);
        createGizmo();
        runtime.app.on('update', (dt) => safeRun('引擎更新', () => {
            if (ui.cameraSelect.value !== 'editor' || !runtime.cameraRig.dragging) return;
            const m = runtime.cameraRig.move;
            if (!m.forward && !m.right && !m.up) return;
            runtime.editorCamera.translateLocal(m.right * 6 * dt, m.up * 6 * dt, m.forward * 6 * dt);
            persistEditorCameraState();
            updateGizmo();
        }));
        window.addEventListener('resize', () => safeRun('窗口缩放', () => { runtime.app.resizeCanvas(); updateGizmo(); }));
        runtime.app.resizeCanvas();
    };
    const boot = async () => {
        setStatus('正在连接 Selenforge 工作区...');
        const info = await callMoon('buildInfo', '');
        if (info?.paths) state.paths = { ...state.paths, ...info.paths };
        initEngine();
        bindEvents();
        bindScriptEditorEnhancements();
        syncPanels();
        await loadProject(true);
        setStatus(`已载入 ${state.paths.snapshotName}`);
        pushConsole(`Selenforge 已就绪，当前快照：${state.paths.snapshotName}`, 'info');
        showToast(`Selenforge 已就绪\n${state.paths.projectFile}`);
    };
    window.addEventListener('error', (event) => {
        const message = event?.error?.stack || event?.message || '未知脚本错误';
        setStatus(`脚本异常：${message}`, true);
        pushConsole(`脚本异常：${message}`, 'warn');
    });
    window.addEventListener('unhandledrejection', (event) => {
        const reason = event?.reason?.stack || event?.reason?.message || String(event?.reason || '未知 Promise 错误');
        setStatus(`异步异常：${reason}`, true);
        pushConsole(`异步异常：${reason}`, 'warn');
    });
    boot().catch((error) => {
        const message = error?.message || String(error);
        setStatus(`启动失败：${message}`, true);
        pushConsole(`启动失败：${message}`, 'warn');
    });
})();
