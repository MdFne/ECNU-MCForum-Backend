const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MCForum API',
      version: '1.0.0',
      description: 'Minecraft 论坛后端 API 文档'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '开发环境'
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'] // 扫描的文件
};

// 生成 Swagger �档
const swaggerSpec = swaggerJSDoc(options);

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};

module.exports = setupSwagger;