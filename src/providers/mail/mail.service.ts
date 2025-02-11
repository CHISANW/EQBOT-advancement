// import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
// import { Injectable } from '@nestjs/common';
// import { Logger } from '../../config/logger/logger.service';
// import { Attachment } from 'nodemailer/lib/mailer';
//
// @Injectable()
// export class MailService {
//     constructor (
//     private readonly logger: Logger,
//     private readonly mailerService: MailerService,
//     ) {}
//
//     async sendMail (options: {
//     to?:
//       | string
//       | { name: string; address: string }
//       | Array<string | { name: string; address: string }>;
//     transporterName?: string;
//     html?: string;
//     subject: string;
//     attachments?: Attachment[];
//   }) {
//         await this.mailerService.sendMail(options).catch((error) => {
//             this.logger.error(`Sendmail error: , ${error}`);
//         });
//     }
// }
