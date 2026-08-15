const openapi = {
  openapi: "3.0.0",
  info: {
    title: "API DOCS",
    version: "1.0.0",
    description: "OpenAPI documentation for travel engine backend",
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: "Local",
    },
  ],
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  security: [{ bearerAuth: [] }],
};

export default openapi;
