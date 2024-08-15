import AppExtensionsSDK from '@pipedrive/app-extensions-sdk';

(async function() {
    const sdk = await new AppExtensionsSDK().initialize();

    // Define the desired width and height for the floating window
    const desiredWidth = 600; // Set your desired width in pixels
    const desiredHeight = 400; // Set your desired height in pixels

    await sdk.execute('showFloatingWindow', {
        message: 'Action ZZZZZZ completed',
        context: {
            url: 'https://iridescent-jagged-magic.glitch.me/callback', // Ensure the URL is correct
            width: desiredWidth, // Set the width of the floating window
            height: desiredHeight // Set the height of the floating window
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
