const { createServer } = require('http');
const next = require('next');
const routes = require('./routes');

class Server {
  constructor() {
    this.app = next({
      dev: process.env.NODE_ENV !== 'production'
    });
    this.handler = routes.getRequestHandler(this.app);
  }

  async start(port) {
    await this.app.prepare();

    createServer(this.handler).listen(port, this.onError)
    console.log(`Listening on localhost:${port}`);
  }

  onError(error) {
    if (error) {
      console.log('Something went wrong...');
      throw error;
    }
  }
}

new Server().start(3000);
