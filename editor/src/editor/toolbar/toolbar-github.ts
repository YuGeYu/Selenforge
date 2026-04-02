import { Button } from '@playcanvas/pcui';

import { BRAND_LINKS, openBrandLink } from '@/common/brand';
import { LegacyTooltip } from '@/common/ui/tooltip';

editor.once('load', () => {
    const toolbar = editor.call('layout.toolbar');

    const button = new Button({
        class: ['pc-icon', 'github', 'bottom', 'push-top'],
        icon: 'E259'
    });
    toolbar.append(button);

    button.on('click', () => {
        openBrandLink(BRAND_LINKS.issues, 'Issue Tracker');
    });

    LegacyTooltip.attach({
        target: button.dom,
        text: 'Open Selenforge issue entry',
        align: 'left',
        root: editor.call('layout.root')
    });
});
