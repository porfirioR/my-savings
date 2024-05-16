
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventManagerService, UserManagerService } from '../../manager/services';
import webPush from 'web-push';

@Injectable()
export class TasksService {

  constructor(
    private eventManagerService: EventManagerService,
    private readonly userManagerService: UserManagerService,
  ) {}

  @Cron(CronExpression.EVERY_9_HOURS)
  async handleCron(): Promise<void> {
    const events = await this.eventManagerService.getPublicEvents();
    const currentDate = new Date()
    const currentDateEvents = events.filter(x => {
      const date = new Date(x.date)
      return currentDate.getFullYear() === date.getFullYear() && currentDate.getMonth() === date.getMonth() && currentDate.getDate() === date.getDate()
    })
    if (currentDateEvents.length) {
      const webPushToken = await this.userManagerService.getWebPushToken()
      currentDateEvents.forEach(x => {
        webPush.sendNotification(
          webPushToken,
          JSON.stringify({
            notification: {
              title: `My Events: ${x.name}`,
              body: `Description: ${x.description}\nDate: ${x.date}`,
              badge: '/assets/icons/icon-96x96.png',
              icon: '/assets/icons/icon-152x152.png',
              actions: [{
                action: 'explore',
                title: 'Ok'
              }]
            },
          }),
        ).then((log) => {
          console.log('Push notification sent.');
          console.log(log);
        }).catch((error) => {
          console.log(error);
        });

      })
    }
  }
}
