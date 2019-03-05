# dojo

## Introduction

Dojo is a web app for D&D (5E) dungeon masters.

It can be used to design monsters and to plan and run combat encounters.

Dojo is written in JS, using React and SCSS. If you would like to contribute to this project, you are welcome to do so; the instructions are below.

## Initial set up

* Open a command line in the root folder
* Run `npm install -g babel-cli`
* Run `npm install babel-preset-env babel-preset-react`
* Run `npm install -g node-sass`
* Run `npm install -g http-server`

## Compiling and running the app

To compile JSX to JS as changes are made:

* Open a command line in the root folder
* Run `babel --presets env,react --watch scripts/jsx --out-file scripts/js/app.js`

To compile SCSS to CSS as changes are made:

* Open a command line in the root folder
* Run `node-sass -w style/scss --output style/css`

To start the web server:

* Open a command line in the root folder
* Run `http-server`
* Open a web browser to `http://localhost:8080`

## Code structure

- resources
  - data
  - fonts
  - icons
  - images
- scripts
  - js
    - react
  - jsx
    - cards
    - controls
    - list-items
    - modals
    - panels
    - screens
- style
  - css
  - scss
