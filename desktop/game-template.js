(function () {
    const payload = __SELENFORGE_PAYLOAD__;
    const project = payload.project || {};
    const canvas = document.getElementById('app');
    const app = new pc.Application(canvas);
    app.start();
    app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    app.scene.ambientLight = new pc.Color(0.18, 0.2, 0.24);
    window.addEventListener('resize', () => app.resizeCanvas());
    app.resizeCanvas();

    const makeBuiltins = (runtimeTarget) => ({
        print(...args) {
            const text = args.map((item) => item === null || item === undefined ? 'null' : String(item)).join(' ');
            runtimeTarget.bus.emit('log', { level: 'info', text, args });
            console.log(...args);
            return text;
        },
        type(value) {
            if (value === null || value === undefined) return 'null';
            if (Array.isArray(value)) return 'list';
            if (typeof value === 'object') return 'dict';
            return typeof value;
        },
        str: (value) => value === null || value === undefined ? 'null' : String(value),
        int: (value) => Number.parseInt(value, 10) || 0,
        float: (value) => Number.parseFloat(value) || 0,
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
        pop: (list) => Array.isArray(list) ? list.pop() : null,
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
        join: (list, delimiter) => Array.isArray(list) ? list.join(delimiter ?? '') : '',
        split: (text, delimiter) => String(text ?? '').split(delimiter ?? ''),
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
    });

    const runtime = {
        app,
        bus: {
            listeners: {},
            on(event, handler) {
                this.listeners[event] = this.listeners[event] || [];
                this.listeners[event].push(handler);
            },
            emit(event, payloadValue) {
                (this.listeners[event] || []).forEach((handler) => {
                    try { handler(payloadValue); } catch (error) { console.warn(error); }
                });
            }
        },
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
    window.SelenforgeMoonRuntime = runtime;
    Object.assign(runtime, makeBuiltins(runtime));
    runtime.Scene.findEntity = (name) => app.root.findByName(name);
    runtime.Scene.findByName = runtime.Scene.findEntity;
    runtime.Entity.findByName = (name) => app.root.findByName(name);
    runtime.Transform.rotateY = (entity, delta) => {
        if (!entity) return;
        const angles = entity.getEulerAngles();
        entity.setEulerAngles(angles.x, angles.y + delta, angles.z);
    };
    runtime.Transform.setPosition = (entity, x, y, z) => {
        if (!entity) return;
        entity.setPosition(x, y, z);
    };

    const colorToPc = (hex, alpha = 1) => {
        const safe = /^#[0-9a-f]{6}$/i.test(hex || '') ? hex.slice(1) : 'ffffff';
        return new pc.Color(
            parseInt(safe.slice(0, 2), 16) / 255,
            parseInt(safe.slice(2, 4), 16) / 255,
            parseInt(safe.slice(4, 6), 16) / 255,
            alpha
        );
    };

    const buildEntity = (object) => {
        const entity = new pc.Entity(object.name || object.id || 'Entity');
        entity.enabled = object.enabled !== false;
        entity.setPosition(...(object.position || [0, 0, 0]));
        entity.setEulerAngles(...(object.rotation || [0, 0, 0]));
        entity.setLocalScale(...(object.scale || [1, 1, 1]));
        if (object.typeId === 'perspective') {
            entity.addComponent('camera', {
                clearColor: new pc.Color(0.06, 0.09, 0.13),
                fov: object.components?.camera?.fov || 45,
                nearClip: 0.1,
                farClip: 1000
            });
        } else if (object.typeId === 'directional-light') {
            entity.addComponent('light', {
                type: 'directional',
                color: colorToPc(object.components?.light?.color || '#fff2c2'),
                intensity: object.components?.light?.intensity || 1.5
            });
        } else {
            const renderType = ['box', 'plane', 'sphere', 'capsule', 'cone', 'cylinder'].includes(object.typeId) ? object.typeId : 'box';
            entity.addComponent('render', { type: renderType });
            const material = new pc.StandardMaterial();
            material.diffuse = colorToPc(object.components?.render?.color || '#8ccfff');
            material.opacity = object.components?.render?.opacity ?? 1;
            material.blendType = material.opacity < 1 ? pc.BLEND_NORMAL : pc.BLEND_NONE;
            material.update();
            entity.render.material = material;
        }
        app.root.addChild(entity);
        return entity;
    };

    const objects = Array.isArray(project.scene?.objects) ? project.scene.objects : [];
    let cameraEntity = null;
    objects.forEach((object) => {
        const entity = buildEntity(object);
        if (!cameraEntity && entity.camera) cameraEntity = entity;
    });

    if (!cameraEntity) {
        cameraEntity = new pc.Entity('MainCamera');
        cameraEntity.addComponent('camera', {
            clearColor: new pc.Color(0.06, 0.09, 0.13),
            fov: 45,
            nearClip: 0.1,
            farClip: 1000
        });
        cameraEntity.setPosition(4.8, 3.2, 7.2);
        cameraEntity.setEulerAngles(-15, -35, 0);
        app.root.addChild(cameraEntity);
    }

    const scriptInstances = [];
    (Array.isArray(project.scripts) ? project.scripts : []).forEach((script) => {
        if (script.role && script.role !== 'game') return;
        if (!script.compiledJs) return;
        try {
            const factory = new Function('runtime', `${script.compiledJs}\nreturn { start: typeof start === 'function' ? start : null, update: typeof update === 'function' ? update : null };`);
            scriptInstances.push(factory(runtime));
        } catch (error) {
            console.warn(`[Selenforge] script compile failed: ${script.name}`, error);
        }
    });

    scriptInstances.forEach((instance) => {
        if (typeof instance.start === 'function') {
            try { instance.start(); } catch (error) { console.warn(error); }
        }
    });

    app.on('update', (dt) => {
        scriptInstances.forEach((instance) => {
            if (typeof instance.update === 'function') {
                try { instance.update(dt); } catch (error) { console.warn(error); }
            }
        });
    });
})();
