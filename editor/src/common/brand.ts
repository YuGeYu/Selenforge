export const BRAND_LABELS = {
    engine: 'Selenforge',
    renderer: 'Moonflare',
    editor: 'StarAnvil'
} as const;

export const BRAND_LINKS = {
    website: '',
    manual: '',
    tutorials: '',
    apiReference: '',
    forum: '',
    issues: '',
    releaseNotes: '',
    discord: ''
} as const;

const BLOCKED_URL_PATTERNS = [
    /playcanvas\.com/i,
    /playcanv\.as/i,
    /forum\.playcanvas\.com/i,
    /developer\.playcanvas\.com/i,
    /api\.playcanvas\.com/i,
    /github\.com\/playcanvas/i,
    /discord\.gg\/RSaMRzg/i
];

export const sanitizeBrandUrl = (url?: string) => {
    if (!url) {
        return '';
    }

    const value = url.trim();
    if (!value) {
        return '';
    }

    for (const pattern of BLOCKED_URL_PATTERNS) {
        if (pattern.test(value)) {
            return '';
        }
    }

    if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
        return value;
    }

    return '';
};

const reportMissingLink = (label: string) => {
    const message = `${label} 链接尚未配置。请按根 README.md 的品牌占位说明补全。`;

    if (typeof editor !== 'undefined' && editor?.call) {
        try {
            editor.call('status:text', message);
            return;
        } catch (err) {
            console.warn(message, err);
        }
    }

    console.warn(message);
};

export const openBrandLink = (url: string | undefined, label: string, target = '_blank') => {
    const safeUrl = sanitizeBrandUrl(url);
    if (!safeUrl) {
        reportMissingLink(label);
        return false;
    }

    if (target === '_blank') {
        window.open(safeUrl, target, 'noopener,noreferrer');
    } else {
        window.open(safeUrl, target);
    }

    return true;
};
