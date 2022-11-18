const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');

const routes = require('./server/routes');

const { typeDefs, resolvers } = require('./server/schemas');
const db = require('./server/config/connection');
const { authMiddleware } = require('./server/utils/auth');


const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware
});
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(routes);

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  // if we're in production, serve client/build as static assets
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
  }
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}🌍`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);