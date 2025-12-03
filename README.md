# Welcome to the ifaceX App 👋

This mobile app is optional for customers who want to use an app that connects to the ifaceX platform for monitoring interface processors. It is not intended to be built by the customer, but will be passed on to the stores (Apple & Google Play) if there is a need for such an app.

See [ifaceX Platform](https://products.autumo.ch/ifacex/overview).

## iOS & Android
Android | iOS
:--------:|:--------:
![](https://raw.githubusercontent.com/autumoswitzerland/ifaceX-App/master/assets/doc/a1.png) | ![](https://raw.githubusercontent.com/autumoswitzerland/ifaceX-App/master/assets/doc/i1.png)
![](https://raw.githubusercontent.com/autumoswitzerland/ifaceX-App/master/assets/doc/a2.png) | ![](https://raw.githubusercontent.com/autumoswitzerland/ifaceX-App/master/assets/doc/i2.png)

## Get started (Development)

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   This project has been migrated to the Expo Bare / Prebuild workflow. Because of this, the classic development workflow using `npx expo start` with Expo Go no longer works. Expo Go can only run pure managed projects that rely exclusively on the modules bundled inside the Expo Go client.
   
   To run the app locally, use:

   ```bash
   npx expo run:android
   ```
   or
   ```bash
   npx expo run:ios
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
