import { Button } from '@playcanvas/pcui';

import { BRAND_LINKS, openBrandLink } from '@/common/brand';
import { LegacyTooltip } from '@/common/ui/tooltip';

editor.once('load', () => {
    const toolbar = editor.call('layout.toolbar');

    const contact = new Button({
        class: ['pc-icon', 'forum', 'bottom'],
        icon: 'E119'
    });
    toolbar.append(contact);

    LegacyTooltip.attach({
        target: contact.dom,
        text: 'Open Selenforge community entry',
        align: 'left',
        root: editor.call('layout.root')
    });

    contact.on('click', () => {
        openBrandLink(BRAND_LINKS.forum, 'Forum');
    });
});
