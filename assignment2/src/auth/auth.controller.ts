import { Body, Controller, Logger, Post, Res } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';
import { log } from 'console';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(
        private authService: AuthService,
        private userService: UserService,
    ) {}

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Res() res): Promise<void> {
        this.logger.log('endpoint /auth/login called');
        try {
            const newJwt: string = await this.authService.login(loginDto);
            this.logger.debug(loginDto.isSession);
            if (loginDto.isSession === true) {
                res.cookie('access_token', newJwt, { maxAge: 60 * 60 * 24 * 1000 });
            } else {
                res.cookie('access_token', newJwt);
            }
            res.redirect('/');
        } catch (e) {
            this.logger.debug(e);
            res.status(401).send('Login failed');
        }
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto, @Res() res) {
        this.logger.log('endpoint /auth/register called');
        try {
            const newUser = await this.userService.registerUser(registerDto);
            this.logger.log('newUser: ' + newUser.userId);
            res.status(200).send('Register success');
        } catch (e) {
            res.status(409).send('User already exists');
        }
    }

    @Post('checkDuplication')
    async checkDuplication(@Body('id') id: string, @Res() res): Promise<void> {
        this.logger.log('endpoint /auth/checkDuplication called');
        try {
            await this.userService.findUserById(id);
            res.status(409).send('사용할 수 없음');
        } catch (e) {
            res.status(200).send('사용가능');
        }
    }
}
