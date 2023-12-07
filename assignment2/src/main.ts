import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomExceptionsFilter } from './custom-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new CustomExceptionsFilter());
    await app.listen(3001);
}
bootstrap();
