import { Button, Container, Label, Overlay } from '@playcanvas/pcui';

import { config } from '@/editor/config';

// When loading the Tutorial Rolling Ball project for the first time,
// show a splash screen with some simple instructions
editor.once('load', () => {
    if (editor.call('users:hasOpenedEditor')) {
        return;
    }

    if (config.project.name !== 'My First Project') {
        return;
    }

    // do not show if not owner
    if (config.owner.id !== config.self.id) {
        return;
    }

    const root = editor.call('layout.root');

    // overlay
    const overlay = new Overlay({
        class: 'demo',
        clickable: true,
        hidden: true
    });
    root.append(overlay);

    // container
    const container = new Container();
    overlay.append(container);

    // contents
    const header = new Label({
        class: 'header',
        text: 'Editor Intro'
    });
    container.append(header);

    const main = new Label({
        class: 'main',
        text: '为了帮助你熟悉 StarAnvil，我们准备了第一个示例项目。它是一个简单的滚球关卡，你可以继续补充平台、调整布局，并在这个基础上搭建自己的 Selenforge 场景。<br><br>后续界面会继续给出一些基础提示。',
        unsafe: true
    });
    container.append(main);

    const close = new Button({
        class: 'close',
        text: 'LET\'S GO'
    });
    container.append(close);
    close.on('click', () => {
        overlay.hidden = true;
    });

    editor.once('scene:raw', () => {
        overlay.hidden = false;
    });

    overlay.on('show', () => {
        editor.emit('help:demo:show');
    });

    overlay.on('hide', () => {
        editor.emit('help:demo:close');
    });
});
