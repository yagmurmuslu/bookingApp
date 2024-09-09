# Booking App
Booking App is a cross-platform application built with Angular and Ionic that allows users to create and book events. The app offers a seamless experience across iOS, Android, and the web by leveraging a single codebase. With responsive design and integration of native device features, users can manage events with ease.

## Features
* User Authentication: Secure user registration and login powered by Firebase Authentication.
* Event Creation & Booking: Users can create events with detailed descriptions and allow others to book available slots.
* Cross-Platform Support: One codebase to deliver a consistent experience on iOS, Android, and the web.
* Camera Integration: Capture and upload images for events using the Capacitor Camera plugin.
* Geolocation: Tag event locations using native geolocation services.
* Responsive UI: Utilizes Ionic's rich component library to ensure a native-like user interface on all devices.
## Technologies Used
* Angular: Framework for building dynamic web applications.
* Ionic Framework: A UI toolkit for building high-quality mobile and web applications.
* Firebase: Provides backend services including Authentication and Firestore for data storage.
* Capacitor: A cross-platform runtime to build web apps that can be deployed natively on iOS, Android, and web platforms.
* TypeScript: A superset of JavaScript that provides static typing.
HTML & SCSS: For building and styling the app interface.
## Installation
Follow these steps to install and run the app locally:

* Clone the repository:

```conf
git clone https://github.com/yagmurmuslu/bookingApp.git
```
* Navigate to the project directory:


```conf
cd bookingApp
```
* Install the necessary dependencies:
```conf
npm install
```
* Run the app in the browser:

```conf
ionic serve
```

## Running on Devices
To test the app on iOS or Android devices:

* For iOS:

```conf
ionic capacitor add ios
ionic capacitor run ios
```
* For Android:

```conf
ionic capacitor add android
ionic capacitor run android
```
## Usage
* Sign Up / Log In: Users can register or sign in using Firebase Authentication.
* Create Events: Enter event details, such as title, description, and date.
* Book Events: View available events and book a slot.
* Event Management: Users can edit or delete their created events.
* View Bookings: See which events are booked and available.