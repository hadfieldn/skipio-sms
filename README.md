## Skipio Messaging Application

Simple application that interfaces with the Skipio API to send messages to contacts.

## Installation
1. Install [yarn](https://yarnpkg.com/lang/en/docs/install/).
1. ```yarn install```

## Deployment
#### Development 
1. ```yarn start```

#### Production
1. ```yarn build```
1. Production build will be output to the `build` folder.

#### Deploying to a GitHub project page
1. Make sure the `homepage` property in `package.json` is set to URL of the 
   GitHub project page (`https://<username>github.com/<repo>`).
1. `yarn deploy`  

## About
This project gave me an opportunity to try out a few libraries:
- [GraphQL.js](https://github.com/graphql/graphql-js): 
  reference implementation of GraphQL for javaScript, facilitates front-end
  GraphQL resolvers that wrap REST endpoints.
- [relay-local-schema](https://github.com/relay-tools/relay-local-schema): 
  Allows a front-end GraphQL schema to be used with Relay.
- [Relay Modern](https://facebook.github.io/relay/docs/relay-modern.html): 
  New version of Relay with smaller and faster builds.
- [Semantic UI React](https://react.semantic-ui.com): React port of the
  Semantic UI component library.
   
A few lessons learned:
- Documentation for Relay Modern is incomplete. Fortunately I was able to 
  Google examples as needed.
- Relay Modern does not provide object caching, as the older Relay does. 
  Caching can be implemented with middleware.
- Updating Relay fetch variables seemed a bit buggy. There is a callback 
  function available to the RefetchContainer that is supposed to pass the
  current values used by the query, but I seemed to get the default values 
  instead of the latest values. For the pagination component I made, I 
  found that storing the fetch variables in the React component state,
  rather than querying them from the callback function, worked much more 
  reliably.
- With the bugginess in fetch variables, lack of caching, poor documentation,
  and the need to compile fragments, Relay Modern feels much more clunky
  than the old Relay. Perhaps with more experience I'll feel differently, but
  I think I would be inclined to try [Apollo](http://dev.apollodata.com/).
