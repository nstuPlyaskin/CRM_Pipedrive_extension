import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

(async function() {
    const sdk = await new AppExtensionsSDK().initialize();

    await sdk.execute('showFloatingWindow', {
        context: {
            url: 'http://localhost:3000/callback' // Убедитесь, что URL верный
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
