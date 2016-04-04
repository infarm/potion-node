# Potion

[![Build Status](https://travis-ci.org/biosustain/potion-node.svg?branch=master)](https://travis-ci.org/biosustain/potion-node)

> A TypeScript client for APIs written in Flask-Potion.

### Installation
----------------
```shell
$(node bin)/jspm install potion
```


### Usage
---------
TODO - add usage docs.


### Contributing
----------------
Clone the repository `git clone https://github.com/biosustain/potion-node`, install all the deps (`npm install`, `$(npm bin)/typings install`, `$(npm bin)/jspm install`) and start hacking.
Make sure that the builds and tests will run successfully, before you make a pull request. Follow the next steps:
- use `npm run build` to build the `.ts` files and see if any errors have occurred;
- run the tests using `npm test` (*if you wish to run tests on file change, use `$(npm bin)/karma start karma.config.js`.*);
- lint the code with `npm run lint`.

**Note**: If you add new files or remove files, make sure to edit the `"files"` field in `tsconfig.json`:
```js
"files": [
    // these files will always stay here
	"node_modules/typescript/lib/lib.es6.d.ts",
	"typings/main.d.ts",
	// you can change the bellow as you wish
	"src/angularjs.ts",
	"src/fetch.ts",
	"src/base.ts",
	"src/utils.ts"
]
```
