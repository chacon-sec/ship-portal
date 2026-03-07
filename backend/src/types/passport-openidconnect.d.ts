declare module 'passport-openidconnect' {
  import { Strategy as PassportStrategy } from 'passport';

  class Strategy extends PassportStrategy {
    constructor(options: any, verify: any);
  }

  export { Strategy };
}
