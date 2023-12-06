import { ExecutionContext, Logger, UnauthorizedException, Request, CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private logger = new Logger(JwtAuthGuard.name);
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        this.logger.log('canActivate() called');
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException('no token');
        try {
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_SECRET_KEY,
            });
            request['userId'] = payload;
        } catch (error) {
            this.logger.error('token error:', error.message);
            if (error.message === 'jwt expired') throw new UnauthorizedException("can't verify token");
            else throw new UnauthorizedException('jwt is invalid');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const tokens = request.headers['cookie']?.split('; ');
        if (!tokens) return undefined;
        for (const token of tokens) {
            if (token.startsWith('access_token=')) return token.split('=')[1];
        }
        return undefined;
    }
}
