import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

(async function() {
    const sdk = await new AppExtensionsSDK().initialize({ size: { height: 950 } });

    // Получаем высоту экрана
    const height = window.innerHeight;

    await sdk.execute('showFloatingWindow', {
        context: {
            url: 'https://iridescent-jagged-magic.glitch.me/callback', // Убедитесь, что URL верный
            title: 'My Cu2323232stom Modal',
            width: "500px", // Устанавливаем ширину равной высоте экрана
            height: "1000px" // Также устанавливаем высоту равной высоте экрана, если нужно
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
