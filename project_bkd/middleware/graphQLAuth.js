// middleware/graphQLAuth.js

const graphQLAuthMiddleware = (req, res, next) => {

  //console.log("Req Body: \n", req.body)

  const token = req.headers['authorization'];
  if (token) {
    //console.log('JWT Token Yes');
  } else {
    console.log('No JWT Token provided');
  }
  next();
  /*
  if (req.path.startsWith('/graphql')) {
      console.log("graphql")
      // Allow access to GraphQL interface without token
      next();
  } else {
      console.log("no graphql")
      // Apply the general auth middleware for other routes
      next();
      //authMiddleware(req, res, next);
  }*/
};

module.exports = graphQLAuthMiddleware;
