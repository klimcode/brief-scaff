# brief-scaff

A tool for scaffolding.

Creates directories and files based on plain-text config-file.

## Installation

`npm i -g brief-scaff`

## Usage example

This example config contains a name of a blueprint (react), a string to replace (Mockup),
a name of a folder, names of files inside it and their contents.

It's important to keep this nesting structure.

```js
react Mockup
    /src/Mockup
        index.js
          export { default as Mockup } from './Mockup';
          export { default as MockupContainer } from './MockupContainer';
        MockupContainer.js
          import Mockup from './Mockup';
          export default Mockup;
        Mockup.js
          import React, { Component } from 'react';
          export default class Mockup extends Component {
            render() {
              return (
                <div></div>
              )
            }
          }
```

type `brief-scaff react MyComponent` in your current directory and the generator makes directories and files according to the config.
