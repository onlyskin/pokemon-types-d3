An interactive visualisation showing damage multipliers between different Pokemon
Types. Hover over a coloured type bubble to see details of the multiplier, click
on a bubble to change the focused type.

Technologies: `TypeScript`, `d3.js`, `mithril.js`

See the visualisation at: http://poketypes.szreter.co.uk/


#### Development:

##### Install:

`yarn`

##### Build, serve, and watch:

`serveit -s out "./build.sh"` –  (`brew install serveit`)

##### Test:
`./test.sh`

#### Deploying:

##### Build:

`./build.sh`

##### Deploy:

To deploy: (requires aws credentials)
`./deploy`
