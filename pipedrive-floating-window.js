import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

(async function() {
    const sdk = await new AppExtensionsSDK().initialize();

    const desiredWidth = 600;
    const desiredHeight = 400;

    await sdk.execute('showFloatingWindow', {
        message: 'Action completed',
        context: {
            url: 'https://iridescent-jagged-magic.glitch.me/callback',
            width: desiredWidth,
            height: desiredHeight
        }
    });

    sdk.listen('VISIBILITY', ({ data }) => {
        if (data.is_visible) {
            console.log('Floating window is visible');
        } else {
            console.log('Floating window is hidden');
        }
    });
})();
