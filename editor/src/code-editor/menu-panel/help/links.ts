import { MenuItem } from '@playcanvas/pcui';

import { BRAND_LINKS, openBrandLink } from '@/common/brand';

editor.once('load', () => {
    const menu = editor.call('menu:help');

    // API ref
    let item = new MenuItem({
        class: 'no-bottom-border',
        text: 'API Reference',
        onSelect: () => {
            return editor.call('editor:command:openApiReference');
        }
    });
    menu.append(item);

    editor.method('editor:command:openApiReference', () => {
        openBrandLink(BRAND_LINKS.apiReference, 'API Reference');
    });

    // User Manual
    item = new MenuItem({
        class: 'no-bottom-border',
        text: 'User Manual',
        onSelect: () => {
            return editor.call('editor:command:openUserManual');
        }
    });
    menu.append(item);

    editor.method('editor:command:openUserManual', () => {
        openBrandLink(BRAND_LINKS.manual, 'User Manual');
    });

    // Tutorials
    item = new MenuItem({
        class: 'no-bottom-border',
        text: 'Tutorials',
        onSelect: () => {
            return editor.call('editor:command:openTutorials');
        }
    });
    menu.append(item);

    editor.method('editor:command:openTutorials', () => {
        openBrandLink(BRAND_LINKS.tutorials, 'Tutorials');
    });

    // Forum
    item = new MenuItem({
        text: 'Forum',
        onSelect: () => {
            return editor.call('editor:command:openForum');
        }
    });
    menu.append(item);

    editor.method('editor:command:openForum', () => {
        openBrandLink(BRAND_LINKS.forum, 'Forum');
    });

    // VSCode extension
    item = new MenuItem({
        text: 'VS Code Extension',
        onSelect: () => {
            return editor.call('editor:command:openVSCodeExtensionHelp');
        }
    });
    menu.append(item);

    editor.method('editor:command:openVSCodeExtensionHelp', () => {
        openBrandLink(BRAND_LINKS.manual, 'VS Code Extension Help');
    });
});
