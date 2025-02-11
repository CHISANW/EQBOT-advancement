import { Module } from '@nestjs/common';
// import { MailService } from './mail.service';
import { LoggerModule } from 'src/config/logger/logger.module';
import { MailerModule } from '@nestjs-modules/mailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Config } from 'src/config/environment/config';

@Module({
    imports: [
        LoggerModule,
        // MailerModule.forRootAsync({
        //     useFactory: () => ({
        //         transports: {
        //             [Config.getEnvironment().adminMail.name]:
        //     Config.getEnvironment().adminMail.transport,
        //             [Config.getEnvironment().hrMail.name]:
        //     Config.getEnvironment().hrMail.transport,
        //         } as {
        //   [name: string]: SMTPTransport.Options | string;
        // },
        //     }),
        // }),
    ],
    // providers: [MailService],
    // exports: [MailService],
})
export class MailModule {}
