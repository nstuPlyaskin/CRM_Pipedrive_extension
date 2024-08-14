import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

(async function() {
    const sdk = await new AppExtensionsSDK().initialize();

    // Получаем высоту экрана
    const height = window.innerHeight;

    await sdk.execute('showFloatingWindow', {
        context: {
            url: 'https://iridescent-jagged-magic.glitch.me/callback', // Убедитесь, что URL верный
            width: height, // Устанавливаем ширину равной высоте экрана
            height: height // Также устанавливаем высоту равной высоте экрана, если нужно
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
